import { PDFDocument } from 'pdf-lib';
import SemesterPDF from '../models/semesterPDF.model.js';
import pdfParseWrapper from '../utils/pdfParseWrapper.js';

// Helper to extract text from each page using pdf-parse
async function extractPageTexts(pdfBuffer) {
  const data = await pdfParseWrapper(pdfBuffer, { pagerender: (pageData) => pageData.getTextContent() });
  // pdf-parse returns all text, but we want per-page text
  // We'll use pdf-lib to get per-page buffers, then parse each
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageTexts = [];
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    const pageBytes = await newPdf.save();
    const pageText = (await pdfParseWrapper(pageBytes)).text;
    pageTexts.push(pageText);
  }
  return pageTexts;
}

// Upload and split PDF by 'Anna University' header for semester tables
export const uploadAndSplitPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });
    
    // Delete any existing PDFs with the same name
    try {
      const result = await SemesterPDF.deleteMany({ uploadName: req.file.originalname });
      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} existing PDFs for ${req.file.originalname}`);
      }
    } catch (deleteErr) {
      console.error(`Error deleting existing PDFs: ${deleteErr.message}`);
      // Continue with upload even if deletion fails
    }
    
    const pdfBuffer = req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageTexts = await extractPageTexts(pdfBuffer);
    
    // Debug: Log the first few characters of each page's text
    console.log("PDF Page Contents:");
    pageTexts.forEach((text, index) => {
      console.log(`Page ${index + 1}: ${text.substring(0, 100)}...`);
    });
    
    // Define a function to check if a page contains the semester header pattern
    const containsSemesterHeader = (text, pageIndex) => {
      // More flexible institution name detection
      // This checks for common university/college terms instead of a specific name
      const hasInstitutionHeader = /university|college|institute|school|academy|department/i.test(text);
      
      // More flexible semester pattern detection
      // This regex looks for various semester/term formats
      const semesterRegex = /(?:semester|sem|term)\s*([1-8])|([1-8])(?:st|nd|rd|th)?\s*(?:semester|sem|term)|(?:year|yr)\s*([1-4])/i;
      const match = text.match(semesterRegex);
      
      if (match) {
        // Extract the semester number from the match
        const semesterNum = match[1] || match[2] || (match[3] ? parseInt(match[3]) * 2 : null);
        if (semesterNum) {
          return { found: true, semester: parseInt(semesterNum) };
        }
      }
      
      // Look for result-related keywords combined with numbers
      const resultRegex = /result.*?([1-8])|([1-8]).*?result|grade.*?([1-8])|([1-8]).*?grade|mark.*?([1-8])|([1-8]).*?mark/i;
      const resultMatch = text.match(resultRegex);
      
      if (resultMatch) {
        const semNum = resultMatch[1] || resultMatch[2] || resultMatch[3] || resultMatch[4] || resultMatch[5] || resultMatch[6];
        if (semNum) {
          return { found: true, semester: parseInt(semNum) };
        }
      }
      
      // Fallback: If no semester markers are found but we have institution headers
      // This helps when PDFs have university headers but no clear semester markers
      if (hasInstitutionHeader && pageIndex > 0) {
        // Try to infer semester from page number or content structure
        // This is a simple heuristic - adjust based on your PDF structure
        const estimatedSemester = Math.min(8, Math.floor(pageIndex / 3) + 1);
        return { found: true, semester: estimatedSemester, confidence: 'low' };
      }
      
      return false;
    };
    
    // Find pages that contain semester markers
    const semesterStartPages = [];
    
    for (let i = 0; i < pageTexts.length; i++) {
      // Check if this page contains the semester header pattern
      const headerCheck = containsSemesterHeader(pageTexts[i], i);
      
      if (headerCheck && headerCheck.found) {
        // This is a semester start page with a specific semester number
        semesterStartPages.push({ 
          page: i, 
          semester: headerCheck.semester,
          confidence: headerCheck.confidence || 'high'
        });
        console.log(`Found semester ${headerCheck.semester} start page at page ${i} (confidence: ${headerCheck.confidence || 'high'})`);
      }
    }
    
    // If we didn't find any semester markers, use a simple page-based approach
    if (semesterStartPages.length === 0) {
      console.log("No semester markers found. Using page-based splitting as fallback.");
      
      // Simple fallback: Split into equal sections or by page count
      const totalPages = pageTexts.length;
      const maxSemesters = Math.min(8, totalPages); // Maximum 8 semesters or fewer if not enough pages
      
      // Calculate pages per semester (at least 1 page per semester)
      const pagesPerSemester = Math.max(1, Math.floor(totalPages / maxSemesters));
      
      for (let sem = 1; sem <= maxSemesters; sem++) {
        const startPage = (sem - 1) * pagesPerSemester;
        semesterStartPages.push({
          page: startPage,
          semester: sem,
          confidence: 'fallback'
        });
        console.log(`Fallback: Assigned semester ${sem} to start at page ${startPage}`);
      }
    }
    
    // Sort the semester pages by semester number to ensure correct order
    semesterStartPages.sort((a, b) => a.semester - b.semester);
    
    // If we didn't find any semester markers, return an error
    if (semesterStartPages.length === 0) {
      return res.status(400).json({ 
        message: 'Could not identify semester sections in the PDF. Please ensure the PDF contains the Anna University header along with specific semester numbers (like "Semester 1", "1st SEMESTER", etc.).' 
      });
    }
    
    // Sort the semester pages by semester number to ensure correct order
    semesterStartPages.sort((a, b) => a.semester - b.semester);
    
    // Log the number of semesters found
    console.log(`Found ${semesterStartPages.length} semester sections in the PDF`);
    if (semesterStartPages.length < 8) {
      console.warn(`Warning: Expected 8 semesters but only found ${semesterStartPages.length}`);
    }
    
    // Group pages by semester
    const semesterGroups = [];
    
    // For each identified semester start page
    for (let i = 0; i < semesterStartPages.length; i++) {
      const startPage = semesterStartPages[i].page;
      const endPage = (i < semesterStartPages.length - 1) 
        ? semesterStartPages[i + 1].page - 1 
        : pdfDoc.getPageCount() - 1;
      
      // Create a group of pages for this semester
      const pageGroup = [];
      for (let pg = startPage; pg <= endPage; pg++) {
        pageGroup.push(pg);
      }
      
      semesterGroups.push({
        semester: semesterStartPages[i].semester,
        pages: pageGroup
      });
    }
    
    // Save each semester group as a PDF
    const semesterPDFs = [];
    for (const group of semesterGroups) {
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, group.pages);
      pages.forEach((p) => newPdf.addPage(p));
      const pdfBytes = await newPdf.save();
      
      const semesterDoc = await SemesterPDF.create({
        uploadName: req.file.originalname,
        semester: group.semester,
        pdf: Buffer.from(pdfBytes)
      });
      
      semesterPDFs.push(semesterDoc);
    }
    // Return the response with PDF IDs
    res.status(201).json({ 
      message: 'PDF split and saved', 
      uploadName: req.file.originalname, 
      ids: semesterPDFs.map(doc => doc._id),
      autoDeleteScheduled: true
    });
    
    // Schedule automatic deletion after processing
     // Get auto-delete time from request or use default (1 hour)
     const autoDeleteHours = req.body.autoDeleteHours || 1;
     const deleteAfterMs = autoDeleteHours * 60 * 60 * 1000;
     
     console.log(`Scheduling auto-delete for ${req.file.originalname} after ${autoDeleteHours} hour(s)`);
     
     setTimeout(async () => {
       try {
         const result = await SemesterPDF.deleteMany({ uploadName: req.file.originalname });
         console.log(`Auto-deleted ${result.deletedCount} semester PDFs for upload: ${req.file.originalname}`);
       } catch (err) {
         console.error(`Failed to auto-delete PDFs for ${req.file.originalname}:`, err);
       }
     }, deleteAfterMs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to split PDF', error: err.message });
  }
};

// List semester PDFs for an upload
export const getSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const pdfs = await SemesterPDF.find({ uploadName: uploadId });
    res.json(pdfs.map(pdf => ({ id: pdf._id, semester: pdf.semester })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch PDFs' });
  }
};

// Download a specific semester PDF
export const downloadSemesterPDF = async (req, res) => {
  try {
    const { uploadId, semester } = req.params;
    const pdfDoc = await SemesterPDF.findOne({ uploadName: uploadId, semester: Number(semester) });
    if (!pdfDoc) return res.status(404).json({ message: 'PDF not found' });
    res.set('Content-Type', 'application/pdf');
    res.send(pdfDoc.pdf);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download PDF' });
  }
};

// Delete all semester PDFs for an upload
export const deleteSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    await SemesterPDF.deleteMany({ uploadName: uploadId });
    res.json({ message: 'All semester PDFs deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete PDFs' });
  }
};

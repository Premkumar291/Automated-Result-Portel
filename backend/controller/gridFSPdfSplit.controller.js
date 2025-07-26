import { PDFDocument } from 'pdf-lib';
import { getGridFSBucket, upload } from '../utils/gridfsConfig.js';
import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import pdfParseWrapper from '../utils/pdfParseWrapper.js';
import mongoose from 'mongoose';
import { Readable } from 'stream';

// Define valid confidence levels for PDF splitting
const validConfidenceLevels = {
  'high': ['high'],
  'medium': ['high', 'medium'],
  'low': ['high', 'medium', 'low', 'fallback']
};

// Helper to extract text from each page using pdf-parse
async function extractPageTexts(pdfBuffer) {
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

// Helper to save a buffer to GridFS
async function saveToGridFS(buffer, filename, metadata) {
  return new Promise((resolve, reject) => {
    const gridFSBucket = getGridFSBucket();
     if (!gridFSBucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }
    
    // Ensure filename has .pdf extension
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata
    });
    
    // Store the file ID before piping
    const fileId = uploadStream.id;

    readableStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      // Create a file object with the necessary properties
      resolve({
        _id: fileId,
        filename: filename,
        metadata: metadata
      });
    });
  });
}

// Upload and split PDF by semester markers
export const uploadAndSplitPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });
    
    // Add a timestamp to make the uploadName unique
    const uniqueUploadName = `${req.file.originalname}_${Date.now()}`;
    
    // Delete any existing PDFs with the same name
    try {
      // First get all existing GridFS files for this upload
      const existingMetadata = await GridFSSemesterPDF.find({ uploadName: uniqueUploadName });
      
      // Delete each file from GridFS
      const gridFSBucket = getGridFSBucket();
      for (const metadata of existingMetadata) {
        try {
          await gridFSBucket.delete(metadata.fileId);
        } catch (err) {
          console.log(`Could not delete file ${metadata.fileId}: ${err.message}`);
          // Continue with other deletions
        }
      }
      
      // Delete all metadata records
      const result = await GridFSSemesterPDF.deleteMany({ uploadName: uniqueUploadName });
      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} existing PDFs for ${uniqueUploadName}`);
      }
    } catch (deleteErr) {
      console.error(`Error deleting existing PDFs: ${deleteErr.message}`);
      // Continue with upload even if deletion fails
    }
    
    const pdfBuffer = req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageTexts = await extractPageTexts(pdfBuffer);
    
    // Debug mode from query parameter
    const debugMode = req.query.debug === 'true';
    
    // Log page contents in debug mode
    if (debugMode) {
      console.log("PDF Page Contents (Full):");
      pageTexts.forEach((text, index) => {
        console.log(`Page ${index + 1} Full Text: ${text}`);
      });
    }
    
    // Log first 100 characters of each page
    pageTexts.forEach((text, index) => {
      console.log(`Page ${index + 1}: ${text.substring(0, 100)}...`);
    });
    
    // Define a function to check if a page contains the semester header pattern
    const containsSemesterHeader = (text, pageIndex) => {
      // Look specifically for "Semester No. : XX" pattern
      const semesterNoPattern = /semester\s*no\.?\s*:\s*(0?[1-8])/i;
      const semesterMatch = text.match(semesterNoPattern);
      
      if (semesterMatch) {
        // Extract the semester number from the match
        const semesterNum = semesterMatch[1];
        // Convert to integer, removing leading zero if present
        const semNum = parseInt(semesterNum, 10);
        if (semNum >= 1 && semNum <= 8) {
          return { found: true, semester: semNum, confidence: 'high' };
        }
      }
      
      // Fallback: Use a simple page-based approach if no semester markers are found
      // This will only be used if forcePageSplit is true or no semester markers are found
      return { found: false };
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
    // Get force page split option from request
    const forcePageSplit = req.body.forcePageSplit === 'true';
    
    // Use it to decide splitting method
    if (forcePageSplit || semesterStartPages.length === 0) {
      console.log(forcePageSplit ? "Forced page-based splitting." : "No semester markers found. Using page-based splitting as fallback.");
      
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
    
    // Always use high confidence threshold (0.8)
    const confidenceThreshold = 'high';
    console.log(`Using confidence threshold: ${confidenceThreshold} (fixed value: 0.8)`);
    
    // Filter semester start pages based on confidence threshold
    const filteredSemesterStartPages = semesterStartPages.filter(page => 
      validConfidenceLevels[confidenceThreshold].includes(page.confidence || 'high')
    );
    
    // If we didn't find any semester markers after filtering, return an error
    if (filteredSemesterStartPages.length === 0) {
      return res.status(400).json({ 
        message: 'Could not identify semester sections in the PDF with the requested confidence level. Please try again with a lower confidence threshold or ensure the PDF contains clear semester markers.' 
      });
    }
    
    // Use the filtered semester pages for further processing
    const processedSemesterStartPages = filteredSemesterStartPages;
    
    // Sort the semester pages by semester number to ensure correct order
    processedSemesterStartPages.sort((a, b) => a.semester - b.semester);
    
    // Log the number of semesters found
    console.log(`Found ${processedSemesterStartPages.length} semester sections in the PDF`);
    if (processedSemesterStartPages.length < 8) {
      console.warn(`Warning: Expected 8 semesters but only found ${processedSemesterStartPages.length}`);
    }
    
    // Group pages by semester
    const semesterGroups = [];
    
    // For each identified semester start page
    for (let i = 0; i < processedSemesterStartPages.length; i++) {
      const startPage = processedSemesterStartPages[i].page;
      const endPage = (i < processedSemesterStartPages.length - 1) 
        ? processedSemesterStartPages[i + 1].page - 1 
        : pdfDoc.getPageCount() - 1;
      
      // Create a group of pages for this semester
      const pageGroup = [];
      for (let pg = startPage; pg <= endPage; pg++) {
        pageGroup.push(pg);
      }
      
      semesterGroups.push({
        semester: processedSemesterStartPages[i].semester,
        pages: pageGroup
      });
    }
    
    // Save each semester group as a PDF in GridFS
    const semesterPDFs = [];
    
    // Get auto-delete time from request or use default (1 hour)
    const autoDeleteHours = req.body.autoDeleteHours || 1;
    const deleteAt = new Date(Date.now() + (autoDeleteHours * 60 * 60 * 1000));
    
    // First save the original PDF to GridFS
    const originalPdfFile = await saveToGridFS(
      pdfBuffer,
      `original_${uniqueUploadName}`,
      { 
        originalName: req.file.originalname,
        type: 'original',
        uploadDate: new Date()
      }
    );
    
    // Check if a record already exists for this upload and semester
    let originalPdfMetadata = await GridFSSemesterPDF.findOne({
      uploadName: uniqueUploadName,
      semester: 1 // Changed from 0 to 1 to meet the validation constraint
    });
    
    if (originalPdfMetadata) {
      // Update existing record
      originalPdfMetadata.fileId = originalPdfFile._id;
      originalPdfMetadata.filename = originalPdfFile.filename;
      originalPdfMetadata.deleteAt = deleteAt;
      await originalPdfMetadata.save();
    } else {
      // Create new record
      originalPdfMetadata = await GridFSSemesterPDF.create({
        uploadName: uniqueUploadName,
        semester: 1,
        fileId: originalPdfFile._id,
        filename: originalPdfFile.filename,
        deleteAt
      });
    }
    
    // Now save each semester PDF
    for (const group of semesterGroups) {
      // Create a new PDF with just the pages for this semester
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, group.pages);
      pages.forEach((p) => newPdf.addPage(p));
      const pdfBytes = await newPdf.save();
      
      // Format semester number with leading zero if needed
      const semesterFormatted = group.semester.toString().padStart(2, '0');
      const semesterFilename = `Semester_${semesterFormatted}_${uniqueUploadName}`;
      
      // Save the semester PDF to GridFS
      const file = await saveToGridFS(
        Buffer.from(pdfBytes),
        semesterFilename,
        { 
          originalName: req.file.originalname,
          semester: group.semester,
          type: 'semester',
          uploadDate: new Date()
        }
      );
      
      // Check if a record already exists for this upload and semester
      let semesterDoc = await GridFSSemesterPDF.findOne({
        uploadName: uniqueUploadName,
        semester: group.semester
      });
      
      if (semesterDoc) {
        // Update existing record
        semesterDoc.fileId = file._id;
        semesterDoc.filename = file.filename;
        semesterDoc.deleteAt = deleteAt;
        await semesterDoc.save();
      } else {
        // Create new record
        semesterDoc = await GridFSSemesterPDF.create({
          uploadName: uniqueUploadName,
          semester: group.semester,
          fileId: file._id,
          filename: file.filename,
          deleteAt
        });
      }
      
      semesterPDFs.push({
        id: semesterDoc._id,
        semester: semesterDoc.semester,
        filename: semesterDoc.filename
      });
    }
    
    // Return the response with PDF IDs
    res.status(201).json({ 
      message: 'PDF split and saved', 
      uploadName: uniqueUploadName,
      ids: semesterPDFs.map(doc => doc.id),
      autoDeleteScheduled: true,
      deleteAt
    });
    
    console.log(`Scheduling auto-delete for ${uniqueUploadName} after ${autoDeleteHours} hour(s)`);
    
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: 'Duplicate entry detected. A record with this combination of upload name and semester already exists.',
        error: err.message,
        duplicateKey: err.keyValue
      });
    }
    
    res.status(500).json({ message: 'Failed to split PDF', error: err.message });
  }
};

// List semester PDFs for an upload
export const getSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const pdfs = await GridFSSemesterPDF.find({ 
      uploadName: uploadId,
      semester: { $gt: 0 } // Exclude the original file (semester 0)
    }).sort({ semester: 1 });
    
    res.json(pdfs.map(pdf => ({ 
      id: pdf._id, 
      semester: pdf.semester,
      filename: pdf.filename
    })));
  } catch (err) {
    console.error('Error fetching semester PDFs:', err);
    res.status(500).json({ message: 'Failed to fetch PDFs', error: err.message });
  }
};

// Download a specific semester PDF by ID
export const downloadSemesterPDFById = async (req, res) => {
  try {
    const { id } = req.params;
    const forceDownload = req.query.download === 'true';
    
    // Find the metadata record
    const pdfMetadata = await GridFSSemesterPDF.findById(id);
    if (!pdfMetadata) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Get the file from GridFS
    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(pdfMetadata.fileId);
    
    // Ensure filename has .pdf extension
    let filename = pdfMetadata.filename;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }
    
    // Set headers with explicit MIME type
    res.set('Content-Type', 'application/pdf');
    
    // Set content disposition based on whether it's a download or view
    if (forceDownload) {
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.set('Content-Disposition', `inline; filename="${filename}"`);
    }
    
    // Pipe the file to the response
    downloadStream.pipe(res);
    
    // Handle errors
    downloadStream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming PDF', error: error.message });
      }
    });
    
  } catch (err) {
    console.error('Error downloading PDF:', err);
    res.status(500).json({ message: 'Failed to download PDF', error: err.message });
  }
};

// Download a specific semester PDF by upload name and semester number
export const downloadSemesterPDF = async (req, res) => {
  try {
    const { uploadId, semester } = req.params;
    const forceDownload = req.query.download === 'true';
    
    // Find the metadata record
    const pdfMetadata = await GridFSSemesterPDF.findOne({ 
      uploadName: uploadId, 
      semester: Number(semester)
    });
    
    if (!pdfMetadata) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Get the file from GridFS
    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(pdfMetadata.fileId);
    
    // Ensure filename has .pdf extension
    let filename = pdfMetadata.filename;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }
    
    // Set headers with explicit MIME type
    res.set('Content-Type', 'application/pdf');
    
    // Set content disposition based on whether it's a download or view
    if (forceDownload) {
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.set('Content-Disposition', `inline; filename="${filename}"`);
    }
    
    // Pipe the file to the response
    downloadStream.pipe(res);
    
    // Handle errors
    downloadStream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming PDF', error: error.message });
      }
    });
    
  } catch (err) {
    console.error('Error downloading PDF:', err);
    res.status(500).json({ message: 'Failed to download PDF', error: err.message });
  }
};

// Delete all semester PDFs for an upload
export const deleteSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Find all metadata records for this upload
    const pdfMetadata = await GridFSSemesterPDF.find({ uploadName: uploadId });
    
    if (pdfMetadata.length === 0) {
      return res.status(404).json({ message: 'No PDFs found for this upload' });
    }
    
    // Delete each file from GridFS
    const gridFSBucket = getGridFSBucket();
    for (const metadata of pdfMetadata) {
      await gridFSBucket.delete(metadata.fileId);
    }
    
    // Delete all metadata records
    await GridFSSemesterPDF.deleteMany({ uploadName: uploadId });
    
    res.json({ 
      message: 'All semester PDFs deleted',
      count: pdfMetadata.length
    });
  } catch (err) {
    console.error('Error deleting PDFs:', err);
    res.status(500).json({ message: 'Failed to delete PDFs', error: err.message });
  }
};

// Get the most recent PDFs
export const getRecentPDFs = async (req, res) => {
  try {
    // Find the most recent upload by sorting on createdAt in descending order
    const mostRecentUpload = await GridFSSemesterPDF.findOne({})
      .sort({ createdAt: -1 })
      .select('uploadName');
    
    if (!mostRecentUpload) {
      return res.json({ 
        message: 'No PDFs found',
        pdfs: []
      });
    }
    
    // Get all PDFs for this upload
    const pdfs = await GridFSSemesterPDF.find({ 
      uploadName: mostRecentUpload.uploadName,
      semester: { $gt: 0 } // Exclude the original file (semester 0)
    }).sort({ semester: 1 });
    
    res.json({
      uploadName: mostRecentUpload.uploadName,
      pdfs: pdfs.map(pdf => ({ 
        id: pdf._id, 
        semester: pdf.semester,
        filename: pdf.filename
      }))
    });
  } catch (err) {
    console.error('Error fetching recent PDFs:', err);
    res.status(500).json({ message: 'Failed to fetch recent PDFs', error: err.message });
  }
};

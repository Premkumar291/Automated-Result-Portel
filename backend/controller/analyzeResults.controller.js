import { getGridFSBucket } from '../utils/gridfsConfig.js';
import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import pdfParseWrapper from '../utils/pdfParseWrapper.js';
import mongoose from 'mongoose';
import { PDFDocument } from 'pdf-lib';

// Analyze PDF and extract subject codes and student data
export const analyzePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query; // Optional page parameter for analyzing specific pages
    
    // Find the metadata record
    const pdfMetadata = await GridFSSemesterPDF.findById(id);
    if (!pdfMetadata) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Get the file from GridFS
    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(pdfMetadata.fileId);
    
    // Read the file into a buffer
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // If a specific page is requested, extract just that page
    let textToAnalyze;
    let pageCount;
    
    if (page) {
      const pageNum = parseInt(page, 10);
      const pageData = await extractSpecificPage(buffer, pageNum);
      textToAnalyze = pageData.text;
      pageCount = pageData.pageCount;
    } else {
      // Parse the entire PDF
      const pdfData = await pdfParseWrapper(buffer);
      textToAnalyze = pdfData.text;
      pageCount = pdfData.numpages;
    }
    
    // Debugging: Log raw text for inspection
    console.log('Debug: Raw textToAnalyze:', textToAnalyze);
    console.log('Debug: Page count:', pageCount);
    
    // Extract subject codes and student data
    const result = extractStudentDataAndSubjects(textToAnalyze);
    
    // Add metadata to the response
    result.metadata = {
      filename: pdfMetadata.uploadName,
      semester: pdfMetadata.semester,
      pageCount: pageCount,
      analyzedPage: page ? parseInt(page, 10) : null,
      uploadDate: pdfMetadata.uploadDate
    };
    
    // Debugging: Log final result summary
    console.log('Debug: Total students parsed:', result.students.length);
    console.log('Debug: Subject codes detected:', result.subjectCodes);
    
    res.json(result);
  } catch (err) {
    console.error('Error analyzing PDF:', err);
    res.status(500).json({ message: 'Failed to analyze PDF', error: err.message });
  }
};

// Helper function to extract a specific page from a PDF buffer
async function extractSpecificPage(pdfBuffer, pageNum) {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Validate page number
    if (pageNum < 1 || pageNum > pageCount) {
      throw new Error(`Invalid page number. PDF has ${pageCount} pages.`);
    }
    
    // Create a new PDF with just the requested page
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]); // Convert to 0-indexed
    newPdf.addPage(copiedPage);
    
    // Save the new PDF and parse it
    const pageBytes = await newPdf.save();
    const pageData = await pdfParseWrapper(pageBytes);
    
    // Debugging: Log extracted page info
    console.log('Debug: Extracted page text:', pageData.text);
    
    return {
      text: pageData.text,
      pageCount: pageCount
    };
  } catch (error) {
    console.error('Error extracting page:', error);
    throw error;
  }
}

// Helper function to extract subject codes and student data from PDF text
function extractStudentDataAndSubjects(text) {
  // Split the text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

  // Debugging: Log line count and sample lines
  console.log('Debug: Total lines extracted:', lines.length);
  console.log('Debug: First 10 lines:', lines.slice(0, 10));

  // Find and extract concatenated subject codes (dynamic count)
  let subjectCodes = [];
  let subjectNames = {}; // Keeping for compatibility; enhance if needed
  const subjectLine = lines.find(line => line.toLowerCase().includes('subject code'));
  if (subjectLine) {
    // Directly match all codes in the line (robust to spaces around " - >")
    const codeMatches = subjectLine.match(/[A-Z]{2,}\d{4}/g);
    if (codeMatches) {
      subjectCodes = codeMatches;
    }
  }

  // Debugging: Log subject detection
  console.log('Debug: Detected subject line:', subjectLine || 'None');
  console.log('Debug: Extracted subject codes:', subjectCodes);

  if (subjectCodes.length === 0) {
    return {
      students: [],
      subjectCodes: [],
      subjectNames: {},
      error: 'Could not find subject codes in the PDF'
    };
  }

  // Define possible grade patterns (handles 1-4 char grades like "O", "A+", "U", "WH1")
  const gradePattern = 'O|A\\+|A|B\\+|B|C|U|P|F|I|WH\\d*';
  const trailingGradesRegex = new RegExp(`(${gradePattern})+$`, 'g'); // Matches consecutive grades at the end

  // Extract students from lines that start with 12-digit regNo
  const students = [];
  lines.forEach(line => {
    const regNoMatch = line.match(/^(\d{12})/);
    if (regNoMatch) {
      const regNo = regNoMatch[1];
      const rest = line.substring(12).trim(); // Everything after regNo

      // Find the trailing consecutive grades sequence
      const trailingMatch = rest.match(trailingGradesRegex);
      if (!trailingMatch) return; // Skip if no trailing grades

      const gradesString = trailingMatch[0]; // The clumped grades (e.g., "OAA+B+OOA+OA")

      // Parse individual grades from gradesString
      const extractedGrades = gradesString.match(new RegExp(gradePattern, 'g')) || [];
      if (extractedGrades.length === 0) return;

      // Cap at subjectCodes.length (handles partial/excess)
      const cappedGrades = extractedGrades.slice(0, subjectCodes.length);

      // Name is everything before the trailing gradesString
      const gradesStartIndex = rest.lastIndexOf(gradesString);
      let name = rest.substring(0, gradesStartIndex).trim();

      // Fallback if index not found (rare, but clean up)
      if (gradesStartIndex < 0) {
        name = rest.replace(gradesString, '').trim();
      }

      // Map grades to subjects (dynamic, handles partial)
      const grades = {};
      const gradePoints = {};
      cappedGrades.forEach((grade, index) => {
        const subject = subjectCodes[index];
        if (subject) {
          grades[subject] = grade;
          gradePoints[subject] = calculateGradePoints(grade);
        }
      });

      // Calculate GPA based on actual collected grades
      const collectedGradesCount = Object.keys(gradePoints).length;
      if (collectedGradesCount > 0) {
        const totalPoints = Object.values(gradePoints).reduce((sum, points) => sum + points, 0);
        const gpa = totalPoints / collectedGradesCount;

        students.push({
          regNo,
          name,
          grades,
          gradePoints,
          gpa: parseFloat(gpa.toFixed(2))
        });
      }

      // Debugging: Log each parsed student (limit to first few for brevity)
      if (students.length <= 5) {
        console.log('Debug: Parsed student:', { regNo, name, cappedGrades, gradesString });
      }
    }
  });

  // Debugging: Log total students and a sample
  console.log('Debug: Total students extracted:', students.length);
  console.log('Debug: Sample student (first one):', students[0] || 'None');

  return {
    students,
    subjectCodes,
    subjectNames
  };
}

// Helper function to calculate grade points
function calculateGradePoints(grade) {
  const gradePointMap = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
    'U': 0,
    'I': 0, // Inadequate attendance
    'WH1': 0 // Example for withheld; add more if needed
  };
  
  return gradePointMap[grade] || 0;
}

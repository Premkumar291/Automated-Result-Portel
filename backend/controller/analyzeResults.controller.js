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
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Find the subject header line (contains subject codes)
  let subjectHeaderIndex = -1;
  let subjectCodes = [];
  let subjectNames = {};
  
  // Look for a line that likely contains subject codes (typically uppercase with numbers)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Subject codes typically follow a pattern like CS3351, CS3352, etc.
    const subjectCodeMatches = line.match(/[A-Z]{2,}\d{4}/g);
    
    if (subjectCodeMatches && subjectCodeMatches.length > 1) {
      subjectHeaderIndex = i;
      subjectCodes = subjectCodeMatches;
      
      // Try to extract subject names from nearby lines
      // This is a simplification - actual implementation may need more robust parsing
      if (i > 0) {
        const prevLine = lines[i-1].trim();
        // Check if previous line might contain subject names
        if (prevLine.length > 0 && !prevLine.match(/[A-Z]{2,}\d{4}/)) {
          // Split the line by spaces or tabs and try to match with subject codes
          const possibleNames = prevLine.split(/\s{2,}|\t/).filter(item => item.trim() !== '');
          if (possibleNames.length === subjectCodes.length) {
            for (let j = 0; j < subjectCodes.length; j++) {
              subjectNames[subjectCodes[j]] = possibleNames[j].trim();
            }
          }
        }
      }
      
      break;
    }
  }
  
  if (subjectHeaderIndex === -1 || subjectCodes.length === 0) {
    // Return empty result instead of throwing error
    return {
      students: [],
      subjectCodes: [],
      subjectNames: {},
      error: 'Could not find subject codes in the PDF'
    };
  }
  
  // Extract student data from lines after the subject header
  const students = [];
  const regNoPattern = /\d{12}/; // Pattern for registration number (12 digits)
  
  for (let i = subjectHeaderIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const regNoMatch = line.match(regNoPattern);
    
    if (regNoMatch) {
      const regNo = regNoMatch[0];
      
      // Extract student name (typically follows the reg no)
      const lineAfterRegNo = line.substring(line.indexOf(regNo) + regNo.length).trim();
      let name = '';
      
      // Name is typically the text before the grades
      // This is a simplification - actual implementation may need more robust parsing
      const nameEndIndex = lineAfterRegNo.search(/[A-Z]\+?|[A-Z]|U/);
      if (nameEndIndex > 0) {
        name = lineAfterRegNo.substring(0, nameEndIndex).trim();
      }
      
      // Extract grades for each subject
      const grades = {};
      const gradePoints = {};
      
      // Extract grades from the line
      const gradeMatches = lineAfterRegNo.match(/[A-Z]\+?|[A-Z]|U/g);
      
      if (gradeMatches && gradeMatches.length >= subjectCodes.length) {
        for (let j = 0; j < subjectCodes.length; j++) {
          const grade = gradeMatches[j];
          grades[subjectCodes[j]] = grade;
          
          // Calculate grade points
          gradePoints[subjectCodes[j]] = calculateGradePoints(grade);
        }
        
        // Calculate GPA
        const totalPoints = Object.values(gradePoints).reduce((sum, points) => sum + points, 0);
        const gpa = totalPoints / subjectCodes.length;
        
        students.push({
          regNo,
          name,
          grades,
          gradePoints,
          gpa: parseFloat(gpa.toFixed(2))
        });
      }
    }
  }
  
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
    'U': 0
  };
  
  return gradePointMap[grade] || 0;
}
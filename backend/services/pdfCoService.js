import axios from 'axios';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Service for interacting with PDF.co API
 * Provides methods for uploading PDFs and converting them to CSV/JSON
 */

/**
 * Uploads a PDF file to PDF.co service
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @param {string} fileName - Original filename for reference
 * @returns {Promise<Object>} Response containing the URL to the uploaded file
 */
export const uploadPdfToPdfCo = async (fileBuffer, fileName) => {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    
    // Make the API request to PDF.co
    const response = await axios.post(
      'https://api.pdf.co/v1/file/upload',
      formData,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Check for successful response
    if (!response.data || !response.data.url) {
      throw new ApiError('Failed to upload PDF to PDF.co service', 500);
    }

    return response.data;
  } catch (error) {
    console.error('PDF.co upload error:', error.response?.data || error.message);
    throw new ApiError(
      `PDF.co upload failed: ${error.response?.data?.message || error.message}`,
      error.response?.status || 500
    );
  }
};

/**
 * Converts a PDF to CSV format using PDF.co service
 * @param {string} pdfUrl - URL of the PDF file (from uploadPdfToPdfCo)
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} CSV content as string
 */
export const convertPdfToCsv = async (pdfUrl, options = {}) => {
  try {
    const requestData = {
      url: pdfUrl,
      inline: true,
      ...options
    };

    // Make the API request to convert PDF to CSV
    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/convert/to/csv',
      requestData,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check for successful response
    if (!response.data || !response.data.body) {
      throw new ApiError('Failed to convert PDF to CSV', 500);
    }
    
    // Log CSV content for debugging
    console.log('\n===== CSV CONTENT FROM PDF.CO =====');
    console.log(response.data.body.substring(0, 1000) + '...');
    console.log('===== END CSV CONTENT =====\n');

    return response.data.body;
  } catch (error) {
    console.error('PDF.co conversion error:', error.response?.data || error.message);
    throw new ApiError(
      `PDF.co conversion failed: ${error.response?.data?.message || error.message}`,
      error.response?.status || 500
    );
  }
};

/**
 * Parses CSV data into structured JSON format for result analysis
 * @param {string} csvData - CSV data from PDF.co conversion
 * @returns {Array} Structured student results data
 */
export const parseCsvToResultJson = (csvData) => {
  try {
    // Log the raw CSV data
    console.log('\n===== PARSING CSV TO JSON =====');
    console.log('CSV Data Length:', csvData.length, 'characters');
    
    // Preprocess lines
    const lines = csvData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('"'));
    
    console.log('Filtered Lines Count:', lines.length);
    console.log('First 3 lines sample:');
    lines.slice(0, 3).forEach((line, i) => console.log(`Line ${i+1}:`, line));

    // Identify subject code rows
    let subjectCodeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Subject Code')) {
        subjectCodeLineIndex = i;
        console.log('Found Subject Code at line index:', i);
        console.log('Subject Code Line:', lines[i]);
        break;
      }
    }

    // Extract and clean subject codes
    let subjectCodes = [];
    if (subjectCodeLineIndex !== -1 && lines.length > subjectCodeLineIndex + 1) {
      const codeNames = lines[subjectCodeLineIndex].split(',').slice(4).map(s => s.replace(/"/g, '').trim());
      const codeNumbers = lines[subjectCodeLineIndex + 1].split(',').slice(4).map(s => s.replace(/"/g, '').trim());
      
      console.log('Code Names:', codeNames);
      console.log('Code Numbers:', codeNumbers);

      for (let i = 0; i < codeNames.length; i++) {
        const name = (codeNames[i] || '').replace(/Grade$/i, '').trim(); // remove 'Grade' if present
        const num = (codeNumbers[i] || '').replace(/Grade$/i, '').trim(); // just in case it's here too
        const code = name + num;
        if (code) subjectCodes.push(code);
      }
      
      console.log('Extracted Subject Codes:', subjectCodes);
    }

    // Extract student data
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());

      // Check for valid student entry
      if (/^\d{12}$/.test(parts[1]) && parts[2]) {
        const regNo = parts[1];
        const name = parts[2];
        let grades = parts.slice(4);

        // Merge continuation lines
        while (grades.length < subjectCodes.length && i + 1 < lines.length) {
          const nextParts = lines[i + 1].split(',').map(p => p.replace(/"/g, '').trim());
          if (!/^\d{12}$/.test(nextParts[1])) {
            grades = grades.concat(nextParts.slice(4));
            i++;
          } else {
            break;
          }
        }

        // Build subject-grade mapping
        const subjectGrades = {};
        const gradePoints = {};
        
        subjectCodes.forEach((code, idx) => {
          const grade = grades[idx] || "";
          subjectGrades[code] = grade;
          
          // Calculate grade points using the existing function
          gradePoints[code] = calculateGradePoints(grade);
        });
        
        // Calculate GPA
        const validGradePoints = Object.values(gradePoints).filter(points => points > 0);
        const gpa = validGradePoints.length > 0 
          ? validGradePoints.reduce((sum, points) => sum + points, 0) / validGradePoints.length 
          : 0;

        results.push({
          regNo,
          name,
          grades: subjectGrades,
          gradePoints,
          gpa: parseFloat(gpa.toFixed(2))
        });
      }
    }

    // Create the final result object
    const resultJson = {
      students: results,
      subjectCodes
    };
    
    // Log the final JSON result
    console.log('\n===== FINAL JSON RESULT =====');
    console.log('Students Count:', results.length);
    console.log('Subject Codes Count:', subjectCodes.length);
    if (results.length > 0) {
      console.log('Sample Student Data:', JSON.stringify(results[0], null, 2));
    }
    console.log('===== END JSON RESULT =====\n');
    
    return resultJson;
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new ApiError(`Failed to parse CSV data: ${error.message}`, 500);
  }
};

// Helper function to calculate grade points (copied from analyzeResults.controller.js)
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
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Sends a request to the backend API to analyze a PDF document using PDF.co
 * for improved accuracy in text extraction and table recognition
 * 
 * @param {string} pdfId - The unique identifier of the PDF to analyze
 * @param {number|string} [page] - Optional page number to analyze a specific page
 * @returns {Promise<Object>} - A promise that resolves to the analysis data containing:
 *   - students: Array of student records extracted from the PDF
 *   - subjectCodes: Array of subject codes found in the PDF
 *   - Other metadata related to the PDF analysis
 * @throws {Error} If the API request fails
 */
export const analyzePDFWithPdfCo = async (pdfId, page) => {
  try {
    console.log('===== FRONTEND: STARTING PDF.CO ANALYSIS =====');
    console.log(`Requesting analysis for PDF ID: ${pdfId}${page ? `, Page: ${page}` : ''}`);
    
    const url = page
      ? `${API_URL}/analyze/upload/${pdfId}?page=${page}`
      : `${API_URL}/analyze/upload/${pdfId}`;
    
    console.log('Making API request to:', url);
    const startTime = performance.now();
    
    const response = await axios.get(url);
    
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`===== FRONTEND: PDF.CO ANALYSIS COMPLETE (${processingTime}s) =====`);
    console.log('Analysis results summary:');
    console.log(`- Students found: ${response.data.students.length}`);
    console.log(`- Subject codes found: ${response.data.subjectCodes.length}`);
    console.log(`- Processing method: ${response.data.metadata?.processingMethod || 'unknown'}`);
    
    return response.data;
  } catch (error) {
    console.error('===== FRONTEND: PDF.CO ANALYSIS ERROR =====');
    console.error('Error analyzing PDF with PDF.co:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};
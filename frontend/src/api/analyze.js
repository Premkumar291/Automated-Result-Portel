import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Sends a request to the backend API to analyze a PDF document
 * 
 * @param {string} pdfId - The unique identifier of the PDF to analyze
 * @param {number|string} [page] - Optional page number to analyze a specific page
 * @returns {Promise<Object>} - A promise that resolves to the analysis data containing:
 *   - students: Array of student records extracted from the PDF
 *   - subjectCodes: Array of subject codes found in the PDF
 *   - Other metadata related to the PDF analysis
 * @throws {Error} If the API request fails
 */
export const analyzePDF = async (pdfId, page) => {
  try {
    const url = page
      ? `${API_URL}/analyze/upload/${pdfId}?page=${page}`
      : `${API_URL}/analyze/upload/${pdfId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw error;
  }
};
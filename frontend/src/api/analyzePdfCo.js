import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


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
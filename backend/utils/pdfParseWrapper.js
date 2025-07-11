import pdfParse from 'pdf-parse';

// Custom wrapper for pdf-parse to avoid test file issues
const pdfParseWrapper = async (dataBuffer, options = {}) => {
  try {
    return await pdfParse(dataBuffer, options);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

export default pdfParseWrapper;
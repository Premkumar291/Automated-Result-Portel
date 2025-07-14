import pdfParse from 'pdf-parse';

// Create a wrapper function for pdf-parse
const pdfParseWrapper = async (dataBuffer, options = {}) => {
  try {
    return await pdfParse(dataBuffer, options);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

export default pdfParseWrapper;

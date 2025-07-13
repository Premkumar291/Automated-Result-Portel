import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const __dirname = path.resolve(); // Node ESM workaround
const testDataDir = path.join(__dirname, 'test', 'pdfs');
const testFileName = '05-versions-space.pdf';
const testFilePath = path.join(testDataDir, testFileName);

// Ensure the test directory exists
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// We don't need the test file for our implementation
// Just make sure the directory exists

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
export { testFilePath };

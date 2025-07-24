import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadPdfToPdfCo, convertPdfToCsv, parseCsvToResultJson } from '../services/pdfCoService.js';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script for PDF.co API integration
 * This script tests the complete workflow:
 * 1. Upload a test PDF to PDF.co
 * 2. Convert the PDF to CSV
 * 3. Parse the CSV to structured JSON
 */
async function testPdfCoIntegration() {
  try {
    console.log('Starting PDF.co API integration test...');
    
    // Check if API key is configured
    if (!process.env.PDFCO_API_KEY) {
      console.error('Error: PDFCO_API_KEY is not set in .env file');
      return;
    }
    
    // Path to test PDF file
    const testPdfPath = path.join(__dirname, 'data', 'test-result.pdf');
    
    // Check if test file exists
    if (!fs.existsSync(testPdfPath)) {
      console.error(`Error: Test PDF file not found at ${testPdfPath}`);
      console.log('Please add a test PDF file to the test/data directory');
      return;
    }
    
    // Read the test PDF file
    const fileBuffer = fs.readFileSync(testPdfPath);
    console.log(`Test PDF file loaded: ${testPdfPath}`);
    
    // Step 1: Upload PDF to PDF.co
    console.log('Uploading PDF to PDF.co...');
    const uploadResult = await uploadPdfToPdfCo(fileBuffer, 'test-result.pdf');
    console.log('Upload successful. URL:', uploadResult.url);
    
    // Step 2: Convert PDF to CSV
    console.log('Converting PDF to CSV...');
    const csvData = await convertPdfToCsv(uploadResult.url);
    console.log('CSV conversion successful. First 200 characters:');
    console.log(csvData.substring(0, 200) + '...');
    
    // Save CSV to file for inspection
    const csvOutputPath = path.join(__dirname, 'data', 'test-result-output.csv');
    fs.writeFileSync(csvOutputPath, csvData);
    console.log(`CSV output saved to: ${csvOutputPath}`);
    
    // Step 3: Parse CSV to JSON
    console.log('Parsing CSV to structured JSON...');
    const jsonResult = parseCsvToResultJson(csvData);
    
    // Log summary of parsed data
    console.log('Parsing successful. Summary:');
    console.log(`- Students found: ${jsonResult.students.length}`);
    console.log(`- Subject codes found: ${jsonResult.subjectCodes.length}`);
    
    if (jsonResult.students.length > 0) {
      console.log('\nSample student data:');
      console.log(JSON.stringify(jsonResult.students[0], null, 2));
    }
    
    // Save JSON to file for inspection
    const jsonOutputPath = path.join(__dirname, 'data', 'test-result-output.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonResult, null, 2));
    console.log(`JSON output saved to: ${jsonOutputPath}`);
    
    console.log('\nPDF.co API integration test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
    console.error('Error details:', error.response?.data || error.message);
  }
}

// Run the test
testPdfCoIntegration();
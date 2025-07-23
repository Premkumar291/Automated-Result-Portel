import { getGridFSBucket } from '../utils/gridfsConfig.js';
import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import { uploadPdfToPdfCo, convertPdfToCsv, parseCsvToResultJson } from '../services/pdfCoService.js';
import mongoose from 'mongoose';
import { PDFDocument } from 'pdf-lib';

/**
 * Analyzes a PDF using PDF.co API for improved accuracy
 * This controller handles the complete workflow:
 * 1. Retrieve PDF from GridFS
 * 2. Upload to PDF.co
 * 3. Convert to CSV
 * 4. Parse CSV to structured JSON
 */
export const analyzePDFWithPdfCo = async (req, res) => {
  try {
    console.log('\n===== STARTING PDF.CO ANALYSIS WORKFLOW =====');
    const { id } = req.params;
    const { page } = req.query; // Optional page parameter for analyzing specific pages
    console.log(`Analyzing PDF ID: ${id}, Page: ${page || 'all pages'}`);
    
    // Find the metadata record
    const pdfMetadata = await GridFSSemesterPDF.findById(id);
    if (!pdfMetadata) {
      console.log('Error: PDF not found with ID:', id);
      return res.status(404).json({ message: 'PDF not found' });
    }
    console.log('PDF Metadata found:', {
      filename: pdfMetadata.uploadName,
      semester: pdfMetadata.semester,
      uploadDate: pdfMetadata.uploadDate
    });
    
    // Get the file from GridFS
    const gridFSBucket = getGridFSBucket();
    const downloadStream = gridFSBucket.openDownloadStream(pdfMetadata.fileId);
    console.log('GridFS stream opened for file ID:', pdfMetadata.fileId);
    
    // Read the file into a buffer
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    console.log('PDF loaded into buffer, size:', buffer.length, 'bytes');
    
    // If a specific page is requested, extract just that page
    let pdfBuffer;
    let pageCount;
    
    if (page) {
      console.log('Extracting specific page:', page);
      const pageNum = parseInt(page, 10);
      const pageData = await extractSpecificPage(buffer, pageNum);
      pdfBuffer = pageData.buffer;
      pageCount = pageData.pageCount;
      console.log(`Extracted page ${page} of ${pageCount}, new buffer size:`, pdfBuffer.length, 'bytes');
    } else {
      // Use the entire PDF
      pdfBuffer = buffer;
      
      // Get page count
      const pdfDoc = await PDFDocument.load(buffer);
      pageCount = pdfDoc.getPageCount();
      console.log('Using entire PDF, total pages:', pageCount);
    }
    
    // Step 1: Upload PDF to PDF.co
    console.log('\n===== STEP 1: UPLOADING PDF TO PDF.CO =====');
    const uploadResult = await uploadPdfToPdfCo(
      pdfBuffer, 
      `${pdfMetadata.uploadName}_${pdfMetadata.semester || 'unknown'}.pdf`
    );
    console.log('PDF successfully uploaded to PDF.co, URL:', uploadResult.url);
    
    // Step 2: Convert PDF to CSV using PDF.co
    console.log('\n===== STEP 2: CONVERTING PDF TO CSV =====');
    const csvData = await convertPdfToCsv(uploadResult.url);
    console.log('PDF successfully converted to CSV, length:', csvData.length, 'characters');
    
    // Step 3: Parse CSV to structured JSON
    console.log('\n===== STEP 3: PARSING CSV TO JSON =====');
    const result = parseCsvToResultJson(csvData);
    console.log('CSV successfully parsed to JSON structure');
    console.log(`Found ${result.students.length} students and ${result.subjectCodes.length} subject codes`);
    
    // Add metadata to the response
    result.metadata = {
      filename: pdfMetadata.uploadName,
      semester: pdfMetadata.semester,
      pageCount: pageCount,
      analyzedPage: page ? parseInt(page, 10) : null,
      uploadDate: pdfMetadata.uploadDate,
      processingMethod: 'pdf.co'
    };
    
    console.log('\n===== ANALYSIS COMPLETE =====');
    console.log('Added metadata to result:', result.metadata);
    console.log('Sending response to client');
    
    res.json(result);
  } catch (err) {
    console.error('\n===== ERROR IN PDF.CO ANALYSIS =====');
    console.error('Error analyzing PDF with PDF.co:', err);
    console.error('Error details:', err.response?.data || err.message);
    
    res.status(500).json({ 
      message: 'Failed to analyze PDF using PDF.co', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
    
    // Save the new PDF
    const pageBytes = await newPdf.save();
    
    return {
      buffer: Buffer.from(pageBytes),
      pageCount: pageCount
    };
  } catch (error) {
    console.error('Error extracting page:', error);
    throw error;
  }
}
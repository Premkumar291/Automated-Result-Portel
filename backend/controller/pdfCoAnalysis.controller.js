import axios from 'axios';
import FormData from 'form-data';
import { getGridFSBucket } from '../utils/gridfsConfig.js';
import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import mongoose from 'mongoose';
import { PDFDocument } from 'pdf-lib';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

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
    const { id } = req.params;
    const { page } = req.query; // Optional page parameter for analyzing specific pages

    // Find the metadata record
    const pdfMetadata = await GridFSSemesterPDF.findById(id).select('fileId uploadName semester uploadDate');
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
    let pdfBuffer;
    let pageCount;

    if (page) {
      const pageNum = parseInt(page, 10);
      const pageData = await extractSpecificPage(buffer, pageNum);
      pdfBuffer = pageData.buffer;
      pageCount = pageData.pageCount;
    } else {
      // Use the entire PDF
      pdfBuffer = buffer;

      // Get page count
      const pdfDoc = await PDFDocument.load(buffer);
      pageCount = pdfDoc.getPageCount();
    }

    // --- NEW LOGIC: Call Python Microservice ---

    // Create FormData
    const formData = new FormData();
    formData.append('file', pdfBuffer, {
      filename: `${pdfMetadata.uploadName || 'document'}.pdf`,
      contentType: 'application/pdf',
    });

    // Call Python Service
    console.log(`[ResultAnalysis] Sending PDF to ${PYTHON_SERVICE_URL}/analyze-pdf`);
    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/analyze-pdf`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const result = pythonResponse.data;

    // Add metadata to the response
    result.metadata = {
      filename: pdfMetadata.uploadName,
      semester: pdfMetadata.semester,
      pageCount: pageCount,
      analyzedPage: page ? parseInt(page, 10) : null,
      uploadDate: pdfMetadata.uploadDate,
      processingMethod: 'local-python-service'
    };


    res.json(result);
  } catch (err) {
    console.error('[ResultAnalysis] Error during analysis:', err);
    if (err.response) {
      console.error('[ResultAnalysis] Python Service Error Response:', err.response.data);
      console.error('[ResultAnalysis] Python Service Status:', err.response.status);
    }
    res.status(500).json({
      message: 'Failed to analyze PDF', // Removed PDF.co reference
      error: err.message,
      details: err.response?.data || err.message,
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
    throw error;
  }
}


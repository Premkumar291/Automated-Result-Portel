import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadPDF, handleUploadError } from '../middleware/fileUpload.js';
import {
  uploadAndProcessPDF,
  getExcelFiles,
  downloadExcelFile,
  deleteExcelFile,
  getSemesters,
  testGroqConnection
} from '../controller/pdfAnalysis.controller.js';

const router = express.Router();

// Test Groq connection
router.get('/test-groq', verifyToken, testGroqConnection);

// Upload and process PDF
router.post('/upload', verifyToken, uploadPDF, handleUploadError, uploadAndProcessPDF);

// Get all Excel files (with optional semester filter)
router.get('/excel-files', verifyToken, getExcelFiles);

// Download specific Excel file
router.get('/download/:fileId', verifyToken, downloadExcelFile);

// Delete specific Excel file
router.delete('/excel-files/:fileId', verifyToken, deleteExcelFile);

// Get available semesters
router.get('/semesters', verifyToken, getSemesters);

export default router;

import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
  uploadResultPDF, 
  upload, 
  getResults, 
  deleteResults,
  testPdfProcessing,
  reconstructPdfTable
} from '../controller/result.controller.js';

const router = express.Router();

// Upload result PDF (protected route)
router.post('/upload', verifyToken, upload.single('resultPDF'), uploadResultPDF);

// Test PDF processing (protected route)
router.post('/test', verifyToken, upload.single('resultPDF'), testPdfProcessing);

// Reconstruct PDF into tabular format (protected route)
router.post('/reconstruct-table', verifyToken, upload.single('resultPDF'), reconstructPdfTable);

// Get uploaded results (protected route)
router.get('/results', verifyToken, getResults);

// Delete results (protected route)
router.delete('/results', verifyToken, deleteResults);

export default router;

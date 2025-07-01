import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
  uploadAndExtractPdf, 
  saveExtractedData,
  getProcessedResults,
  upload
} from '../controller/processedResult.controller.js';

const router = express.Router();

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Processed results route is working!' });
});

// Upload PDF and extract data (temporarily without auth for testing)
router.post('/upload-extract', upload.single('pdfFile'), uploadAndExtractPdf);

// Save extracted data to database (protected route)
router.post('/save', verifyToken, saveExtractedData);

// Get processed results (protected route)
router.get('/list', verifyToken, getProcessedResults);

export default router;

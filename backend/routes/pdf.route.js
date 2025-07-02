import express from 'express';
import PdfProcessingController from '../controller/pdfProcessing.controller.js';
import { uploadPdf, handleMulterError } from '../middleware/upload.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Routes for PDF Processing Operations
 * All routes are protected and require authentication
 */

// POST /api/pdf/process - Process uploaded PDF file
router.post('/process', 
  verifyToken, // Ensure user is authenticated
  uploadPdf, // Handle file upload
  handleMulterError, // Handle upload errors
  PdfProcessingController.processPdfResults
);

// GET /api/pdf/history - Get processing history for the current user
router.get('/history', 
  verifyToken,
  PdfProcessingController.getProcessingHistory
);

// GET /api/pdf/results/student/:regNo - Get results by registration number
router.get('/results/student/:regNo', 
  verifyToken,
  PdfProcessingController.getResultsByRegNo
);

// GET /api/pdf/results/semester/:semester - Get results by semester
router.get('/results/semester/:semester', 
  verifyToken,
  PdfProcessingController.getResultsBySemester
);

// GET /api/pdf/ai-status - Get AI service status
router.get('/ai-status', 
  verifyToken,
  PdfProcessingController.getAIServiceStatus
);

// GET /api/pdf/test - Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PDF processing routes are working!',
    endpoints: {
      'POST /api/pdf/process': 'Process PDF file',
      'GET /api/pdf/history': 'Get processing history',
      'GET /api/pdf/results/student/:regNo': 'Get results by registration number',
      'GET /api/pdf/results/semester/:semester': 'Get results by semester',
      'GET /api/pdf/ai-status': 'Get AI service status'
    },
    features: {
      aiParsing: 'Groq AI-powered intelligent parsing',
      traditionalParsing: 'Pattern-based fallback parsing',
      excelExport: 'Automated Excel generation',
      mongoStorage: 'Optimized database storage'
    }
  });
});

export default router;

import express from 'express';
import { PDFReportController } from '../controller/pdfReport.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Report Routes - Excel Primary, PDF Secondary
 * All routes require authentication
 */

// --- Primary Excel Routes ---
// Generate a standard Excel report
router.post('/generate', verifyToken, PDFReportController.generateReport);

// Generate an institutional format Excel report
router.post('/generate-institutional', verifyToken, PDFReportController.generateInstitutionalExcelReport);



// --- Legacy PDF Routes (for backward compatibility) ---
router.post('/generate-pdf', verifyToken, PDFReportController.generatePDFReport);


export default router;

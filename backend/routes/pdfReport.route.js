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

// --- General Report Management ---
// Get list of all generated reports
router.get('/list', verifyToken, PDFReportController.getReports);

// Delete a generated report
router.delete('/:reportId', verifyToken, PDFReportController.deleteReport);

// --- Legacy PDF Routes (for backward compatibility) ---
router.post('/generate-pdf', verifyToken, PDFReportController.generatePDFReport);
router.get('/download-pdf/:reportId', verifyToken, PDFReportController.downloadReport);
router.get('/preview-pdf/:reportId', verifyToken, PDFReportController.previewReport);

export default router;

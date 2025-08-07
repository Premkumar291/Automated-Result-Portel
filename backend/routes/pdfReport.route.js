import express from 'express';
import { PDFReportController } from '../controller/pdfReport.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * PDF Report Routes
 * All routes require authentication
 */

// Generate a new PDF report
router.post('/generate', verifyToken, PDFReportController.generateReport);

// Generate an enhanced PDF report with more detailed template
router.post('/generate-enhanced', verifyToken, PDFReportController.generateEnhancedReport);

// Generate institutional format report matching the provided image
router.post('/generate-institutional', verifyToken, PDFReportController.generateInstitutionalReport);

// Download a generated PDF report
router.get('/download/:reportId', verifyToken, PDFReportController.downloadReport);

// Preview a generated PDF report in browser
router.get('/preview/:reportId', verifyToken, PDFReportController.previewReport);

// Get list of generated reports
router.get('/list', verifyToken, PDFReportController.getReports);

// Delete a generated report
router.delete('/:reportId', verifyToken, PDFReportController.deleteReport);

export default router;

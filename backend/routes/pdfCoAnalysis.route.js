import express from 'express';
import { analyzePDFWithPdfCo } from '../controller/pdfCoAnalysis.controller.js';

const router = express.Router();

// Route for analyzing a PDF by ID using PDF.co API
// Supports optional query parameter 'page' for analyzing specific pages
router.get('/upload/:id', analyzePDFWithPdfCo);

export default router;
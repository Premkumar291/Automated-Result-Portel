import express from 'express';
import { analyzePDF } from '../controller/analyzeResults.controller.js';

const router = express.Router();

// Route for analyzing a PDF by ID
// Supports optional query parameter 'page' for analyzing specific pages
router.get('/upload/:id', analyzePDF);

export default router;
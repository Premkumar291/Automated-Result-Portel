import express from 'express';
import { uploadAndSplitPDF, getSemesterPDFs, downloadSemesterPDF, deleteSemesterPDFs } from '../controller/pdfSplit.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // In-memory storage

// Upload and split PDF
router.post('/upload', upload.single('pdf'), uploadAndSplitPDF);
// List semester PDFs for an upload
router.get('/:uploadId', getSemesterPDFs);
// Download a specific semester PDF
router.get('/:uploadId/:semester', downloadSemesterPDF);
// Delete all semester PDFs for an upload
router.delete('/:uploadId', deleteSemesterPDFs);

export default router;

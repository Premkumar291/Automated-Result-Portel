import express from 'express';
import multer from 'multer';
import { 
  uploadAndSplitPDF, 
  getSemesterPDFs, 
  downloadSemesterPDF,
  downloadSemesterPDFById,
  deleteSemesterPDFs,
  getRecentPDFs
} from '../controller/gridFSPdfSplit.controller.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Route for uploading and splitting PDF
router.post('/split', upload.single('pdf'), uploadAndSplitPDF);

// Route for getting the most recent PDFs
router.get('/recent', getRecentPDFs);

// Route for getting all semester PDFs for an upload
router.get('/:uploadId', getSemesterPDFs);

// Route for downloading a specific semester PDF by ID
router.get('/view/:id', downloadSemesterPDFById);

// Route for downloading a specific semester PDF by upload name and semester
router.get('/:uploadId/:semester', downloadSemesterPDF);

// Route for deleting all semester PDFs for an upload
router.delete('/:uploadId', deleteSemesterPDFs);

export default router;
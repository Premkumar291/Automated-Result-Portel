import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadAndExtractPDF, getPDFAnalysis } from "../controller/pdf/pdfController.js";
import { 
  uploadPDF, 
  getUserPDFs, 
  analyzePDF, 
  updatePDFInfo, 
  downloadPDF, 
  deletePDF, 
  getPDFAnalysis as getPDFAnalysisResult 
} from "../controller/pdf/pdfManagement.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Configure multer with size limit (10MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for memory storage (for database storage)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
// Old route (keeping for backward compatibility)
router.post("/upload", verifyToken, upload.single('pdf'), uploadAndExtractPDF);

// New PDF management routes
router.post("/save", verifyToken, memoryUpload.single('pdf'), uploadPDF);
router.get("/list", verifyToken, getUserPDFs);
router.post("/analyze/:pdfId", verifyToken, analyzePDF);
router.put("/update/:pdfId", verifyToken, updatePDFInfo);
router.get("/download/:pdfId", verifyToken, downloadPDF);
router.delete("/delete/:pdfId", verifyToken, deletePDF);
router.get("/analysis/:pdfId", verifyToken, getPDFAnalysisResult);

// Analysis capabilities endpoint
router.get("/analysis", verifyToken, getPDFAnalysis);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed!'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
});

export default router;

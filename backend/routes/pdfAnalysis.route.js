import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadPDF, handleUploadError } from '../middleware/fileUpload.js';
import {
  uploadAndProcessPDF,
  getExcelFiles,
  downloadExcelFile,
  deleteExcelFile,
  getSemesters,
  testGroqConnection
} from '../controller/pdfAnalysis.controller.js';

const router = express.Router();

// Test Groq connection
router.get('/test-groq', verifyToken, testGroqConnection);

// Debug endpoint for testing text analysis
router.post('/test-analysis', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'No text provided for analysis'
      });
    }
    
    const groqService = await import('../services/groqService.js');
    const result = await groqService.default.analyzePDFText(text);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload and process PDF
router.post('/upload', verifyToken, uploadPDF, handleUploadError, uploadAndProcessPDF);

// Get all Excel files (with optional semester filter)
router.get('/excel-files', verifyToken, getExcelFiles);

// Download specific Excel file
router.get('/download/:fileId', verifyToken, downloadExcelFile);

// Delete specific Excel file
router.delete('/excel-files/:fileId', verifyToken, deleteExcelFile);

// Get available semesters
router.get('/semesters', verifyToken, getSemesters);

// Get Excel file content for preview
router.get('/preview/:fileId', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { ExcelFile } = await import('../models/excelFile.model.js');
    const file = await ExcelFile.findOne({ _id: fileId, userId });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Return the analysis data instead of the binary file
    res.json({
      success: true,
      data: {
        fileName: file.fileName,
        semester: file.semester,
        analysisData: file.analysisData,
        studentCount: file.studentCount,
        subjectCount: file.subjectCount,
        createdAt: file.createdAt
      }
    });

  } catch (error) {
    console.error('Excel preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview Excel file'
    });
  }
});

export default router;

import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';
import { extractStructuredData } from './pdfExtractor.js';
import GradeAnalyzer from './gradeAnalyzer.js';

// Main PDF upload and processing endpoint
export const uploadAndExtractPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error('PDF parsing error:', errData.parserError);
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({
        success: false,
        message: 'Error parsing PDF file',
        error: errData.parserError
      });
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        // Log basic info about the PDF
        console.log('PDF Processing Info:');
        console.log('- Pages found:', pdfData.Pages?.length || 0);
        console.log('- Meta info:', pdfData.Meta || 'No metadata');
        
        // Extract structured data using the modular extractor
        const extractedData = extractStructuredData(pdfData);
        
        // Perform grade analysis
        const gradeAnalyzer = new GradeAnalyzer();
        const gradeAnalysis = gradeAnalyzer.analyzeGrades(extractedData);
        
        // Combine extracted data with grade analysis
        const completeData = {
          ...extractedData,
          gradeAnalysis: gradeAnalysis
        };
        
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        res.json({
          success: true,
          message: 'PDF processed successfully',
          data: completeData,
          fileInfo: {
            originalName: req.file.originalname,
            size: req.file.size,
            uploadDate: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error processing extracted data:', error);
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({
          success: false,
          message: 'Error processing extracted data',
          error: error.message
        });
      }
    });

    // Start parsing the PDF
    pdfParser.loadPDF(filePath);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
};

// Get PDF analysis summary
export const getPDFAnalysis = async (req, res) => {
  try {
    // This could be enhanced to store and retrieve previous analyses
    res.json({
      success: true,
      message: 'PDF analysis endpoint ready',
      supportedFeatures: [
        'Text extraction',
        'Table detection',
        'Form field extraction',
        'Metadata extraction',
        'Structured content analysis',
        'Anna University grade sheet detection',
        'Student grade mapping',
        'Course code recognition'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting PDF analysis',
      error: error.message
    });
  }
};

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
        
        // Log extraction results
        console.log('Extraction Results:');
        console.log('- Pages processed:', extractedData.pages?.length || 0);
        console.log('- Tables found:', extractedData.tables?.length || 0);
        console.log('- Forms found:', extractedData.forms?.length || 0);
        console.log('- Full text length:', extractedData.fullText?.length || 0);
        
        // Log grade analysis results
        if (gradeAnalysis.success) {
          console.log('Grade Analysis Results:');
          console.log('- Subjects found:', gradeAnalysis.subjects?.length || 0);
          console.log('- Total records:', gradeAnalysis.totalRecords || 0);
          console.log('- Overall pass rate:', gradeAnalysis.overallStats?.overallPassRate || 0, '%');
          
          // Log subject-wise summary
          gradeAnalysis.subjects?.forEach(subject => {
            console.log(`  ${subject.subjectCode}: ${subject.passPercentage}% pass rate (${subject.passedStudents}/${subject.totalStudents})`);
          });
        } else {
          console.log('Grade Analysis Failed:', gradeAnalysis.error);
        }
        
        // Log sample text patterns for debugging table detection
        if (extractedData.pages && extractedData.pages.length > 0) {
          const firstPage = extractedData.pages[0];
          const studentIds = firstPage.texts?.filter(t => /^\d{12}/.test(t.text)) || [];
          const courseCodes = firstPage.texts?.filter(t => /^[A-Z]{2,3}\d{4}/.test(t.text)) || [];
          const grades = firstPage.texts?.filter(t => /^[ABCDEFPU][+\-]?$/.test(t.text) || /^UA$/.test(t.text)) || [];
          const names = firstPage.texts?.filter(t => t.text.length > 2 && /^[A-Z][A-Z\s]*$/.test(t.text)) || [];
          
          console.log('Text patterns detected on first page:');
          console.log('- Student IDs:', studentIds.length, studentIds.slice(0, 3).map(t => `"${t.text}" at (${t.x.toFixed(1)},${t.y.toFixed(1)})`));
          console.log('- Course codes:', courseCodes.length, courseCodes.slice(0, 5).map(t => `"${t.text}" at (${t.x.toFixed(1)},${t.y.toFixed(1)})`));
          console.log('- Grades:', grades.length, grades.slice(0, 10).map(t => `"${t.text}" at (${t.x.toFixed(1)},${t.y.toFixed(1)})`));
          console.log('- Names:', names.length, names.slice(0, 5).map(t => `"${t.text}" at (${t.x.toFixed(1)},${t.y.toFixed(1)})`));
          
          // Show table detection results
          if (extractedData.tables && extractedData.tables.length > 0) {
            console.log('Table structure created:');
            extractedData.tables.forEach((table, index) => {
              console.log(`Table ${index + 1}: ${table.rows?.length || 0} rows, ${table.columns?.length || 0} columns`);
              if (table.rows && table.rows.length > 0) {
                console.log('First few rows:', table.rows.slice(0, 3));
              }
            });
          }
        }
        
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

import PDF from '../../models/pdf.model.js';
import PDFParser from 'pdf2json';
import { extractStructuredData } from './pdfExtractor.js';
import GradeAnalyzer from './gradeAnalyzer.js';

// Upload and save PDF to database
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Read file data
    const fileData = req.file.buffer; // Using memory storage
    
    // Create PDF document in database
    const pdfDoc = new PDF({
      filename: req.body.filename || req.file.originalname,
      originalName: req.file.originalname,
      description: req.body.description || '',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileData: fileData,
      uploadedBy: userId,
      status: 'uploaded'
    });

    await pdfDoc.save();

    res.json({
      success: true,
      message: 'PDF uploaded and saved successfully',
      pdf: {
        id: pdfDoc._id,
        filename: pdfDoc.filename,
        originalName: pdfDoc.originalName,
        description: pdfDoc.description,
        fileSize: pdfDoc.fileSize,
        formattedSize: pdfDoc.formattedSize,
        uploadDate: pdfDoc.uploadDate,
        status: pdfDoc.status,
        isAnalyzed: pdfDoc.isAnalyzed
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF',
      error: error.message
    });
  }
};

// Get all PDFs for authenticated user
export const getUserPDFs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pdfs = await PDF.findByUser(userId)
      .select('-fileData') // Exclude binary data for list view
      .lean();

    const pdfList = pdfs.map(pdf => ({
      id: pdf._id,
      filename: pdf.filename,
      originalName: pdf.originalName,
      description: pdf.description,
      fileSize: pdf.fileSize,
      uploadDate: pdf.uploadDate,
      lastModified: pdf.lastModified,
      status: pdf.status,
      isAnalyzed: pdf.isAnalyzed,
      lastAnalyzed: pdf.lastAnalyzed,
      statistics: pdf.statistics,
      errorMessage: pdf.errorMessage
    }));

    res.json({
      success: true,
      pdfs: pdfList,
      count: pdfList.length
    });

  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PDFs',
      error: error.message
    });
  }
};

// Analyze specific PDF
export const analyzePDF = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    // Find PDF belonging to user
    const pdfDoc = await PDF.findOne({ _id: pdfId, uploadedBy: userId });
    
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Update status to analyzing
    pdfDoc.status = 'analyzing';
    await pdfDoc.save();

    // Create a temporary buffer for pdf2json
    const pdfBuffer = pdfDoc.fileData;
    
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", async (errData) => {
      console.error('PDF parsing error:', errData.parserError);
      
      // Update PDF status to error
      pdfDoc.status = 'error';
      pdfDoc.errorMessage = 'Failed to parse PDF file';
      await pdfDoc.save();
      
      return res.status(500).json({
        success: false,
        message: 'Error parsing PDF file',
        error: errData.parserError
      });
    });

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        console.log('PDF Analysis Started for:', pdfDoc.filename);
        
        // Extract structured data
        const extractedData = extractStructuredData(pdfData);
        
        // Perform grade analysis
        const gradeAnalyzer = new GradeAnalyzer();
        const gradeAnalysis = gradeAnalyzer.analyzeGrades(extractedData);
        
        // Update PDF document with analysis results
        await pdfDoc.updateAnalysis(extractedData, gradeAnalysis);
        
        console.log('Analysis completed for:', pdfDoc.filename);
        console.log('- Subjects found:', gradeAnalysis.subjects?.length || 0);
        console.log('- Overall pass rate:', gradeAnalysis.overallStats?.overallPassRate || 0, '%');

        res.json({
          success: true,
          message: 'PDF analyzed successfully',
          pdf: {
            id: pdfDoc._id,
            filename: pdfDoc.filename,
            status: pdfDoc.status,
            isAnalyzed: pdfDoc.isAnalyzed,
            statistics: pdfDoc.statistics
          },
          extractedData: extractedData,
          gradeAnalysis: gradeAnalysis
        });

      } catch (error) {
        console.error('Error during analysis:', error);
        
        // Update PDF status to error
        pdfDoc.status = 'error';
        pdfDoc.errorMessage = error.message;
        await pdfDoc.save();
        
        res.status(500).json({
          success: false,
          message: 'Error during PDF analysis',
          error: error.message
        });
      }
    });

    // Parse the PDF from buffer
    pdfParser.parseBuffer(pdfBuffer);

  } catch (error) {
    console.error('Analyze PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze PDF',
      error: error.message
    });
  }
};

// Update PDF info (filename, description)
export const updatePDFInfo = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { filename, description } = req.body;
    const userId = req.user.id;

    const pdfDoc = await PDF.findOne({ _id: pdfId, uploadedBy: userId });
    
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    await pdfDoc.updateInfo(filename, description);

    res.json({
      success: true,
      message: 'PDF info updated successfully',
      pdf: {
        id: pdfDoc._id,
        filename: pdfDoc.filename,
        description: pdfDoc.description,
        lastModified: pdfDoc.lastModified
      }
    });

  } catch (error) {
    console.error('Update PDF info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PDF info',
      error: error.message
    });
  }
};

// Download PDF
export const downloadPDF = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const pdfDoc = await PDF.findOne({ _id: pdfId, uploadedBy: userId });
    
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfDoc.filename}"`);
    res.setHeader('Content-Length', pdfDoc.fileSize);
    
    res.send(pdfDoc.fileData);

  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
};

// Delete PDF
export const deletePDF = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const pdfDoc = await PDF.findOneAndDelete({ _id: pdfId, uploadedBy: userId });
    
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    res.json({
      success: true,
      message: 'PDF deleted successfully'
    });

  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete PDF',
      error: error.message
    });
  }
};

// Get analysis results for a specific PDF
export const getPDFAnalysis = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const pdfDoc = await PDF.findOne({ _id: pdfId, uploadedBy: userId })
      .select('-fileData'); // Exclude binary data
    
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (!pdfDoc.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: 'PDF has not been analyzed yet'
      });
    }

    res.json({
      success: true,
      pdf: {
        id: pdfDoc._id,
        filename: pdfDoc.filename,
        description: pdfDoc.description,
        status: pdfDoc.status,
        lastAnalyzed: pdfDoc.lastAnalyzed,
        statistics: pdfDoc.statistics
      },
      extractedData: pdfDoc.extractedData,
      gradeAnalysis: pdfDoc.gradeAnalysis
    });

  } catch (error) {
    console.error('Get PDF analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF analysis',
      error: error.message
    });
  }
};

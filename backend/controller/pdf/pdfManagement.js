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

// NEW ENDPOINTS FOR ENHANCED WORKFLOW

// Process PDF without storing (temporary processing)
export const processPDFTemporary = async (req, res) => {
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

    const userId = req.user.id;
    const fileData = req.file.buffer;

    // Create temporary PDF document (not stored)
    const tempPDF = {
      filename: req.body.filename || req.file.originalname,
      originalName: req.file.originalname,
      description: req.body.description || '',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileData: fileData,
      uploadedBy: userId,
      status: 'processing',
      processingStatus: 'processing',
      isStored: false,
      uploadDate: new Date()
    };

    // Process the PDF
    const pdfParser = new PDFParser();
    
    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error('PDF parsing error:', errData.parserError);
        res.status(500).json({
          success: false,
          message: 'Error parsing PDF file',
          error: errData.parserError
        });
      });

      pdfParser.on("pdfParser_dataReady", async (pdfData) => {
        try {
          // Extract structured data
          const extractedData = extractStructuredData(pdfData);
          
          // Perform grade analysis
          const gradeAnalyzer = new GradeAnalyzer();
          const gradeAnalysis = gradeAnalyzer.analyzeGrades(extractedData);
          
          // Update temp PDF with results
          tempPDF.extractedData = extractedData;
          tempPDF.gradeAnalysis = gradeAnalysis;
          tempPDF.status = gradeAnalysis.success ? 'processed' : 'error';
          tempPDF.processingStatus = gradeAnalysis.success ? 'completed' : 'failed';
          tempPDF.isProcessed = gradeAnalysis.success;
          
          if (!gradeAnalysis.success) {
            tempPDF.errorMessage = gradeAnalysis.error || 'Processing failed';
          }

          res.json({
            success: true,
            message: 'PDF processed successfully (not stored)',
            data: {
              tempId: `temp_${Date.now()}_${userId}`, // Temporary ID for frontend tracking
              ...tempPDF,
              extractedData,
              gradeAnalysis,
              fileInfo: {
                originalName: req.file.originalname,
                size: req.file.size,
                processedDate: new Date().toISOString()
              }
            }
          });
        } catch (error) {
          console.error('Error processing PDF:', error);
          res.status(500).json({
            success: false,
            message: 'Error processing PDF',
            error: error.message
          });
        }
      });

      // Parse PDF from buffer
      pdfParser.parseBuffer(fileData);
    });

  } catch (error) {
    console.error('Process PDF temporary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF processing',
      error: error.message
    });
  }
};

// Store processed PDF in database
export const storePDFInDatabase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      tempId, 
      filename, 
      originalName, 
      description, 
      fileSize, 
      mimeType, 
      fileData, 
      extractedData, 
      gradeAnalysis,
      statistics 
    } = req.body;

    if (!fileData || !extractedData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required PDF data for storage'
      });
    }

    // Create and save PDF document in database
    const pdfDoc = new PDF({
      filename: filename || originalName,
      originalName,
      description: description || '',
      fileSize,
      mimeType,
      fileData: Buffer.from(fileData, 'base64'), // Convert base64 back to buffer
      uploadedBy: userId,
      extractedData,
      gradeAnalysis,
      statistics: statistics || {},
      status: 'analyzed',
      processingStatus: 'completed',
      isStored: true,
      isProcessed: true,
      isAnalyzed: true,
      lastProcessed: new Date(),
      lastAnalyzed: new Date()
    });

    await pdfDoc.save();

    res.json({
      success: true,
      message: 'PDF stored in database successfully',
      pdf: {
        id: pdfDoc._id,
        filename: pdfDoc.filename,
        originalName: pdfDoc.originalName,
        description: pdfDoc.description,
        fileSize: pdfDoc.fileSize,
        uploadDate: pdfDoc.uploadDate,
        status: pdfDoc.status,
        processingStatus: pdfDoc.processingStatus,
        isStored: pdfDoc.isStored,
        isProcessed: pdfDoc.isProcessed,
        statistics: pdfDoc.statistics
      }
    });

  } catch (error) {
    console.error('Store PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store PDF in database',
      error: error.message
    });
  }
};

// Get stored PDFs for user
export const getStoredPDFs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, processingStatus } = req.query;

    const options = { 
      stored: true // Only get stored PDFs
    };
    
    if (status) options.status = status;
    if (processingStatus) options.processingStatus = processingStatus;

    const pdfs = await PDF.findByUser(userId, options)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-fileData') // Exclude file data for performance
      .lean();

    const totalCount = await PDF.countDocuments({ 
      uploadedBy: userId, 
      isStored: true 
    });

    // Get user statistics
    const stats = await PDF.getUserStats(userId);

    res.json({
      success: true,
      message: 'Stored PDFs retrieved successfully',
      data: {
        pdfs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        statistics: stats[0] || {
          totalPDFs: 0,
          processedPDFs: 0,
          analyzedPDFs: 0,
          totalSize: 0
        }
      }
    });

  } catch (error) {
    console.error('Get stored PDFs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stored PDFs',
      error: error.message
    });
  }
};

// Get processing status of a PDF
export const getPDFProcessingStatus = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const pdf = await PDF.findOne({ 
      _id: pdfId, 
      uploadedBy: userId 
    }).select('status processingStatus isProcessed isStored errorMessage lastProcessed');

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: pdf._id,
        status: pdf.status,
        processingStatus: pdf.processingStatus,
        isProcessed: pdf.isProcessed,
        isStored: pdf.isStored,
        errorMessage: pdf.errorMessage,
        lastProcessed: pdf.lastProcessed
      }
    });

  } catch (error) {
    console.error('Get PDF status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF status',
      error: error.message
    });
  }
};

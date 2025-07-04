import pdfProcessor from '../services/pdfProcessor.js';
import excelGenerator from '../services/excelGenerator.js';
import groqService from '../services/groqService.js';
import { ExcelFile } from '../models/excelFile.model.js';

export const uploadAndProcessPDF = async (req, res) => {
  try {
    console.log('PDF upload request received');
    console.log('Request headers:', req.headers.cookie ? 'Cookie present' : 'No cookie');
    console.log('req.user:', req.user);
    console.log('req.userId:', req.userId);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const userId = req.user?._id;
    const originalFileName = req.file.originalname;
    const pdfBuffer = req.file.buffer;

    console.log(`Processing PDF: ${originalFileName}, Size: ${pdfBuffer.length} bytes`);
    console.log(`User ID: ${userId}`);

    if (!userId) {
      console.error('Authentication failed - no userId found');
      console.log('req.user object:', JSON.stringify(req.user, null, 2));
      return res.status(401).json({
        success: false,
        message: 'User authentication required for PDF processing'
      });
    }

    // Process PDF and analyze with Groq
    const analysisData = await pdfProcessor.processAndAnalyzePDF(pdfBuffer);
    
    console.log('Analysis data received:', JSON.stringify(analysisData, null, 2));
    
    // Check if analysis was successful
    if (!analysisData || !analysisData.students || analysisData.students.length === 0) {
      console.log('No valid student data found in analysis');
      return res.status(400).json({
        success: false,
        message: 'No student data could be extracted from the PDF. Please ensure the PDF contains clear academic result data.',
        analysisData: analysisData,
        debug: {
          textLength: analysisData?.metadata?.textLength || 0,
          hasParsingError: analysisData?.parsing_error || false,
          errorMessage: analysisData?.error_message || 'Unknown error'
        }
      });
    }
    
    // Group data by semester
    const semesterGroups = pdfProcessor.groupBySemester(analysisData);
    
    console.log(`Grouped into ${Object.keys(semesterGroups).length} semesters`);
    
    // Generate Excel files for each semester and store in database
    const savedFiles = [];
    
    for (const [semesterKey, semesterData] of Object.entries(semesterGroups)) {
      try {
        // Generate Excel file with enhanced formatting
        const excelBuffer = excelGenerator.generateExcelForSemesterEnhanced 
          ? excelGenerator.generateExcelForSemesterEnhanced(semesterData)
          : excelGenerator.generateExcelForSemester(semesterData);
        const fileName = excelGenerator.generateFileName(semesterData, originalFileName);
        
        // Save to database
        const excelFile = new ExcelFile({
          fileName: fileName,
          semester: semesterData.semester,
          filePath: `/excel/${fileName}`,
          fileData: excelBuffer,
          fileSize: excelBuffer.length,
          userId: userId,
          originalPdfName: originalFileName,
          analysisData: semesterData,
          studentCount: semesterData.students ? semesterData.students.length : 0,
          subjectCount: semesterData.students ? 
            semesterData.students.reduce((total, student) => 
              total + (student.subjects ? student.subjects.length : 0), 0) : 0
        });

        const savedFile = await excelFile.save();
        savedFiles.push({
          _id: savedFile._id,
          fileName: savedFile.fileName,
          semester: savedFile.semester,
          createdAt: savedFile.createdAt,
          studentCount: savedFile.studentCount,
          subjectCount: savedFile.subjectCount
        });
        
        console.log(`Excel file generated for semester ${semesterData.semester}: ${fileName}`);
      } catch (excelError) {
        console.error(`Error generating Excel for semester ${semesterKey}:`, excelError);
        // Continue with other semesters even if one fails
      }
    }

    console.log(`Processing complete. Generated ${savedFiles.length} Excel files.`);

    res.status(200).json({
      success: true,
      message: 'PDF processed successfully',
      data: {
        originalFileName: originalFileName,
        totalSemesters: Object.keys(semesterGroups).length,
        excelFiles: savedFiles,
        analysisData: analysisData
      },
      // Add the data in the format expected by frontend
      semesters: semesterGroups,
      student_info: {
        student_name: analysisData.students?.[0]?.name || 'Unknown',
        institution: analysisData.institution,
        examType: analysisData.examType,
        academicYear: analysisData.academicYear
      },
      analysis_summary: `Analysis complete: ${Object.keys(semesterGroups).length} semester(s) found with ${savedFiles.length} Excel files generated.`
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to process PDF';
    let statusCode = 500;
    
    if (error.message.includes('extract text')) {
      errorMessage = 'Could not extract text from PDF. The file may be corrupted or image-based.';
      statusCode = 400;
    } else if (error.message.includes('analyze PDF')) {
      errorMessage = 'AI analysis failed. Please try again or check PDF format.';
      statusCode = 422;
    } else if (error.message.includes('generate Excel')) {
      errorMessage = 'Failed to generate Excel files from extracted data.';
      statusCode = 422;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const getExcelFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    const { semester } = req.query;

    let query = { userId };
    if (semester && semester !== 'all') {
      query.semester = semester;
    }

    const excelFiles = await ExcelFile.find(query)
      .select('-fileData') // Exclude file data for listing
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: excelFiles
    });

  } catch (error) {
    console.error('Get Excel files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Excel files'
    });
  }
};

export const downloadExcelFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const excelFile = await ExcelFile.findOne({ 
      _id: fileId, 
      userId: userId 
    });

    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    res.setHeader('Content-Type', excelFile.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${excelFile.fileName}"`);
    res.setHeader('Content-Length', excelFile.fileSize);

    res.send(excelFile.fileData);

  } catch (error) {
    console.error('Download Excel file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download Excel file'
    });
  }
};

export const deleteExcelFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const deletedFile = await ExcelFile.findOneAndDelete({ 
      _id: fileId, 
      userId: userId 
    });

    if (!deletedFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Excel file deleted successfully',
      data: {
        fileName: deletedFile.fileName,
        semester: deletedFile.semester
      }
    });

  } catch (error) {
    console.error('Delete Excel file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Excel file'
    });
  }
};

export const getSemesters = async (req, res) => {
  try {
    const userId = req.user._id;

    const semesters = await ExcelFile.distinct('semester', { userId });

    res.status(200).json({
      success: true,
      data: semesters.sort()
    });

  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch semesters'
    });
  }
};

export const testGroqConnection = async (req, res) => {
  try {
    const testResult = await groqService.testConnection();
    
    res.status(testResult.success ? 200 : 500).json({
      success: testResult.success,
      message: testResult.message,
      data: testResult.response
    });

  } catch (error) {
    console.error('Groq test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Groq connection'
    });
  }
};

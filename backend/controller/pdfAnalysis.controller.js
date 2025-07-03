import pdfProcessor from '../services/pdfProcessor.js';
import excelGenerator from '../services/excelGenerator.js';
import groqService from '../services/groqService.js';
import { ExcelFile } from '../models/excelFile.model.js';

export const uploadAndProcessPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const userId = req.user._id;
    const originalFileName = req.file.originalname;
    const pdfBuffer = req.file.buffer;

    // Process PDF and analyze with Groq
    const analysisData = await pdfProcessor.processAndAnalyzePDF(pdfBuffer);
    
    // Group data by semester
    const semesterGroups = pdfProcessor.groupBySemester(analysisData);
    
    // Generate Excel files for each semester and store in database
    const savedFiles = [];
    
    for (const [semesterKey, semesterData] of Object.entries(semesterGroups)) {
      // Generate Excel file
      const excelBuffer = excelGenerator.generateExcelForSemester(semesterData);
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
    }

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
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process PDF'
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

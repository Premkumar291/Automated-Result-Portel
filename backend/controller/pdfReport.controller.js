import { pdfReportService } from '../services/pdfReportService.js';
import { ReportTemplate } from '../models/reportTemplate.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF Report Controller
 * Handles the generation of semester result PDF reports
 */
export class PDFReportController {
  
  /**
   * Generate a new PDF report from analysis data
   */
  static async generateReport(req, res) {
    try {
      const { 
        facultyName, 
        semester, 
        academicYear, 
        department, 
        analysisData,
        facultyId 
      } = req.body;

      // Validate required fields
      if (!facultyName || !semester || !academicYear || !department || !analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: facultyName, semester, academicYear, department, or analysisData'
        });
      }

      // Validate analysis data structure
      if (!analysisData.students || !analysisData.subjectCodes) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis data structure'
        });
      }

      // Process the analysis data for PDF generation
      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      // Prepare report data for PDF generation
      const reportData = {
        facultyName,
        semester,
        academicYear,
        department,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `analysis_${Date.now()}`,
        totalStudents: processedData.totalStudents,
        totalSubjects: processedData.totalSubjects,
        overallPassPercentage: processedData.overallPassPercentage,
        subjectResults: processedData.subjectResults,
        studentsData: processedData.studentsData
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `semester_report_${semester}_${timestamp}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Check if enhanced report is requested
      const reportType = req.body.reportType || 'standard';
      let pdfPath;
      
      if (reportType === 'enhanced') {
        pdfPath = await pdfReportService.generateEnhancedReport(reportData, outputPath);
      } else {
        pdfPath = await pdfReportService.generateSemesterReport(reportData, outputPath);
      }

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        ...reportData,
        pdfPath: pdfPath,
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Return success response with download information
      res.status(200).json({
        success: true,
        message: 'PDF report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview/${reportTemplate._id}`,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department
        }
      });

    } catch (error) {
      console.error('Error generating PDF report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF report',
        error: error.message
      });
    }
  }

  /**
   * Download a generated PDF report
   */
  static async downloadReport(req, res) {
    try {
      const { reportId } = req.params;

      // Find the report in database
      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Check if PDF file exists
      if (!fs.existsSync(report.pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'PDF file not found on server'
        });
      }

      // Set response headers for PDF download
      const filename = `${report.department}_Semester_${report.semester}_${report.academicYear}_Report.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream the PDF file
      const fileStream = fs.createReadStream(report.pdfPath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading PDF report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download PDF report',
        error: error.message
      });
    }
  }

  /**
   * Preview a generated PDF report in browser
   */
  static async previewReport(req, res) {
    try {
      const { reportId } = req.params;

      // Find the report in database
      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Check if PDF file exists
      if (!fs.existsSync(report.pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'PDF file not found on server'
        });
      }

      // Set response headers for PDF preview
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

      // Stream the PDF file
      const fileStream = fs.createReadStream(report.pdfPath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error previewing PDF report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to preview PDF report',
        error: error.message
      });
    }
  }

  /**
   * Get list of generated reports for a faculty
   */
  static async getReports(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const facultyId = req.user?.id;

      const reports = await ReportTemplate.find(
        facultyId ? { facultyId } : {}
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-studentsData'); // Exclude large student data from list

      const total = await ReportTemplate.countDocuments(
        facultyId ? { facultyId } : {}
      );

      res.status(200).json({
        success: true,
        data: {
          reports,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          totalReports: total
        }
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
        error: error.message
      });
    }
  }

  /**
   * Generate an enhanced PDF report with detailed template
   */
  static async generateEnhancedReport(req, res) {
    try {
      const { 
        facultyName, 
        semester, 
        academicYear, 
        department, 
        analysisData,
        facultyId,
        subjectCode,
        subjectName
      } = req.body;

      // Validate required fields
      if (!facultyName || !semester || !academicYear || !department || !analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields for enhanced report generation'
        });
      }

      // Validate analysis data structure
      if (!analysisData.students || !analysisData.subjectCodes) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis data structure'
        });
      }

      // Process the analysis data for PDF generation
      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      // Prepare enhanced report data
      const reportData = {
        facultyName,
        semester,
        academicYear,
        department,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `enhanced_analysis_${Date.now()}`,
        totalStudents: processedData.totalStudents,
        totalSubjects: processedData.totalSubjects,
        overallPassPercentage: processedData.overallPassPercentage,
        subjectResults: processedData.subjectResults,
        studentsData: processedData.studentsData,
        subjectCode: subjectCode || '',
        subjectName: subjectName || '',
        reportType: 'enhanced'
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `enhanced_report_${department}_${semester}_${timestamp}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate the enhanced PDF report
      const pdfPath = await pdfReportService.generateEnhancedReport(reportData, outputPath, true);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        ...reportData,
        pdfPath: pdfPath,
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Enhanced PDF report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview/${reportTemplate._id}`,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department,
          reportType: 'enhanced'
        }
      });

    } catch (error) {
      console.error('Error generating enhanced PDF report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate enhanced PDF report',
        error: error.message
      });
    }
  }

  /**
   * Delete a generated report
   */
  static async deleteReport(req, res) {
    try {
      const { reportId } = req.params;

      // Find the report
      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Delete PDF file if it exists
      if (fs.existsSync(report.pdfPath)) {
        fs.unlinkSync(report.pdfPath);
      }

      // Delete from database
      await ReportTemplate.findByIdAndDelete(reportId);

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: error.message
      });
    }
  }

  /**
   * Process raw analysis data for PDF generation
   */
  static processAnalysisData(analysisData) {
    const { students, subjectCodes } = analysisData;
    
    // Calculate overall statistics
    const totalStudents = students.length;
    const totalSubjects = subjectCodes.length;
    
    // Calculate overall pass percentage (students who passed all subjects)
    const studentsPassedAll = students.filter(student => 
      subjectCodes.every(code => 
        student.grades[code] && student.grades[code] !== 'U'
      )
    ).length;
    
    const overallPassPercentage = totalStudents > 0 ? 
      (studentsPassedAll / totalStudents) * 100 : 0;

    // Calculate subject-wise results
    const subjectResults = subjectCodes.map(subjectCode => {
      const studentsWithGrade = students.filter(student => 
        student.grades[subjectCode] && student.grades[subjectCode] !== ''
      );
      
      const passedStudents = studentsWithGrade.filter(student => 
        student.grades[subjectCode] !== 'U'
      ).length;

      const totalStudentsForSubject = studentsWithGrade.length;
      const passPercentage = totalStudentsForSubject > 0 ? 
        (passedStudents / totalStudentsForSubject) * 100 : 0;

      return {
        subjectCode,
        subjectName: subjectCode, // Can be enhanced with full subject names
        passPercentage,
        totalStudents: totalStudentsForSubject,
        passedStudents
      };
    });

    // Format students data for PDF
    const studentsData = students.map(student => ({
      regNo: student.regNo,
      name: student.name,
      grades: student.grades
    }));

    return {
      totalStudents,
      totalSubjects,
      overallPassPercentage,
      subjectResults,
      studentsData
    };
  }
}

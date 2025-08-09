import { pdfReportService } from '../services/pdfReportService.js';
import { excelReportService } from '../services/excelReportService.js';
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
   * Generate a new Excel report from analysis data (Default report generation)
   */
  static async generateReport(req, res) {
    try {
      const { 
        facultyName, 
        semester, 
        academicYear, 
        department, 
        analysisData,
        facultyId,
        facultyDepartment 
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

      // Process the analysis data for Excel generation
      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      // Prepare report data for Excel generation
      const reportData = {
        facultyName,
        semester,
        academicYear,
        department,
        facultyDepartment: facultyDepartment || department,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `analysis_${Date.now()}`,
        totalStudents: processedData.totalStudents,
        totalSubjects: processedData.totalSubjects,
        overallPassPercentage: processedData.overallPassPercentage,
        subjectResults: processedData.subjectResults,
        studentsData: processedData.studentsData,
        facultyAssignments: req.body.facultyAssignments || {}
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `semester_report_${semester}_${timestamp}.xlsx`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate the Excel report using the institutional template
      const excelPath = await excelReportService.generateSemesterReport(reportData, outputPath);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        ...reportData,
        excelPath: excelPath,
        fileType: 'excel',
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Convert to preview data for frontend
      const previewData = await excelReportService.convertToPreviewData(excelPath);

      // Return success response with preview and download information
      res.status(200).json({
        success: true,
        message: 'Excel report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-excel/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-excel/${reportTemplate._id}`,
          updateUrl: `/api/reports/update-excel/${reportTemplate._id}`,
          previewData: previewData,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department,
          fileType: 'excel'
        }
      });

    } catch (error) {
      console.error('Error generating Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Excel report',
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
        subjectName,
        facultyPerSubject
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
        facultyPerSubject: facultyPerSubject || {},
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
   * Generate institutional format report matching the exact image format
   */
  static async generateInstitutionalReport(req, res) {
    try {
      const { 
        department, 
        semester, 
        academicYear,
        analysisData,
        facultyAssignments,
        facultyId,
        instituteName,
        instituteLocation,
        reportGeneratedAt,
        reportType
      } = req.body;

      console.log('Received institutional report request:', {
        department,
        semester,
        academicYear,
        facultyAssignments,
        analysisDataPresent: !!analysisData
      });

      // Validate required fields
      if (!department || !semester || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: department, semester, or academicYear'
        });
      }

      // Validate faculty assignments if analysis data is provided
      if (analysisData && analysisData.subjectCodes && (!facultyAssignments || Object.keys(facultyAssignments).length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Faculty assignments are required when analysis data is provided'
        });
      }

      // Process analysis data if provided, otherwise create empty report
      let processedData;
      if (analysisData && analysisData.students && analysisData.subjectCodes) {
        processedData = PDFReportController.processAnalysisData(analysisData);
      } else {
        // Create empty report structure for template
        processedData = {
          totalStudents: 0,
          totalSubjects: 0,
          overallPassPercentage: 0,
          subjectResults: [],
          studentsData: []
        };
      }
      
      // Prepare institutional report data
      const reportData = {
        instituteName: instituteName || 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: instituteLocation || 'ERODE - 638 316',
        department: department,
        semester: semester,
        academicYear: academicYear,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `institutional_analysis_${Date.now()}`,
        totalStudents: processedData.totalStudents,
        totalSubjects: processedData.totalSubjects,
        overallPassPercentage: processedData.overallPassPercentage,
        subjectResults: processedData.subjectResults,
        studentsData: processedData.studentsData,
        facultyAssignments: facultyAssignments || {},
        reportType: 'institutional',
        generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
        reportGeneratedAt: reportGeneratedAt || new Date().toISOString()
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
      const filename = `institutional_report_${department}_Sem${semester}_${academicYear.replace('-', '_')}_${timestamp}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      console.log('Generating institutional PDF report at:', outputPath);

      // Generate the institutional PDF report
      const pdfPath = await pdfReportService.generateInstitutionalReport(reportData, outputPath);

      console.log('PDF generated successfully at:', pdfPath);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        facultyName: `${department} Faculty`, // Default faculty name for institutional reports
        semester: reportData.semester,
        academicYear: reportData.academicYear,
        department: reportData.department,
        facultyId: reportData.facultyId,
        analysisDataId: reportData.analysisDataId,
        totalStudents: reportData.totalStudents,
        totalSubjects: reportData.totalSubjects,
        overallPassPercentage: reportData.overallPassPercentage,
        subjectResults: reportData.subjectResults,
        studentsData: reportData.studentsData,
        facultyAssignments: reportData.facultyAssignments,
        reportType: reportData.reportType,
        pdfPath: pdfPath,
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      console.log('Report metadata saved to database with ID:', reportTemplate._id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Institutional PDF report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview/${reportTemplate._id}`,
          generatedAt: reportTemplate.generatedAt,
          department: reportData.department,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          reportType: 'institutional',
          totalStudents: reportData.totalStudents,
          totalSubjects: reportData.totalSubjects,
          overallPassPercentage: reportData.overallPassPercentage
        }
      });

    } catch (error) {
      console.error('Error generating institutional PDF report:', error);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate institutional PDF report',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Generate a PDF report (Legacy method for backward compatibility)
   */
  static async generatePDFReport(req, res) {
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

      // Generate the PDF report
      const pdfPath = await pdfReportService.generateSemesterReport(reportData, outputPath);

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
        message: 'PDF report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-pdf/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-pdf/${reportTemplate._id}`,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department,
          fileType: 'pdf'
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
   * Generate Excel report from analysis data
   */
  static async generateExcelReport(req, res) {
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

      // Process the analysis data for Excel generation
      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      // Prepare report data for Excel generation
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
      const filename = `semester_report_${semester}_${timestamp}.xlsx`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate the Excel report
      const excelPath = await excelReportService.generateSemesterReport(reportData, outputPath);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        ...reportData,
        excelPath: excelPath,
        fileType: 'excel',
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Convert to preview data for frontend
      const previewData = await excelReportService.convertToPreviewData(excelPath);

      // Return success response with preview and download information
      res.status(200).json({
        success: true,
        message: 'Excel report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-excel/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-excel/${reportTemplate._id}`,
          updateUrl: `/api/reports/update-excel/${reportTemplate._id}`,
          previewData: previewData,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department,
          fileType: 'excel'
        }
      });

    } catch (error) {
      console.error('Error generating Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Excel report',
        error: error.message
      });
    }
  }

  /**
   * Generate enhanced Excel report
   */
  static async generateEnhancedExcelReport(req, res) {
    try {
      const { 
        facultyName, 
        semester, 
        academicYear, 
        department, 
        analysisData,
        facultyId,
        subjectCode,
        subjectName,
        facultyPerSubject
      } = req.body;

      // Validate required fields
      if (!facultyName || !semester || !academicYear || !department || !analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields for enhanced Excel report generation'
        });
      }

      // Validate analysis data structure
      if (!analysisData.students || !analysisData.subjectCodes) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis data structure'
        });
      }

      // Process the analysis data
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
        facultyPerSubject: facultyPerSubject || {},
        reportType: 'enhanced'
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `enhanced_report_${department}_${semester}_${timestamp}.xlsx`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate the enhanced Excel report
      const excelPath = await excelReportService.generateEnhancedReport(reportData, outputPath);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        ...reportData,
        excelPath: excelPath,
        fileType: 'excel',
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Convert to preview data
      const previewData = await excelReportService.convertToPreviewData(excelPath);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Enhanced Excel report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-excel/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-excel/${reportTemplate._id}`,
          updateUrl: `/api/reports/update-excel/${reportTemplate._id}`,
          previewData: previewData,
          generatedAt: reportTemplate.generatedAt,
          facultyName: reportData.facultyName,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          department: reportData.department,
          reportType: 'enhanced',
          fileType: 'excel'
        }
      });

    } catch (error) {
      console.error('Error generating enhanced Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate enhanced Excel report',
        error: error.message
      });
    }
  }

  /**
   * Generate institutional Excel report
   */
  static async generateInstitutionalExcelReport(req, res) {
    try {
      const { 
        department, 
        semester, 
        academicYear,
        analysisData,
        facultyAssignments,
        facultyId,
        instituteName,
        instituteLocation,
        reportGeneratedAt
      } = req.body;

      // Validate required fields
      if (!department || !semester || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: department, semester, or academicYear'
        });
      }

      // Process analysis data if provided
      let processedData;
      if (analysisData && analysisData.students && analysisData.subjectCodes) {
        processedData = PDFReportController.processAnalysisData(analysisData);
      } else {
        processedData = {
          totalStudents: 0,
          totalSubjects: 0,
          overallPassPercentage: 0,
          subjectResults: [],
          studentsData: []
        };
      }
      
      // Prepare institutional report data
      const reportData = {
        instituteName: instituteName || 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: instituteLocation || 'ERODE - 638 316',
        department: department,
        semester: semester,
        academicYear: academicYear,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `institutional_analysis_${Date.now()}`,
        totalStudents: processedData.totalStudents,
        totalSubjects: processedData.totalSubjects,
        overallPassPercentage: processedData.overallPassPercentage,
        subjectResults: processedData.subjectResults,
        studentsData: processedData.studentsData,
        facultyAssignments: facultyAssignments || {},
        reportType: 'institutional',
        generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
        reportGeneratedAt: reportGeneratedAt || new Date().toISOString()
      };

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
      const filename = `institutional_report_${department}_Sem${semester}_${academicYear.replace('-', '_')}_${timestamp}.xlsx`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      // Ensure reports directory exists
      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate the institutional Excel report
      const excelPath = await excelReportService.generateInstitutionalReport(reportData, outputPath);

      // Save report metadata to database
      const reportTemplate = new ReportTemplate({
        facultyName: `${department} Faculty`,
        semester: reportData.semester,
        academicYear: reportData.academicYear,
        department: reportData.department,
        facultyId: reportData.facultyId,
        analysisDataId: reportData.analysisDataId,
        totalStudents: reportData.totalStudents,
        totalSubjects: reportData.totalSubjects,
        overallPassPercentage: reportData.overallPassPercentage,
        subjectResults: reportData.subjectResults,
        studentsData: reportData.studentsData,
        facultyAssignments: reportData.facultyAssignments,
        reportType: reportData.reportType,
        excelPath: excelPath,
        fileType: 'excel',
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      // Convert to preview data
      const previewData = await excelReportService.convertToPreviewData(excelPath);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Institutional Excel report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-excel/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-excel/${reportTemplate._id}`,
          updateUrl: `/api/reports/update-excel/${reportTemplate._id}`,
          previewData: previewData,
          generatedAt: reportTemplate.generatedAt,
          department: reportData.department,
          semester: reportData.semester,
          academicYear: reportData.academicYear,
          reportType: 'institutional',
          fileType: 'excel',
          totalStudents: reportData.totalStudents,
          totalSubjects: reportData.totalSubjects,
          overallPassPercentage: reportData.overallPassPercentage
        }
      });

    } catch (error) {
      console.error('Error generating institutional Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate institutional Excel report',
        error: error.message
      });
    }
  }

  /**
   * Download Excel report
   */
  static async downloadExcelReport(req, res) {
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

      // Check if Excel file exists
      if (!report.excelPath || !fs.existsSync(report.excelPath)) {
        return res.status(404).json({
          success: false,
          message: 'Excel file not found on server'
        });
      }

      // Set response headers for Excel download
      const filename = `${report.department}_Semester_${report.semester}_${report.academicYear}_Report.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream the Excel file
      const fileStream = fs.createReadStream(report.excelPath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download Excel report',
        error: error.message
      });
    }
  }

  /**
   * Preview Excel report as JSON data
   */
  static async previewExcelReport(req, res) {
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

      // Check if Excel file exists
      if (!report.excelPath || !fs.existsSync(report.excelPath)) {
        return res.status(404).json({
          success: false,
          message: 'Excel file not found on server'
        });
      }

      // Convert Excel to preview data
      const previewData = await excelReportService.convertToPreviewData(report.excelPath);

      res.status(200).json({
        success: true,
        data: {
          reportId: report._id,
          previewData: previewData,
          reportInfo: {
            facultyName: report.facultyName,
            semester: report.semester,
            academicYear: report.academicYear,
            department: report.department,
            reportType: report.reportType || 'standard',
            generatedAt: report.generatedAt
          }
        }
      });

    } catch (error) {
      console.error('Error previewing Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to preview Excel report',
        error: error.message
      });
    }
  }

  /**
   * Update Excel report with new data
   */
  static async updateExcelReport(req, res) {
    try {
      const { reportId } = req.params;
      const { updateData } = req.body;

      // Find the report in database
      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Check if Excel file exists
      if (!report.excelPath || !fs.existsSync(report.excelPath)) {
        return res.status(404).json({
          success: false,
          message: 'Excel file not found on server'
        });
      }

      // Update the Excel file
      await excelReportService.updateExcelFile(report.excelPath, updateData);

      // Update report metadata
      report.lastModified = new Date();
      await report.save();

      // Get updated preview data
      const previewData = await excelReportService.convertToPreviewData(report.excelPath);

      res.status(200).json({
        success: true,
        message: 'Excel report updated successfully',
        data: {
          reportId: report._id,
          previewData: previewData,
          lastModified: report.lastModified
        }
      });

    } catch (error) {
      console.error('Error updating Excel report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Excel report',
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

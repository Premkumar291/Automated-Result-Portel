import { pdfReportService } from '../services/pdfReportService.js';
import { excelReportService } from '../services/excelReportService.js';
import { ReportTemplate } from '../models/reportTemplate.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Handles the generation of semester result PDF reports
 */
export class PDFReportController {
  
  /**
   * Generate a new Excel report from analysis data and stream it.
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

      if (!facultyName || !semester || !academicYear || !department || !analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: facultyName, semester, academicYear, department, or analysisData'
        });
      }

      if (!analysisData.students || !analysisData.subjectCodes) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis data structure'
        });
      }

      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      const reportData = {
        facultyName,
        semester,
        academicYear,
        department,
        facultyDepartment: facultyDepartment || department,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `analysis_${Date.now()}`,
        ...processedData,
        facultyAssignments: req.body.facultyAssignments || {}
      };

      const excelBuffer = await excelReportService.generateSemesterReportBuffer(reportData);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `semester_report_${semester}_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(excelBuffer);

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
   * Generate institutional Excel report and stream it.
   */
  static async generateInstitutionalExcelReport(req, res) {
    try {
      const { 
        department, 
        semester, 
        academicYear,
        classAdvisorName, // Added
        monthsAndYear,    // Added
        analysisData,
        facultyAssignments,
        subjectNames, // Added
        instituteName,
        instituteLocation,
        reportGeneratedAt
      } = req.body;

      const processedData = PDFReportController.processAnalysisData(analysisData || { students: [], subjectCodes: [] }, subjectNames);
      
      const reportData = {
        instituteName: instituteName || 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: instituteLocation || 'ERODE - 638 316',
        department: department,
        semester: semester,
        academicYear: academicYear,
        classAdvisorName: classAdvisorName,
        monthsAndYear: monthsAndYear,
        reportGeneratedAt: reportGeneratedAt || new Date().toLocaleDateString('en-GB'),
        facultyAssignments: facultyAssignments || {},
        subjectNames: subjectNames || {},
        ...processedData
      };

      const excelBuffer = await excelReportService.generateInstitutionalReportBuffer(reportData);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `institutional_report_${semester}_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(excelBuffer);

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
   * Download a generated PDF report
   */
  static async downloadReport(req, res) {
    try {
      const { reportId } = req.params;

      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'PDF file not found on server'
        });
      }

      const filename = path.basename(report.pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

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
   * Preview a generated PDF report
   */
  static async previewReport(req, res) {
    try {
      const { reportId } = req.params;

      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'PDF file not found on server'
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

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
      const { facultyId } = req.params;

      const reports = await ReportTemplate.find({ facultyId: facultyId }).sort({ generatedAt: -1 });

      if (!reports || reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No reports found for this faculty'
        });
      }

      const formattedReports = reports.map(report => ({
        reportId: report._id,
        facultyName: report.facultyName,
        semester: report.semester,
        academicYear: report.academicYear,
        department: report.department,
        generatedAt: report.generatedAt,
        fileType: report.fileType,
        downloadUrl: report.fileType === 'pdf' ? `/api/reports/download-pdf/${report._id}` : `/api/reports/download-excel/${report._id}`,
        previewUrl: report.fileType === 'pdf' ? `/api/reports/preview-pdf/${report._id}` : `/api/reports/preview-excel/${report._id}`
      }));

      res.status(200).json({
        success: true,
        data: formattedReports
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
   * Generate institutional format PDF report (saves to disk)
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
        reportGeneratedAt
      } = req.body;

      if (!department || !semester || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: department, semester, or academicYear'
        });
      }

      const processedData = PDFReportController.processAnalysisData(analysisData || { students: [], subjectCodes: [] });
      
      const reportData = {
        instituteName: instituteName || 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: instituteLocation || 'ERODE - 638 316',
        department: department,
        semester: semester,
        academicYear: academicYear,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `institutional_analysis_${Date.now()}`,
        ...processedData,
        facultyAssignments: facultyAssignments || {},
        reportType: 'institutional',
        generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
        reportGeneratedAt: reportGeneratedAt || new Date().toISOString()
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
      const filename = `institutional_report_${department}_Sem${semester}_${academicYear.replace('-', '_')}_${timestamp}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const pdfPath = await pdfReportService.generateInstitutionalReport(reportData, outputPath);

      const reportTemplate = new ReportTemplate({
        ...reportData,
        facultyName: `${department} Faculty`,
        pdfPath: pdfPath,
        fileType: 'pdf',
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      res.status(200).json({
        success: true,
        message: 'Institutional PDF report generated successfully',
        data: {
          reportId: reportTemplate._id,
          filename: filename,
          downloadUrl: `/api/reports/download-pdf/${reportTemplate._id}`,
          previewUrl: `/api/reports/preview-pdf/${reportTemplate._id}`,
        }
      });

    } catch (error) {
      console.error('Error generating institutional PDF report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate institutional PDF report',
        error: error.message
      });
    }
  }

  /**
   * Generate a PDF report (saves to disk)
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

      if (!facultyName || !semester || !academicYear || !department || !analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const processedData = PDFReportController.processAnalysisData(analysisData);
      
      const reportData = {
        facultyName,
        semester,
        academicYear,
        department,
        facultyId: facultyId || req.user?.id,
        analysisDataId: `analysis_${Date.now()}`,
        ...processedData
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `semester_report_${semester}_${timestamp}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/reports', filename);

      const reportsDir = path.dirname(outputPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const pdfPath = await pdfReportService.generateSemesterReport(reportData, outputPath);

      const reportTemplate = new ReportTemplate({
        ...reportData,
        pdfPath: pdfPath,
        generatedAt: new Date(),
        status: 'completed'
      });

      await reportTemplate.save();

      res.status(200).json({
        success: true,
        message: 'PDF report generated successfully',
        data: { reportId: reportTemplate._id }
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

      const report = await ReportTemplate.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      if (report.pdfPath && fs.existsSync(report.pdfPath)) {
        fs.unlinkSync(report.pdfPath);
      }
      if (report.excelPath && fs.existsSync(report.excelPath)) {
        fs.unlinkSync(report.excelPath);
      }

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
   * Process raw analysis data for report generation
   */
  static processAnalysisData(analysisData, subjectNames = {}) {
    const { students, subjectCodes } = analysisData;
    const arrearGrades = ['U', 'F', 'RA', 'UA', 'R', 'WH'];

    const totalStudents = students.length;
    const totalSubjects = subjectCodes.length;

    const studentsPassedAll = students.filter(student =>
      subjectCodes.every(code => {
        const grade = student.grades[code];
        return grade && !arrearGrades.includes(grade);
      })
    ).length;

    const overallPassPercentage = totalStudents > 0 ?
      (studentsPassedAll / totalStudents) * 100 : 0;

    const subjectResults = subjectCodes.map(subjectCode => {
      const studentsWithGrade = students.filter(student =>
        student.grades[subjectCode] && student.grades[subjectCode] !== ''
      );

      const passedStudents = studentsWithGrade.filter(student => {
        const grade = student.grades[subjectCode];
        return grade && !arrearGrades.includes(grade);
      }).length;

      const totalStudentsForSubject = studentsWithGrade.length;
      const passPercentage = totalStudentsForSubject > 0 ?
        (passedStudents / totalStudentsForSubject) * 100 : 0;

      return {
        subjectCode,
        subjectName: subjectNames[subjectCode] || subjectCode,
        passPercentage,
        totalStudents: totalStudentsForSubject,
        passedStudents
      };
    });

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
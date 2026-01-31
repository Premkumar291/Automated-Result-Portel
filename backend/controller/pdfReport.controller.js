import { pdfReportService } from '../services/pdfReportService.js';
import { excelReportService } from '../services/excelReportService.js';


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
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error generating Excel report:', error);
      }
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
        facultyDepartments, // Added to capture individual faculty departments
        subjectNames, // Added
        instituteName,
        instituteLocation,
        reportGeneratedAt
      } = req.body;

      const processedData = PDFReportController.processAnalysisData(analysisData || { students: [], subjectCodes: [] }, subjectNames);

      const reportData = {
        instituteName: instituteName || 'Government Engineering College, Erode',
        instituteLocation: instituteLocation || 'ERODE - 638 316',
        department: department,
        semester: semester,
        academicYear: academicYear,
        classAdvisorName: classAdvisorName,
        monthsAndYear: monthsAndYear,
        reportGeneratedAt: reportGeneratedAt || new Date().toLocaleDateString('en-GB'),
        facultyAssignments: facultyAssignments || {},
        facultyDepartments: facultyDepartments || {}, // Include faculty departments in report data
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
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error generating institutional Excel report:', error);
      }
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
    return res.status(404).json({
      success: false,
      message: 'Report downloading from storage is no longer supported. Please generate a new report.'
    });
  }

  /**
   * Preview a generated PDF report
   */
  static async previewReport(req, res) {
    return res.status(404).json({
      success: false,
      message: 'Report preview from storage is no longer supported. Please generate a new report.'
    });
  }



  /**
   * Generate institutional format PDF report (direct stream)
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

      // Generate PDF buffer
      const pdfBuffer = await pdfReportService.generateInstitutionalReport(reportData);

      // Stream directly to response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error generating institutional PDF report:', error);
      }
      res.status(500).json({
        success: false,
        message: 'Failed to generate institutional PDF report',
        error: error.message
      });
    }
  }

  /**
   * Generate a PDF report (direct stream)
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

      // Generate PDF buffer
      const pdfBuffer = await pdfReportService.generateSemesterReport(reportData);

      // Stream directly to response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error generating PDF report:', error);
      }
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF report',
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

    // Calculate subject-wise results first
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
    }).filter(subject => subject.totalStudents > 0); // Filter out subjects with 0 students

    // Filter subjectCodes to only include those with students
    const validSubjectCodes = subjectResults.map(result => result.subjectCode);
    const totalSubjects = validSubjectCodes.length;

    // Calculate students appeared: Maximum among all subjects (highest enrollment)
    const studentsAppeared = subjectResults.length > 0
      ? Math.max(...subjectResults.map(subject => subject.totalStudents))
      : 0;

    // Find the maximum enrollment count
    const maxEnrollment = studentsAppeared;

    // Get only subjects that have the maximum enrollment (exclude subjects with fewer students)
    const maxEnrollmentSubjects = subjectResults
      .filter(subject => subject.totalStudents === maxEnrollment)
      .map(subject => subject.subjectCode);

    // Calculate students who passed ALL subjects with maximum enrollment
    // Only count students who passed subjects that have the highest enrollment
    const studentsPassedAll = students.filter(student => {
      // Check if student passed all subjects that have maximum enrollment
      return maxEnrollmentSubjects.every(code => {
        const grade = student.grades[code];
        // Student must have a grade and it must not be an arrear grade
        return grade && grade !== '' && !arrearGrades.includes(grade);
      });
    }).length;

    // Calculate overall pass percentage - MATCHES FRONTEND LOGIC
    // Same as result-analysis.jsx: (students who passed all / total students) * 100
    const overallPassPercentage = studentsAppeared > 0 ?
      (studentsPassedAll / studentsAppeared) * 100 : 0;

    const studentsData = students.map(student => ({
      regNo: student.regNo,
      name: student.name,
      grades: student.grades
    }));

    return {
      studentsAppeared,        // Maximum students among all subjects
      studentsPassedAll,       // Students who passed ALL subjects
      totalStudents: students.length, // Total students in the list (kept for backward compatibility)
      totalSubjects,
      overallPassPercentage,
      subjectResults,
      studentsData
    };
  }
}
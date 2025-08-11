import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Excel Report Generation Service
 * Creates semester result reports in Excel format with editing capabilities
 */
export class ExcelReportService {
  constructor() {
    this.defaultStyle = {
      font: { name: 'Arial', size: 10 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    
    this.headerStyle = {
      font: { name: 'Arial', size: 12, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    this.cellStyle = {
      font: { name: 'Arial', size: 10 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  }

  /**
   * Generate main institutional report matching exact template
   */
  async generateSemesterReportBuffer(reportData) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // Set workbook properties
      workbook.creator = 'College Result Portal';
      workbook.lastModifiedBy = 'System';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Create the main institutional template sheet only
      await this.createInstitutionalTemplateSheet(workbook, reportData);

      // Return the workbook as a buffer
      return await workbook.xlsx.writeBuffer();

    } catch (error) {
      console.error('Error generating Excel report buffer:', error);
      throw error;
    }
  }

  /**
   * Generate main institutional report matching exact template
   */
  async generateSemesterReport(reportData, outputPath) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // Set workbook properties
      workbook.creator = 'College Result Portal';
      workbook.lastModifiedBy = 'System';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Create the main institutional template sheet only
      await this.createInstitutionalTemplateSheet(workbook, reportData);

      // Save the workbook
      await workbook.xlsx.writeFile(outputPath);
      return outputPath;

    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw error;
    }
  }

  /**
   * Generate enhanced Excel report with additional features
   */
  async generateEnhancedReport(reportData, outputPath) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      workbook.creator = 'College Result Portal';
      workbook.created = new Date();

      // Create enhanced worksheets
      await this.createEnhancedSummarySheet(workbook, reportData);
      await this.createDetailedResultsSheet(workbook, reportData);
      await this.createSubjectAnalysisSheet(workbook, reportData);
      await this.createEditableGradesSheet(workbook, reportData);
      await this.createFacultyInfoSheet(workbook, reportData);
      await this.createChartsSheet(workbook, reportData);

      await workbook.xlsx.writeFile(outputPath);
      return outputPath;

    } catch (error) {
      console.error('Error generating enhanced Excel report:', error);
      throw error;
    }
  }

  /**
   * Generate institutional format Excel report
   */
  async generateInstitutionalReportBuffer(reportData) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      workbook.creator = 'College Result Portal';
      workbook.created = new Date();

      // Create institutional format sheets
      await this.createInstitutionalMainSheet(workbook, reportData);
      await this.createInstitutionalSummarySheet(workbook, reportData);
      await this.createEditableInstitutionalSheet(workbook, reportData);

      return await workbook.xlsx.writeBuffer();

    } catch (error) {
      console.error('Error generating institutional Excel report buffer:', error);
      throw error;
    }
  }

  /**
   * Generate institutional format Excel report
   */
  async generateInstitutionalReport(reportData, outputPath) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      workbook.creator = 'College Result Portal';
      workbook.created = new Date();

      // Create institutional format sheets
      await this.createInstitutionalMainSheet(workbook, reportData);
      await this.createInstitutionalSummarySheet(workbook, reportData);
      await this.createEditableInstitutionalSheet(workbook, reportData);

      await workbook.xlsx.writeFile(outputPath);
      return outputPath;

    } catch (error) {
      console.error('Error generating institutional Excel report:', error);
      throw error;
    }
  }

  /**
   * Create summary sheet with overview information
   */
  async createSummarySheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Summary', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // Set column widths
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 30;
    sheet.getColumn(3).width = 20;

    // Title
    sheet.mergeCells('A1:C1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SEMESTER RESULT ANALYSIS REPORT';
    titleCell.style = {
      font: { name: 'Arial', size: 16, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    sheet.getRow(1).height = 30;

    // Subtitle
    sheet.mergeCells('A2:C2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `${reportData.department} Department - Semester ${reportData.semester} (${reportData.academicYear})`;
    subtitleCell.style = {
      font: { name: 'Arial', size: 12 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    sheet.getRow(2).height = 25;

    // Basic Information
    let currentRow = 4;
    const basicInfo = [
      ['Faculty Name:', reportData.facultyName || 'N/A'],
      ['Department:', reportData.department || 'N/A'],
      ['Semester:', reportData.semester || 'N/A'],
      ['Academic Year:', reportData.academicYear || 'N/A'],
      ['Report Generated:', new Date().toLocaleString()],
      ['', ''],
      ['STATISTICS', ''],
      ['Total Students:', reportData.totalStudents || 0],
      ['Total Subjects:', reportData.totalSubjects || 0],
      ['Overall Pass Percentage:', `${(reportData.overallPassPercentage || 0).toFixed(1)}%`]
    ];

    basicInfo.forEach(([label, value], index) => {
      const row = sheet.getRow(currentRow + index);
      row.getCell(1).value = label;
      row.getCell(2).value = value;
      
      if (label === 'STATISTICS') {
        row.getCell(1).style = {
          font: { name: 'Arial', size: 12, bold: true },
          alignment: { vertical: 'middle', horizontal: 'left' }
        };
      } else {
        row.getCell(1).style = {
          font: { name: 'Arial', size: 10, bold: label !== '' },
          alignment: { vertical: 'middle', horizontal: 'left' }
        };
        row.getCell(2).style = {
          font: { name: 'Arial', size: 10 },
          alignment: { vertical: 'middle', horizontal: 'left' }
        };
      }
      
      row.height = 20;
    });

    // Subject-wise summary
    currentRow += basicInfo.length + 2;
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    const subjectHeaderCell = sheet.getCell(`A${currentRow}`);
    subjectHeaderCell.value = 'SUBJECT-WISE PERFORMANCE';
    subjectHeaderCell.style = {
      font: { name: 'Arial', size: 12, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } }
    };
    sheet.getRow(currentRow).height = 25;

    currentRow++;
    
    // Subject headers
    const subjectHeaders = ['Subject Code', 'Total Students', 'Pass Percentage'];
    subjectHeaders.forEach((header, index) => {
      const cell = sheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.style = this.headerStyle;
    });
    sheet.getRow(currentRow).height = 25;

    currentRow++;

    // Subject data
    (reportData.subjectResults || []).forEach((subject, index) => {
      const row = sheet.getRow(currentRow + index);
      row.getCell(1).value = subject.subjectCode;
      row.getCell(2).value = subject.totalStudents;
      row.getCell(3).value = `${subject.passPercentage.toFixed(1)}%`;
      
      // Apply cell styles
      [1, 2, 3].forEach(col => {
        row.getCell(col).style = this.cellStyle;
      });
      
      // Color coding for pass percentage
      const passCell = row.getCell(3);
      if (subject.passPercentage < 50) {
        passCell.style = {
          ...this.cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }
        };
      } else if (subject.passPercentage >= 80) {
        passCell.style = {
          ...this.cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } }
        };
      }
      
      row.height = 20;
    });
  }

  /**
   * Create detailed results sheet with all student data
   */
  async createDetailedResultsSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Detailed Results');

    // Set column widths
    sheet.getColumn(1).width = 8;  // S.No
    sheet.getColumn(2).width = 15; // Reg No
    sheet.getColumn(3).width = 25; // Name
    
    // Dynamic subject columns
    const subjectCodes = (reportData.subjectResults || []).map(s => s.subjectCode);
    subjectCodes.forEach((_, index) => {
      sheet.getColumn(4 + index).width = 12;
    });

    // Title
    sheet.mergeCells(1, 1, 1, 3 + subjectCodes.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = 'DETAILED STUDENT RESULTS';
    titleCell.style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    sheet.getRow(1).height = 30;

    // Headers
    let currentRow = 3;
    const headers = ['S.No', 'Reg No', 'Student Name', ...subjectCodes];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.style = this.headerStyle;
    });
    sheet.getRow(currentRow).height = 25;

    currentRow++;

    // Student data
    (reportData.studentsData || []).forEach((student, studentIndex) => {
      const row = sheet.getRow(currentRow + studentIndex);
      
      // Basic student info
      row.getCell(1).value = studentIndex + 1;
      row.getCell(2).value = student.regNo;
      row.getCell(3).value = student.name;
      
      // Grades for each subject
      subjectCodes.forEach((subjectCode, subjectIndex) => {
        const grade = student.grades[subjectCode] || '-';
        const cell = row.getCell(4 + subjectIndex);
        cell.value = grade;
        
        // Color coding for grades
        if (grade === 'U' || grade === 'F') {
          cell.style = {
            ...this.cellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } },
            font: { name: 'Arial', size: 10, color: { argb: 'DC2626' } }
          };
        } else if (grade === '-' || grade === '') {
          cell.style = {
            ...this.cellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }
          };
        } else {
          cell.style = {
            ...this.cellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } }
          };
        }
      });

      // Apply basic cell styles to S.No, Reg No, Name
      [1, 2, 3].forEach(col => {
        row.getCell(col).style = this.cellStyle;
      });
      
      row.height = 20;
    });

    // Add freeze panes to keep headers visible
    sheet.views = [{
      state: 'frozen',
      xSplit: 3,
      ySplit: 3
    }];
  }

  /**
   * Create subject analysis sheet with statistics
   */
  async createSubjectAnalysisSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Subject Analysis');

    // Set column widths
    sheet.getColumn(1).width = 15; // Subject Code
    sheet.getColumn(2).width = 25; // Subject Name
    sheet.getColumn(3).width = 15; // Total Students
    sheet.getColumn(4).width = 15; // Passed Students
    sheet.getColumn(5).width = 15; // Failed Students
    sheet.getColumn(6).width = 15; // Pass Percentage
    sheet.getColumn(7).width = 15; // Grade Distribution

    // Title
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SUBJECT-WISE ANALYSIS';
    titleCell.style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    sheet.getRow(1).height = 30;

    // Headers
    const headers = [
      'Subject Code',
      'Subject Name', 
      'Total Students',
      'Passed Students',
      'Failed Students',
      'Pass Percentage'
    ];

    headers.forEach((header, index) => {
      const cell = sheet.getCell(3, index + 1);
      cell.value = header;
      cell.style = this.headerStyle;
    });
    sheet.getRow(3).height = 25;

    // Subject data with analysis
    (reportData.subjectResults || []).forEach((subject, index) => {
      const row = sheet.getRow(4 + index);
      const failedStudents = subject.totalStudents - subject.passedStudents;
      
      row.getCell(1).value = subject.subjectCode;
      row.getCell(2).value = subject.subjectName || subject.subjectCode;
      row.getCell(3).value = subject.totalStudents;
      row.getCell(4).value = subject.passedStudents;
      row.getCell(5).value = failedStudents;
      row.getCell(6).value = `${subject.passPercentage.toFixed(1)}%`;
      
      // Status based on pass percentage
      let status = 'Poor';
      let statusColor = 'FEE2E2';
      if (subject.passPercentage >= 80) {
        status = 'Excellent';
        statusColor = 'D1FAE5';
      } else if (subject.passPercentage >= 65) {
        status = 'Good';
        statusColor = 'FEF3C7';
      } else if (subject.passPercentage >= 50) {
        status = 'Average';
        statusColor = 'F3E8FF';
      }
      
      const statusCell = row.getCell(7);
      statusCell.value = status;
      statusCell.style = {
        ...this.cellStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } }
      };

      // Apply styles to other cells
      [1, 2, 3, 4, 5, 6].forEach(col => {
        row.getCell(col).style = this.cellStyle;
      });
      
      row.height = 20;
    });

    // Add summary section
    const summaryRow = 4 + (reportData.subjectResults || []).length + 2;
    sheet.mergeCells(`A${summaryRow}:G${summaryRow}`);
    const summaryCell = sheet.getCell(`A${summaryRow}`);
    summaryCell.value = 'ANALYSIS SUMMARY';
    summaryCell.style = {
      font: { name: 'Arial', size: 12, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } }
    };

    // Summary data
    const summaryData = [
      ['Total Students Analyzed:', reportData.totalStudents],
      ['Total Subjects:', reportData.totalSubjects],
      ['Overall Pass Percentage:', `${(reportData.overallPassPercentage || 0).toFixed(1)}%`],
      ['Report Generated:', new Date().toLocaleString()]
    ];

    summaryData.forEach((data, index) => {
      const row = sheet.getRow(summaryRow + 2 + index);
      row.getCell(1).value = data[0];
      row.getCell(2).value = data[1];
      
      row.getCell(1).style = {
        font: { name: 'Arial', size: 10, bold: true },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
      row.getCell(2).style = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
    });
  }

  /**
   * Create editable grades sheet for faculty to modify
   */
  async createEditableGradesSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Editable Grades');

    // Set column widths
    sheet.getColumn(1).width = 8;  // S.No
    sheet.getColumn(2).width = 15; // Reg No
    sheet.getColumn(3).width = 25; // Name
    
    const subjectCodes = (reportData.subjectResults || []).map(s => s.subjectCode);
    subjectCodes.forEach((_, index) => {
      sheet.getColumn(4 + index).width = 12;
    });

    // Title with editing instructions
    sheet.mergeCells(1, 1, 1, 3 + subjectCodes.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = 'EDITABLE GRADES SHEET - Click on grade cells to modify';
    titleCell.style = {
      font: { name: 'Arial', size: 12, bold: true, color: { argb: '1F2937' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }
    };
    sheet.getRow(1).height = 30;

    // Headers
    const headers = ['S.No', 'Reg No', 'Student Name', ...subjectCodes];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(3, index + 1);
      cell.value = header;
      cell.style = {
        ...this.headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } }
      };
    });
    sheet.getRow(3).height = 25;

    // Student data with editable grades
    (reportData.studentsData || []).forEach((student, studentIndex) => {
      const row = sheet.getRow(4 + studentIndex);
      
      // Non-editable student info
      row.getCell(1).value = studentIndex + 1;
      row.getCell(2).value = student.regNo;
      row.getCell(3).value = student.name;
      
      // Apply protection to non-editable cells
      [1, 2, 3].forEach(col => {
        row.getCell(col).style = {
          ...this.cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } }
        };
        row.getCell(col).protection = { locked: true };
      });

      // Editable grade cells
      subjectCodes.forEach((subjectCode, subjectIndex) => {
        const grade = student.grades[subjectCode] || '';
        const cell = row.getCell(4 + subjectIndex);
        cell.value = grade;
        
        // Make grades editable
        cell.protection = { locked: false };
        
        // Style editable cells differently
        cell.style = {
          ...this.cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } },
          border: {
            top: { style: 'medium', color: { argb: '10B981' } },
            left: { style: 'medium', color: { argb: '10B981' } },
            bottom: { style: 'medium', color: { argb: '10B981' } },
            right: { style: 'medium', color: { argb: '10B981' } }
          }
        };
        
        // Add data validation for grades
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"O,A+,A,B+,B,C,P,U,F,-"'],
          showErrorMessage: true,
          errorTitle: 'Invalid Grade',
          errorStyle: 'error',
          error: 'Please select a valid grade from the dropdown.'
        };
      });
      
      row.height = 20;
    });

    // Add instructions
    const instructionsRow = 4 + (reportData.studentsData || []).length + 2;
    sheet.mergeCells(`A${instructionsRow}:${String.fromCharCode(67 + subjectCodes.length)}${instructionsRow + 4}`);
    const instructionsCell = sheet.getCell(`A${instructionsRow}`);
    instructionsCell.value = `INSTRUCTIONS FOR EDITING:

1. Click on any green grade cell to edit the grade
2. Use the dropdown list to select valid grades: O, A+, A, B+, B, C, P, U, F, or leave blank (-)
3. Gray cells (Student info) are protected and cannot be edited
4. Save the file after making changes
5. Changes will be reflected in analysis automatically

Valid Grades:
O = Outstanding, A+ = Excellent, A = Very Good, B+ = Good, B = Above Average
C = Average, P = Pass, U = Fail, F = Fail, - = Not Applicable`;

    instructionsCell.style = {
      font: { name: 'Arial', size: 9 },
      alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9FF' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Set row heights for instructions
    for (let i = 0; i < 5; i++) {
      sheet.getRow(instructionsRow + i).height = 20;
    }

    // Protect the sheet but allow editing of grade cells
    await sheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false
    });

    // Freeze panes
    sheet.views = [{
      state: 'frozen',
      xSplit: 3,
      ySplit: 3
    }];
  }

  /**
   * Create enhanced summary sheet with additional information
   */
  async createEnhancedSummarySheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Enhanced Summary');
    
    // This will include charts, additional metrics, and enhanced formatting
    await this.createSummarySheet(workbook, reportData);
    
    // Remove the basic summary sheet since we have enhanced version
    workbook.removeWorksheet('Summary');
  }

  /**
   * Create faculty information sheet
   */
  async createFacultyInfoSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Faculty Information');

    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 30;

    // Title
    sheet.mergeCells('A1:B1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'FACULTY INFORMATION';
    titleCell.style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Faculty details
    const facultyInfo = [
      ['Faculty Name:', reportData.facultyName || ''],
      ['Department:', reportData.department || ''],
      ['Academic Year:', reportData.academicYear || ''],
      ['Semester:', reportData.semester || ''],
      ['Subjects Handled:', ''],
      ['', '']
    ];

    facultyInfo.forEach(([label, value], index) => {
      const row = sheet.getRow(3 + index);
      row.getCell(1).value = label;
      row.getCell(2).value = value;
      
      row.getCell(1).style = {
        font: { name: 'Arial', size: 10, bold: true },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
      row.getCell(2).style = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
    });

    // Subject assignments
    let currentRow = 3 + facultyInfo.length + 1;
    (reportData.subjectResults || []).forEach((subject, index) => {
      const row = sheet.getRow(currentRow + index);
      row.getCell(1).value = `Subject ${index + 1}:`;
      row.getCell(2).value = `${subject.subjectCode} - ${subject.subjectName || subject.subjectCode}`;
      
      row.getCell(1).style = {
        font: { name: 'Arial', size: 10, bold: true },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
      row.getCell(2).style = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
    });
  }

  /**
   * Create charts sheet (placeholder for future chart implementation)
   */
  async createChartsSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Charts & Graphs');

    // Title
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'PERFORMANCE CHARTS AND GRAPHS';
    titleCell.style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Placeholder for charts
    sheet.getCell('A3').value = 'Charts and graphs will be available in future versions.';
    sheet.getCell('A4').value = 'Current data can be used to create charts manually in Excel.';
    
    // Data for chart creation
    sheet.getCell('A6').value = 'Subject Performance Data:';
    sheet.getCell('A6').style = {
      font: { name: 'Arial', size: 12, bold: true }
    };

    // Headers for chart data
    const chartHeaders = ['Subject Code', 'Pass Percentage'];
    chartHeaders.forEach((header, index) => {
      const cell = sheet.getCell(8, index + 1);
      cell.value = header;
      cell.style = this.headerStyle;
    });

    // Chart data
    (reportData.subjectResults || []).forEach((subject, index) => {
      const row = sheet.getRow(9 + index);
      row.getCell(1).value = subject.subjectCode;
      row.getCell(2).value = subject.passPercentage;
      
      [1, 2].forEach(col => {
        row.getCell(col).style = this.cellStyle;
      });
    });
  }

  /**
   * Create institutional template sheet matching exact provided format
   */
  async createInstitutionalTemplateSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Result Analysis Report');

    // Set up page for landscape printing to match template
    sheet.pageSetup = {
      paperSize: 9,
      orientation: 'landscape',
      margins: {
        left: 0.5, right: 0.5,
        top: 0.5, bottom: 0.5,
        header: 0.3, footer: 0.3
      }
    };

    // Define and set column widths for a professional layout
    const columnWidths = [
      { index: 1, width: 8 },   // S.NO
      { index: 2, width: 18 },  // COURSE CODE
      { index: 3, width: 50 },  // NAME OF THE SUBJECT
      { index: 4, width: 35 },  // NAME OF THE FACULTY
      { index: 5, width: 20 },  // DEPARTMENT
      { index: 6, width: 15 },  // APPEARED
      { index: 7, width: 20 },  // PASSED BEFORE REVALUATION
      { index: 8, width: 20 },  // PASSED AFTER REVALUATION
      { index: 9, width: 25 },  // % OF PASS BEFORE REVALUATION
      { index: 10, width: 25 }  // % OF PASS AFTER REVALUATION
    ];

    columnWidths.forEach(col => {
      sheet.getColumn(col.index).width = col.width;
    });

    // Title row - INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY - ERODE - 638 316
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY - ERODE - 638 316';
    titleCell.style = {
      font: { name: 'Arial', size: 12, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
    sheet.getRow(1).height = 25;

    // Subtitle row - RESULT ANALYSIS NOV/DEC 2024
    sheet.mergeCells('A2:J2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `RESULT ANALYSIS NOV/DEC ${new Date().getFullYear()}`;
    subtitleCell.style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { left: { style: 'thin' }, right: { style: 'thin' } }
    };
    sheet.getRow(2).height = 20;

    // Course info row - DEGREE:B.TECH    BRANCH:IT    SEM: I
    sheet.mergeCells('A3:J3');
    const courseCell = sheet.getCell('A3');
    courseCell.value = `DEGREE: B.TECH                    BRANCH: ${reportData.department || 'IT'}                    SEM: ${reportData.semester || 'I'}`;
    courseCell.style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
    };
    sheet.getRow(3).height = 22;

    // Headers row
    const headers = [
      'S.NO',
      'COURSE CODE', 
      'NAME OF THE SUBJECT',
      'NAME OF THE STAFF HANDLED THE SUBJECT',
      'DEPARTMENT OF THE STAFF',
      'APPEARED',
      'PASSED BEFORE REVALUATION',
      'PASSED AFTER REVALUATION', 
      'PERCENTAGE OF PASS BEFORE REVALUATION',
      'PERCENTAGE OF PASS AFTER REVALUATION'
    ];

    headers.forEach((header, index) => {
      const cell = sheet.getCell(4, index + 1);
      cell.value = header;
      cell.style = {
        font: { name: 'Arial', size: 9, bold: true },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    });
    sheet.getRow(4).height = 60; // Taller for wrapped text

    // Calculate dynamic number of rows based on semester
    const semesterNumber = parseInt(reportData.semester) || 1;
    let maxRows = 8; // Default for most semesters
    
    // Adjust based on semester (typically more subjects in higher semesters)
    if (semesterNumber >= 5) maxRows = 10;
    if (semesterNumber >= 7) maxRows = 12;
    
    // Or use actual subject count if available
    if (reportData.subjectResults && reportData.subjectResults.length > 0) {
      maxRows = Math.max(reportData.subjectResults.length + 2, 8);
    }

    // Data rows - create empty template with editable cells
    for (let i = 0; i < maxRows; i++) {
      const row = sheet.getRow(5 + i);
      
      // Serial number
      row.getCell(1).value = i + 1;
      row.getCell(1).style = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      // Fill with actual data if available
      if (i < (reportData.subjectResults || []).length) {
        const subject = reportData.subjectResults[i];
        const facultyName = reportData.facultyAssignments?.[subject.subjectCode] || '';
        
        // Course Code
        row.getCell(2).value = subject.subjectCode || '';
        
        // Subject Name  
        row.getCell(3).value = subject.subjectName || subject.subjectCode || '';
        
        // Faculty Name (editable)
        row.getCell(4).value = facultyName;
        
        // Department (editable)
        row.getCell(5).value = reportData.facultyDepartment || reportData.department || '';
        
        // Appeared
        row.getCell(6).value = subject.totalStudents || '';
        
        // Passed Before
        row.getCell(7).value = subject.passedStudents || '';
        
        // Passed After (same as before for now)
        row.getCell(8).value = subject.passedStudents || '';
        
        // Percentage Before
        row.getCell(9).value = subject.passPercentage ? `${subject.passPercentage.toFixed(1)}%` : '';
        
        // Percentage After (same as before for now)
        row.getCell(10).value = subject.passPercentage ? `${subject.passPercentage.toFixed(1)}%` : '';
      } else {
        // Empty rows for manual entry
        for (let col = 2; col <= 10; col++) {
          row.getCell(col).value = '';
        }
      }

      // Apply styles to all data cells with appropriate alignment
      for (let col = 2; col <= 10; col++) {
        const cell = row.getCell(col);
        
        // Set alignment based on content type
        let alignment = { vertical: 'middle', horizontal: 'center' };
        if (col === 3) { // Subject name - left align for better readability
          alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (col === 4) { // Faculty name - left align for better readability
          alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (col === 5) { // Department - left align for better readability
          alignment = { vertical: 'middle', horizontal: 'left' };
        }
        
        cell.style = {
          font: { name: 'Arial', size: 10 },
          alignment: alignment,
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
        
        // Make faculty name and department cells editable with light green background
        if (col === 4 || col === 5) {
          cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } };
          cell.protection = { locked: false };
        } else {
          // Lock other cells
          cell.protection = { locked: true };
        }
      }
      
      row.height = 30; // Increased height for better visual spacing
    }

    // Summary section at bottom
    const summaryStartRow = 5 + maxRows + 2;
    
    // NO.OF STUDENTS APPEARED
    sheet.getCell(`A${summaryStartRow}`).value = 'NO.OF STUDENTS APPEARED';
    sheet.getCell(`A${summaryStartRow}`).style = {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { vertical: 'middle', horizontal: 'left' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Box for student count
    sheet.mergeCells(`B${summaryStartRow}:C${summaryStartRow}`);
    const appearedCell = sheet.getCell(`B${summaryStartRow}`);
    appearedCell.value = reportData.totalStudents || '';
    appearedCell.style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } }
    };

    // NO.OF STUDENTS PASSED  
    sheet.getCell(`A${summaryStartRow + 1}`).value = 'NO.OF STUDENTS PASSED';
    sheet.getCell(`A${summaryStartRow + 1}`).style = {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { vertical: 'middle', horizontal: 'left' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Box for passed count
    sheet.mergeCells(`B${summaryStartRow + 1}:C${summaryStartRow + 1}`);
    const passedCell = sheet.getCell(`B${summaryStartRow + 1}`);
    const passedCount = reportData.totalStudents ? Math.round(reportData.totalStudents * (reportData.overallPassPercentage || 0) / 100) : '';
    passedCell.value = passedCount;
    passedCell.style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } }
    };

    // OVER ALL PASS PERCENTAGE
    sheet.getCell(`A${summaryStartRow + 2}`).value = 'OVER ALL PASS PERCENTAGE';
    sheet.getCell(`A${summaryStartRow + 2}`).style = {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { vertical: 'middle', horizontal: 'left' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Box for percentage
    sheet.mergeCells(`B${summaryStartRow + 2}:C${summaryStartRow + 2}`);
    const percentageCell = sheet.getCell(`B${summaryStartRow + 2}`);
    percentageCell.value = reportData.overallPassPercentage ? `${reportData.overallPassPercentage.toFixed(1)}%` : '';
    percentageCell.style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } }
    };

    // Signature section
    const sigRow = summaryStartRow + 5;
    
    sheet.getCell(`A${sigRow}`).value = 'CLASS ADVISOR';
    sheet.getCell(`A${sigRow}`).style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    
    sheet.getCell(`D${sigRow}`).value = 'HEAD OF THE DEPARTMENT';
    sheet.getCell(`D${sigRow}`).style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    
    sheet.getCell(`H${sigRow}`).value = 'PRINCIPAL';
    sheet.getCell(`H${sigRow}`).style = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Signature lines
    sheet.getCell(`A${sigRow + 3}`).value = '________________________';
    sheet.getCell(`D${sigRow + 3}`).value = '________________________';
    sheet.getCell(`H${sigRow + 3}`).value = '________________________';

    // Protect the sheet but allow editing of specific cells
    await sheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false
    });
  }

  /**
   * Create main institutional sheet matching exact template format
   */
    async createInstitutionalMainSheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Result Analysis Report');

    // Set up page for landscape printing
    sheet.pageSetup = {
      paperSize: 9,
      orientation: 'landscape',
      margins: {
        left: 0.7, right: 0.7,
        top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3
      }
    };

    // Title
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${reportData.instituteName || 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY'} - ${reportData.instituteLocation || 'ERODE - 638 316'}`;
    titleCell.style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Subtitle
    sheet.mergeCells('A2:J2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `RESULT ANALYSIS - ${reportData.monthsAndYear || 'APRIL/MAY 2024'}`;
    subtitleCell.style = {
      font: { name: 'Arial', size: 12, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Course info
    sheet.getCell('A4').value = 'DEGREE: B.TECH';

    // Class Advisor
    sheet.mergeCells('A5:C5');
    const advisorCell = sheet.getCell('A5');
    advisorCell.value = `CLASS ADVISOR: ${reportData.classAdvisorName || ''}`;
    advisorCell.style = { font: { name: 'Arial', size: 10, bold: true }, alignment: { vertical: 'middle', horizontal: 'left' } };
    sheet.getCell('D4').value = `BRANCH: ${reportData.department || 'IT'}`;
    sheet.getCell('G4').value = `SEM: ${reportData.semester || 'I'}`;

    // Set column widths for institutional format
    const columnWidths = [5, 8, 25, 25, 12, 10, 8, 8, 15, 15];
    columnWidths.forEach((width, index) => {
      sheet.getColumn(index + 1).width = width;
    });

    // Header
    const headers = [
      'S.NO', 'COURSE CODE', 'NAME OF THE SUBJECT', 'NAME OF THE STAFF HANDLED THE SUBJECT',
      'DEPT', 'APPEARED', 'PASSED BEFORE', 'PASSED AFTER', 'PERCENTAGE BEFORE', 'PERCENTAGE AFTER'
    ];

    headers.forEach((header, index) => {
      const cell = sheet.getCell(6, index + 1);
      cell.value = header;
      cell.style = {
        ...this.headerStyle,
        font: { name: 'Arial', size: 9, bold: true }
      };
    });
    sheet.getRow(6).height = 30;

    // Data rows
    const maxRows = Math.max((reportData.subjectResults || []).length, 10);
    for (let i = 0; i < maxRows; i++) {
      const row = sheet.getRow(7 + i);
      row.getCell(1).value = i + 1;

      if (i < (reportData.subjectResults || []).length) {
        const subject = reportData.subjectResults[i];
        const facultyName = reportData.facultyAssignments?.[subject.subjectCode] || '';
        
        row.getCell(2).value = subject.subjectCode;
        row.getCell(3).value = subject.subjectName || subject.subjectCode;
        row.getCell(4).value = facultyName;
        row.getCell(5).value = reportData.department;
        row.getCell(6).value = subject.totalStudents;
        row.getCell(7).value = subject.passedStudents;
        row.getCell(8).value = ''; // PASSED AFTER - leave empty
        row.getCell(9).value = `${subject.passPercentage.toFixed(1)}%`;
        row.getCell(10).value = ''; // PERCENTAGE AFTER - leave empty
      }

      // Apply styles
      for (let col = 1; col <= 10; col++) {
        row.getCell(col).style = {
          ...this.cellStyle,
          alignment: { ...this.cellStyle.alignment, wrapText: true },
          font: { name: 'Arial', size: 9 }
        };
      }
      row.height = 24; 
    }

    // --- Re-evaluation Summary Table and Signature Section ---
    const summaryStartRow = 7 + maxRows + 2; // Start 2 rows after the main table

    // Re-evaluation table headers
    const revalHeaderRow = sheet.getRow(summaryStartRow);
    sheet.mergeCells(summaryStartRow, 4, summaryStartRow, 6);
    const beforeCell = sheet.getCell(summaryStartRow, 4);
    beforeCell.value = 'BEFORE REVALUATION';
    beforeCell.style = { ...this.headerStyle, font: { name: 'Arial', size: 10, bold: true }, alignment: { ...this.headerStyle.alignment, horizontal: 'center' } };

    sheet.mergeCells(summaryStartRow, 7, summaryStartRow, 9);
    const afterCell = sheet.getCell(summaryStartRow, 7);
    afterCell.value = 'AFTER REVALUATION';
    afterCell.style = { ...this.headerStyle, font: { name: 'Arial', size: 10, bold: true }, alignment: { ...this.headerStyle.alignment, horizontal: 'center' } };

    // Re-evaluation table data
    const totalStudents = reportData.analysisData?.totalStudents || 0;
    const passedBefore = reportData.analysisData?.subjectWiseResults?.reduce((acc, subject) => acc + subject.passedStudents, 0) || 0; 
    const passPercentageBefore = reportData.analysisData?.overallPassPercentage || 0;

    const summaryData = [
      ['NO. OF STUDENTS APPEARED', totalStudents, ''],
      ['NO. OF STUDENTS PASSED', passedBefore, ''],
      ['OVERALL PASS PERCENTAGE', `${passPercentageBefore.toFixed(2)}`, '']
    ];

    summaryData.forEach((data, index) => {
      const dataRowIndex = summaryStartRow + 1 + index;
      const dataRow = sheet.getRow(dataRowIndex);
      dataRow.height = 20;

      // Label
      sheet.mergeCells(dataRowIndex, 1, dataRowIndex, 3);
      const labelCell = dataRow.getCell(1);
      labelCell.value = data[0];
      labelCell.style = { ...this.cellStyle, font: { name: 'Arial', size: 10, bold: true }, alignment: { ...this.cellStyle.alignment, horizontal: 'left', indent: 1 } };

      // Before Value
      sheet.mergeCells(dataRowIndex, 4, dataRowIndex, 6);
      const beforeValueCell = dataRow.getCell(4);
      beforeValueCell.value = data[1];
      beforeValueCell.style = this.cellStyle;

      // After Value
      sheet.mergeCells(dataRowIndex, 7, dataRowIndex, 9);
      const afterValueCell = dataRow.getCell(7);
      afterValueCell.value = data[2];
      afterValueCell.style = this.cellStyle;
    });

    // Signature Section
    const signatureRow = summaryStartRow + summaryData.length + 4;
    sheet.getRow(signatureRow).height = 25;

    const signatureCell1 = sheet.getCell(signatureRow, 1);
    signatureCell1.value = 'CLASS ADVISOR';
    signatureCell1.style = { font: { name: 'Arial', size: 10, bold: true }, alignment: { vertical: 'bottom', horizontal: 'left' } };

    const signatureCell2 = sheet.getCell(signatureRow, 4);
    signatureCell2.value = 'HEAD OF THE DEPARTMENT';
    signatureCell2.style = { font: { name: 'Arial', size: 10, bold: true }, alignment: { vertical: 'bottom', horizontal: 'center' } };

    const signatureCell3 = sheet.getCell(signatureRow, 9);
    signatureCell3.value = 'PRINCIPAL';
    signatureCell3.style = { font: { name: 'Arial', size: 10, bold: true }, alignment: { vertical: 'bottom', horizontal: 'right' } };
  }

  /**
   * Create institutional summary sheet
   */
  async createInstitutionalSummarySheet(workbook, reportData) {
    const sheet = workbook.addWorksheet('Institutional Summary');

    // Summary statistics
    sheet.getCell('A1').value = 'INSTITUTIONAL SUMMARY';
    sheet.getCell('A1').style = {
      font: { name: 'Arial', size: 14, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const summaryData = [
      ['Total Students Appeared:', reportData.totalStudents || 0],
      ['Total Students Passed:', Math.round((reportData.totalStudents || 0) * (reportData.overallPassPercentage || 0) / 100)],
      ['Overall Pass Percentage:', `${(reportData.overallPassPercentage || 0).toFixed(1)}%`],
      ['Department:', reportData.department || 'N/A'],
      ['Semester:', reportData.semester || 'N/A'],
      ['Academic Year:', reportData.academicYear || 'N/A']
    ];

    summaryData.forEach((data, index) => {
      const row = sheet.getRow(3 + index);
      row.getCell(1).value = data[0];
      row.getCell(2).value = data[1];
      
      row.getCell(1).style = {
        font: { name: 'Arial', size: 10, bold: true },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
      row.getCell(2).style = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };
    });

    // Signature section
    const sigRow = 3 + summaryData.length + 3;
    ['CLASS ADVISOR', 'HEAD OF THE DEPARTMENT', 'PRINCIPAL'].forEach((title, index) => {
      sheet.getCell(sigRow, 1 + index * 3).value = title;
      sheet.getCell(sigRow + 2, 1 + index * 3).value = '________________';
    });
  }

  /**
   * Create editable institutional sheet
   */
  async createEditableInstitutionalSheet(workbook, reportData) {
    // Similar to editable grades but in institutional format
    const sheet = workbook.addWorksheet('Editable Institutional');

    sheet.getCell('A1').value = 'EDITABLE INSTITUTIONAL FORMAT';
    sheet.getCell('A1').style = {
      font: { name: 'Arial', size: 12, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }
    };

    sheet.getCell('A2').value = 'This sheet allows editing of faculty assignments and other institutional data.';
  }

  /**
   * Convert Excel workbook to JSON for preview
   */
  async convertToPreviewData(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const previewData = {};
      
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetData = [];
        const sheetName = worksheet.name;
        
        worksheet.eachRow((row, rowNumber) => {
          const rowData = [];
          row.eachCell((cell, colNumber) => {
            rowData.push({
              value: cell.value,
              style: {
                font: cell.font,
                fill: cell.fill,
                border: cell.border,
                alignment: cell.alignment
              }
            });
          });
          sheetData.push(rowData);
        });
        
        previewData[sheetName] = sheetData;
      });

      return previewData;
    } catch (error) {
      console.error('Error converting Excel to preview data:', error);
      throw error;
    }
  }

  /**
   * Update Excel file with new data
   */
  async updateExcelFile(filePath, updateData) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      // Update specific cells based on updateData
      Object.keys(updateData).forEach(sheetName => {
        const worksheet = workbook.getWorksheet(sheetName);
        if (worksheet) {
          updateData[sheetName].forEach(update => {
            const cell = worksheet.getCell(update.row, update.col);
            cell.value = update.value;
          });
        }
      });

      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (error) {
      console.error('Error updating Excel file:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const excelReportService = new ExcelReportService();

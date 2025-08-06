import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { fileURLToPath } from 'url';

/**
 * PDF Report Generation Service
 * Creates semester result reports in the exact format shown in the provided image
 */
export class PDFReportService {
  constructor() {
    this.pageWidth = 612; // A4 width in points
    this.pageHeight = 792; // A4 height in points
    this.margin = 30;
    this.contentWidth = this.pageWidth - (2 * this.margin);
  }

  /**
   * Generate a complete semester result PDF report
   */
  async generateSemesterReport(reportData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFKit({
          size: 'A4',
          margin: this.margin,
          bufferPages: true
        });

        // Create write stream
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Generate the report content
        this.addHeader(doc, reportData);
        this.addFacultySection(doc, reportData);
        this.addResultTable(doc, reportData);
        this.addSubjectAnalysis(doc, reportData);

        // Finalize the document
        doc.end();

        // Handle stream completion
        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add the header section with title and semester info
   */
  addHeader(doc, reportData) {
    const { semester, academicYear, department } = reportData;
    
    // Main title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('SEMESTER RESULT ANALYSIS REPORT', this.margin, 50, {
         width: this.contentWidth,
         align: 'center'
       });

    // Subtitle
    doc.fontSize(12)
       .font('Helvetica')
       .text(`${department} Department - Semester ${semester} (${academicYear})`, {
         width: this.contentWidth,
         align: 'center'
       });

    // Add some spacing
    doc.moveDown(2);
  }

  /**
   * Add the faculty information section with editing area
   */
  addFacultySection(doc, reportData) {
    const startY = doc.y;
    
    // Faculty section box
    doc.rect(this.margin, startY, this.contentWidth, 60)
       .stroke();

    // Faculty label and name field
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('NAME OF THE FACULTY HANDLED:', this.margin + 10, startY + 15);
    
    // Faculty name (editable area)
    const facultyNameX = this.margin + 200;
    doc.rect(facultyNameX, startY + 10, 250, 20)
       .stroke();
       
    if (reportData.facultyName) {
      doc.fontSize(11)
         .font('Helvetica')
         .text(reportData.facultyName, facultyNameX + 5, startY + 15);
    }

    // Result analysis info
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Analysis Date: ${new Date().toLocaleDateString()}`, this.margin + 10, startY + 40)
       .text(`Total Students: ${reportData.totalStudents}`, this.margin + 200, startY + 40)
       .text(`Overall Pass %: ${reportData.overallPassPercentage.toFixed(1)}%`, this.margin + 350, startY + 40);

    doc.y = startY + 80;
  }

  /**
   * Add the main result table matching the image format
   */
  addResultTable(doc, reportData) {
    const { studentsData, subjectResults } = reportData;
    const startY = doc.y;
    
    // Table dimensions
    const tableWidth = this.contentWidth;
    const rowHeight = 25;
    const headerHeight = 40;
    
    // Column widths
    const regNoWidth = 80;
    const nameWidth = 120;
    const subjectColWidth = (tableWidth - regNoWidth - nameWidth) / subjectResults.length;

    // Table header background
    doc.rect(this.margin, startY, tableWidth, headerHeight)
       .fill('#E5E7EB')
       .stroke();

    // Reset fill color
    doc.fill('#000000');

    // Header text
    doc.fontSize(9)
       .font('Helvetica-Bold');

    // Reg No header
    doc.text('REG NO', this.margin + 5, startY + 15, {
      width: regNoWidth - 10,
      align: 'center'
    });

    // Name header
    doc.text('NAME OF THE STUDENT', this.margin + regNoWidth + 5, startY + 15, {
      width: nameWidth - 10,
      align: 'center'
    });

    // Subject headers
    let currentX = this.margin + regNoWidth + nameWidth;
    subjectResults.forEach((subject, index) => {
      doc.text(subject.subjectCode, currentX + 2, startY + 5, {
        width: subjectColWidth - 4,
        align: 'center'
      });
      
      // Subject name (smaller font)
      doc.fontSize(7)
         .text(subject.subjectName || subject.subjectCode, currentX + 2, startY + 20, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      doc.fontSize(9);
      currentX += subjectColWidth;
    });

    // Draw header column separators
    currentX = this.margin + regNoWidth;
    doc.moveTo(currentX, startY)
       .lineTo(currentX, startY + headerHeight)
       .stroke();
    
    currentX += nameWidth;
    doc.moveTo(currentX, startY)
       .lineTo(currentX, startY + headerHeight)
       .stroke();

    subjectResults.forEach(() => {
      currentX += subjectColWidth;
      doc.moveTo(currentX, startY)
         .lineTo(currentX, startY + headerHeight)
         .stroke();
    });

    // Student rows
    let currentY = startY + headerHeight;
    doc.fontSize(8)
       .font('Helvetica');

    studentsData.forEach((student, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > this.pageHeight - this.margin) {
        doc.addPage();
        currentY = this.margin;
        
        // Redraw header on new page
        this.addTableHeader(doc, currentY, subjectResults, regNoWidth, nameWidth, subjectColWidth, headerHeight);
        currentY += headerHeight;
      }

      // Row background (alternating)
      if (index % 2 === 1) {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .fill('#F9FAFB')
           .stroke();
        doc.fill('#000000');
      } else {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .stroke();
      }

      // Student registration number
      doc.text(student.regNo, this.margin + 5, currentY + 8, {
        width: regNoWidth - 10,
        align: 'center'
      });

      // Student name
      doc.text(student.name, this.margin + regNoWidth + 5, currentY + 8, {
        width: nameWidth - 10,
        align: 'left'
      });

      // Grades
      currentX = this.margin + regNoWidth + nameWidth;
      subjectResults.forEach((subject) => {
        const grade = student.grades[subject.subjectCode] || '-';
        
        // Color code the grade
        if (grade === 'U') {
          doc.fill('#DC2626'); // Red for fail
        } else if (grade === '-') {
          doc.fill('#6B7280'); // Gray for no grade
        } else {
          doc.fill('#059669'); // Green for pass
        }
        
        doc.text(grade, currentX + 2, currentY + 8, {
          width: subjectColWidth - 4,
          align: 'center'
        });
        
        doc.fill('#000000'); // Reset color
        currentX += subjectColWidth;
      });

      // Draw column separators for this row
      currentX = this.margin + regNoWidth;
      doc.moveTo(currentX, currentY)
         .lineTo(currentX, currentY + rowHeight)
         .stroke();
      
      currentX += nameWidth;
      doc.moveTo(currentX, currentY)
         .lineTo(currentX, currentY + rowHeight)
         .stroke();

      subjectResults.forEach(() => {
        currentX += subjectColWidth;
        doc.moveTo(currentX, currentY)
           .lineTo(currentX, currentY + rowHeight)
           .stroke();
      });

      currentY += rowHeight;
    });

    doc.y = currentY + 20;
  }

  /**
   * Helper method to redraw table header on new pages
   */
  addTableHeader(doc, startY, subjectResults, regNoWidth, nameWidth, subjectColWidth, headerHeight) {
    const tableWidth = this.contentWidth;
    
    // Header background
    doc.rect(this.margin, startY, tableWidth, headerHeight)
       .fill('#E5E7EB')
       .stroke();
    doc.fill('#000000');

    // Header text
    doc.fontSize(9)
       .font('Helvetica-Bold');

    doc.text('REG NO', this.margin + 5, startY + 15, {
      width: regNoWidth - 10,
      align: 'center'
    });

    doc.text('NAME OF THE STUDENT', this.margin + regNoWidth + 5, startY + 15, {
      width: nameWidth - 10,
      align: 'center'
    });

    let currentX = this.margin + regNoWidth + nameWidth;
    subjectResults.forEach((subject) => {
      doc.text(subject.subjectCode, currentX + 2, startY + 5, {
        width: subjectColWidth - 4,
        align: 'center'
      });
      
      doc.fontSize(7)
         .text(subject.subjectName || subject.subjectCode, currentX + 2, startY + 20, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      doc.fontSize(9);
      currentX += subjectColWidth;
    });

    // Draw separators
    currentX = this.margin + regNoWidth;
    doc.moveTo(currentX, startY).lineTo(currentX, startY + headerHeight).stroke();
    currentX += nameWidth;
    doc.moveTo(currentX, startY).lineTo(currentX, startY + headerHeight).stroke();
    
    subjectResults.forEach(() => {
      currentX += subjectColWidth;
      doc.moveTo(currentX, startY).lineTo(currentX, startY + headerHeight).stroke();
    });
  }

  /**
   * Add subject-wise analysis summary
   */
  addSubjectAnalysis(doc, reportData) {
    const { subjectResults } = reportData;
    
    // Add new page for analysis
    doc.addPage();
    
    // Analysis header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('SUBJECT-WISE ANALYSIS', this.margin, 50, {
         width: this.contentWidth,
         align: 'center'
       });

    doc.moveDown(2);

    // Analysis table
    const startY = doc.y;
    const colWidth = this.contentWidth / 4;
    const rowHeight = 30;

    // Headers
    doc.rect(this.margin, startY, this.contentWidth, rowHeight)
       .fill('#E5E7EB')
       .stroke();
    
    doc.fill('#000000')
       .fontSize(10)
       .font('Helvetica-Bold');

    doc.text('SUBJECT', this.margin + 5, startY + 10, { width: colWidth - 10, align: 'center' });
    doc.text('TOTAL STUDENTS', this.margin + colWidth + 5, startY + 10, { width: colWidth - 10, align: 'center' });
    doc.text('PASSED', this.margin + (2 * colWidth) + 5, startY + 10, { width: colWidth - 10, align: 'center' });
    doc.text('PASS %', this.margin + (3 * colWidth) + 5, startY + 10, { width: colWidth - 10, align: 'center' });

    // Subject rows
    let currentY = startY + rowHeight;
    doc.fontSize(9).font('Helvetica');

    subjectResults.forEach((subject, index) => {
      // Alternating row colors
      if (index % 2 === 1) {
        doc.rect(this.margin, currentY, this.contentWidth, rowHeight)
           .fill('#F9FAFB')
           .stroke();
        doc.fill('#000000');
      } else {
        doc.rect(this.margin, currentY, this.contentWidth, rowHeight)
           .stroke();
      }

      doc.text(subject.subjectCode, this.margin + 5, currentY + 10, { width: colWidth - 10, align: 'center' });
      doc.text(subject.totalStudents.toString(), this.margin + colWidth + 5, currentY + 10, { width: colWidth - 10, align: 'center' });
      doc.text(subject.passedStudents.toString(), this.margin + (2 * colWidth) + 5, currentY + 10, { width: colWidth - 10, align: 'center' });
      doc.text(`${subject.passPercentage.toFixed(1)}%`, this.margin + (3 * colWidth) + 5, currentY + 10, { width: colWidth - 10, align: 'center' });

      // Draw column separators
      for (let i = 1; i < 4; i++) {
        const x = this.margin + (i * colWidth);
        doc.moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke();
      }

      currentY += rowHeight;
    });

    // Add summary statistics
    doc.moveDown(3);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('SUMMARY', { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Total Students Analyzed: ${reportData.totalStudents}`)
       .text(`Total Subjects: ${reportData.totalSubjects}`)
       .text(`Overall Pass Percentage: ${reportData.overallPassPercentage.toFixed(1)}%`)
       .text(`Report Generated: ${new Date().toLocaleString()}`);
  }

  /**
   * Generate an enhanced semester report matching the provided image format
   * This creates a more detailed report with editable form fields
   */
  async generateEnhancedReport(reportData, outputPath, includeFormFields = false) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFKit({
          size: 'A4',
          margin: this.margin,
          bufferPages: true
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Generate enhanced content
        this.addEnhancedHeader(doc, reportData);
        this.addDetailedFacultySection(doc, reportData, includeFormFields);
        this.addBranchSection(doc, reportData, includeFormFields);
        this.addEnhancedResultTable(doc, reportData);
        this.addResultEvaluation(doc, reportData, includeFormFields);

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Enhanced header with proper formatting
   */
  addEnhancedHeader(doc, reportData) {
    // Main title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('COURSE OUTCOME BASED RESULT ANALYSIS', this.margin, 40, {
         width: this.contentWidth,
         align: 'center'
       });

    // Subtitle
    doc.fontSize(12)
       .font('Helvetica')
       .text('SEMESTER RESULT ANALYSIS REPORT', {
         width: this.contentWidth,
         align: 'center'
       });

    doc.moveDown(2);
  }

  /**
   * Detailed faculty section with form fields
   */
  addDetailedFacultySection(doc, reportData, includeFormFields) {
    const startY = doc.y;
    const boxHeight = 100;
    
    // Main info box
    doc.rect(this.margin, startY, this.contentWidth, boxHeight)
       .stroke();

    // Faculty name section
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('NAME OF THE FACULTY HANDLED:', this.margin + 10, startY + 15);
    
    const facultyFieldX = this.margin + 180;
    doc.rect(facultyFieldX, startY + 10, 300, 20)
       .stroke();
    
    if (reportData.facultyName) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(reportData.facultyName, facultyFieldX + 5, startY + 17);
    }

    // Subject code section
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('SUBJECT CODE:', this.margin + 10, startY + 40);
    
    const subjectCodeX = this.margin + 100;
    doc.rect(subjectCodeX, startY + 35, 100, 20)
       .stroke();
    
    // Subject name section
    doc.text('SUBJECT NAME:', this.margin + 220, startY + 40);
    const subjectNameX = this.margin + 310;
    doc.rect(subjectNameX, startY + 35, 200, 20)
       .stroke();

    // Academic info
    doc.text('ACADEMIC YEAR:', this.margin + 10, startY + 65);
    const yearX = this.margin + 100;
    doc.rect(yearX, startY + 60, 100, 20)
       .stroke();
    
    if (reportData.academicYear) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(reportData.academicYear, yearX + 5, startY + 67);
    }

    doc.text('SEMESTER:', this.margin + 220, startY + 65);
    const semesterX = this.margin + 280;
    doc.rect(semesterX, startY + 60, 80, 20)
       .stroke();
    
    if (reportData.semester) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(reportData.semester, semesterX + 5, startY + 67);
    }

    doc.text('DEPARTMENT:', this.margin + 380, startY + 65);
    const deptX = this.margin + 450;
    doc.rect(deptX, startY + 60, 80, 20)
       .stroke();
    
    if (reportData.department) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(reportData.department, deptX + 5, startY + 67);
    }

    doc.y = startY + boxHeight + 20;
  }

  /**
   * Branch section for department details
   */
  addBranchSection(doc, reportData, includeFormFields) {
    const startY = doc.y;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('BRANCH:', this.margin, startY);
    
    const branchX = this.margin + 60;
    doc.rect(branchX, startY - 5, this.contentWidth - 60, 25)
       .stroke();

    if (reportData.department) {
      doc.fontSize(11)
         .font('Helvetica')
         .text(`${reportData.department} Department`, branchX + 10, startY + 2);
    }

    doc.y = startY + 40;
  }

  /**
   * Enhanced result table with proper grade columns
   */
  addEnhancedResultTable(doc, reportData) {
    const { studentsData, subjectResults } = reportData;
    const startY = doc.y;
    
    // Create table structure similar to the image
    const tableWidth = this.contentWidth;
    const rowHeight = 20;
    const headerHeight = 30;
    
    // Define column structure - make it match the image exactly
    const slNoWidth = 30;
    const regNoWidth = 80;
    const nameWidth = 150;
    const remainingWidth = tableWidth - slNoWidth - regNoWidth - nameWidth;
    const gradeColWidth = remainingWidth / subjectResults.length;

    // Table header
    doc.rect(this.margin, startY, tableWidth, headerHeight)
       .fill('#E5E7EB')
       .stroke();
    
    doc.fill('#000000')
       .fontSize(8)
       .font('Helvetica-Bold');

    // Header labels
    doc.text('Sl.No', this.margin + 2, startY + 10, { width: slNoWidth - 4, align: 'center' });
    doc.text('REG NO', this.margin + slNoWidth + 2, startY + 10, { width: regNoWidth - 4, align: 'center' });
    doc.text('NAME OF THE STUDENT', this.margin + slNoWidth + regNoWidth + 2, startY + 10, { width: nameWidth - 4, align: 'center' });
    
    // Subject columns
    let currentX = this.margin + slNoWidth + regNoWidth + nameWidth;
    subjectResults.forEach((subject) => {
      doc.text(subject.subjectCode, currentX + 2, startY + 5, {
        width: gradeColWidth - 4,
        align: 'center'
      });
      
      // Add subject details in smaller text
      doc.fontSize(6)
         .text(`(${subject.subjectName || subject.subjectCode})`, currentX + 2, startY + 18, {
           width: gradeColWidth - 4,
           align: 'center'
         });
      
      doc.fontSize(8);
      currentX += gradeColWidth;
    });

    // Draw header separators
    this.drawTableSeparators(doc, startY, startY + headerHeight, slNoWidth, regNoWidth, nameWidth, gradeColWidth, subjectResults.length);

    // Student data rows
    let currentY = startY + headerHeight;
    doc.fontSize(8).font('Helvetica');

    studentsData.forEach((student, index) => {
      // Check for page break
      if (currentY + rowHeight > this.pageHeight - this.margin - 50) {
        doc.addPage();
        currentY = this.margin + 30;
        
        // Redraw header
        this.addEnhancedTableHeader(doc, currentY, subjectResults, slNoWidth, regNoWidth, nameWidth, gradeColWidth, headerHeight);
        currentY += headerHeight;
      }

      // Row background
      if (index % 2 === 1) {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .fill('#F9FAFB')
           .stroke();
        doc.fill('#000000');
      } else {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .stroke();
      }

      // Row content
      doc.text((index + 1).toString(), this.margin + 2, currentY + 6, { width: slNoWidth - 4, align: 'center' });
      doc.text(student.regNo, this.margin + slNoWidth + 2, currentY + 6, { width: regNoWidth - 4, align: 'center' });
      doc.text(student.name, this.margin + slNoWidth + regNoWidth + 2, currentY + 6, { width: nameWidth - 4, align: 'left' });
      
      // Grades
      currentX = this.margin + slNoWidth + regNoWidth + nameWidth;
      subjectResults.forEach((subject) => {
        const grade = student.grades[subject.subjectCode] || '-';
        
        // Color coding
        if (grade === 'U' || grade === 'F') {
          doc.fill('#DC2626'); // Red
        } else if (grade === '-' || grade === '') {
          doc.fill('#6B7280'); // Gray
        } else {
          doc.fill('#059669'); // Green
        }
        
        doc.text(grade, currentX + 2, currentY + 6, {
          width: gradeColWidth - 4,
          align: 'center'
        });
        
        doc.fill('#000000');
        currentX += gradeColWidth;
      });

      // Draw row separators
      this.drawTableSeparators(doc, currentY, currentY + rowHeight, slNoWidth, regNoWidth, nameWidth, gradeColWidth, subjectResults.length);
      
      currentY += rowHeight;
    });

    doc.y = currentY + 20;
  }

  /**
   * Helper to draw table separators
   */
  drawTableSeparators(doc, startY, endY, slNoWidth, regNoWidth, nameWidth, gradeColWidth, numSubjects) {
    // Vertical separators
    let x = this.margin + slNoWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    x += regNoWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    x += nameWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    // Subject column separators
    for (let i = 0; i < numSubjects; i++) {
      x += gradeColWidth;
      doc.moveTo(x, startY).lineTo(x, endY).stroke();
    }
  }

  /**
   * Helper to redraw enhanced table header
   */
  addEnhancedTableHeader(doc, startY, subjectResults, slNoWidth, regNoWidth, nameWidth, gradeColWidth, headerHeight) {
    const tableWidth = this.contentWidth;
    
    doc.rect(this.margin, startY, tableWidth, headerHeight)
       .fill('#E5E7EB')
       .stroke();
    
    doc.fill('#000000')
       .fontSize(8)
       .font('Helvetica-Bold');

    doc.text('Sl.No', this.margin + 2, startY + 10, { width: slNoWidth - 4, align: 'center' });
    doc.text('REG NO', this.margin + slNoWidth + 2, startY + 10, { width: regNoWidth - 4, align: 'center' });
    doc.text('NAME OF THE STUDENT', this.margin + slNoWidth + regNoWidth + 2, startY + 10, { width: nameWidth - 4, align: 'center' });
    
    let currentX = this.margin + slNoWidth + regNoWidth + nameWidth;
    subjectResults.forEach((subject) => {
      doc.text(subject.subjectCode, currentX + 2, startY + 5, {
        width: gradeColWidth - 4,
        align: 'center'
      });
      
      doc.fontSize(6)
         .text(`(${subject.subjectName || subject.subjectCode})`, currentX + 2, startY + 18, {
           width: gradeColWidth - 4,
           align: 'center'
         });
      
      doc.fontSize(8);
      currentX += gradeColWidth;
    });

    this.drawTableSeparators(doc, startY, startY + headerHeight, slNoWidth, regNoWidth, nameWidth, gradeColWidth, subjectResults.length);
  }

  /**
   * Add result evaluation section with editable fields
   */
  addResultEvaluation(doc, reportData, includeFormFields) {
    // Add new page for evaluation
    doc.addPage();
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('RESULT EVALUATION', this.margin, 50, {
         width: this.contentWidth,
         align: 'center'
       });

    doc.moveDown(2);
    
    const startY = doc.y;
    const sectionHeight = 40;
    
    // Before Remedial Actions section
    doc.rect(this.margin, startY, this.contentWidth, sectionHeight)
       .stroke();
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('BEFORE REMEDIAL ACTIONS:', this.margin + 10, startY + 5);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('SUBJECT WISE RESULT:', this.margin + 10, startY + 20);
    
    // Add statistics boxes
    let currentY = startY + sectionHeight + 10;
    
    // Statistics grid
    const statBoxWidth = (this.contentWidth - 30) / 3;
    const statBoxHeight = 60;
    
    // Subject statistics
    reportData.subjectResults.forEach((subject, index) => {
      if (index % 3 === 0 && index > 0) {
        currentY += statBoxHeight + 10;
      }
      
      const xPos = this.margin + (index % 3) * (statBoxWidth + 10);
      
      doc.rect(xPos, currentY, statBoxWidth, statBoxHeight)
         .stroke();
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text(subject.subjectCode, xPos + 5, currentY + 5, {
           width: statBoxWidth - 10,
           align: 'center'
         });
      
      doc.fontSize(8)
         .font('Helvetica')
         .text(`Total: ${subject.totalStudents}`, xPos + 5, currentY + 20)
         .text(`Pass: ${subject.passedStudents}`, xPos + 5, currentY + 32)
         .text(`Pass %: ${subject.passPercentage.toFixed(1)}%`, xPos + 5, currentY + 44);
    });
    
    // After remedial section
    currentY += statBoxHeight + 30;
    
    doc.rect(this.margin, currentY, this.contentWidth, sectionHeight)
       .stroke();
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('AFTER REMEDIAL ACTIONS:', this.margin + 10, currentY + 5);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('SUBJECT WISE RESULT:', this.margin + 10, currentY + 20);
    
    // Add summary
    currentY += sectionHeight + 20;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('OVERALL SUMMARY', this.margin, currentY, {
         width: this.contentWidth,
         align: 'center'
       });
    
    currentY += 30;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Total Students: ${reportData.totalStudents}`, this.margin, currentY)
       .text(`Total Subjects: ${reportData.totalSubjects}`, this.margin + 200, currentY)
       .text(`Overall Pass Rate: ${reportData.overallPassPercentage.toFixed(1)}%`, this.margin + 400, currentY);
    
    currentY += 40;
    
    // Signature section
    doc.fontSize(10)
       .font('Helvetica')
       .text('Faculty Signature: ___________________________', this.margin, currentY)
       .text('Date: _______________', this.margin + 300, currentY);
    
    currentY += 40;
    
    doc.text('HOD Signature: ___________________________', this.margin, currentY)
       .text('Date: _______________', this.margin + 300, currentY);
  }
}

// Export singleton instance
export const pdfReportService = new PDFReportService();

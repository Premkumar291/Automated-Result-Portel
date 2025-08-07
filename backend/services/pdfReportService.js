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
    this.pageWidth = 612; // A4 width in points (portrait)
    this.pageHeight = 792; // A4 height in points (portrait)
    this.landscapeWidth = 792; // A4 width in landscape
    this.landscapeHeight = 612; // A4 height in landscape
    this.margin = 30;
    this.contentWidth = this.pageWidth - (2 * this.margin); // Will be updated for landscape
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

        // Generate enhanced content matching the provided image
        this.addImageMatchingHeader(doc, reportData);
        this.addImageMatchingFacultySection(doc, reportData);
        this.addImageMatchingResultTable(doc, reportData);

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
   * Header matching the provided image format exactly
   */
  addImageMatchingHeader(doc, reportData) {
    // Add the exact title from the image
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('RESULT ANALYSIS REPORT', this.margin, 50, {
         width: this.contentWidth,
         align: 'center'
       });

    doc.moveDown(1.5);
  }

  /**
   * Faculty section matching the image layout
   */
  addImageMatchingFacultySection(doc, reportData) {
    const startY = doc.y;
    const leftBoxWidth = 150;
    const rightBoxWidth = this.contentWidth - leftBoxWidth - 20;
    
    // Left side boxes (as shown in image)
    doc.rect(this.margin, startY, leftBoxWidth, 120)
       .stroke();
    
    // Add left side labels
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('OFFICIAL STAFF CODE', this.margin + 5, startY + 10, {
         width: leftBoxWidth - 10,
         align: 'left'
       });
    
    doc.rect(this.margin + 5, startY + 25, leftBoxWidth - 10, 20)
       .stroke();
    
    doc.text('NAME OF STUDENT APPLIED', this.margin + 5, startY + 55, {
       width: leftBoxWidth - 10,
       align: 'left'
     });
    
    doc.rect(this.margin + 5, startY + 70, leftBoxWidth - 10, 20)
       .stroke();
    
    doc.text('NON STUDENT APPLIED', this.margin + 5, startY + 100, {
       width: leftBoxWidth - 10,
       align: 'left'
     });
    
    // Right side - Main table area
    const rightStartX = this.margin + leftBoxWidth + 20;
    
    // Add the main result table headers
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text('DEGREE: B.TECH', rightStartX, startY + 10);
    
    doc.y = startY + 140;
  }

  /**
   * Result table exactly matching the image format
   */
  addImageMatchingResultTable(doc, reportData) {
    const { subjectResults, studentsData } = reportData;
    const startY = doc.y;
    
    // Table dimensions matching the image
    const tableWidth = this.contentWidth;
    const headerHeight = 60;
    const dataRowHeight = 25;
    
    // Column structure from the image
    const slNoWidth = 40;
    const regNoWidth = 80;
    const nameWidth = 120;
    const subjectColWidth = (tableWidth - slNoWidth - regNoWidth - nameWidth) / subjectResults.length;
    
    // Main table border
    doc.rect(this.margin, startY, tableWidth, headerHeight + (dataRowHeight * 6))
       .stroke();
    
    // Header section
    this.addImageMatchingTableHeader(doc, startY, subjectResults, slNoWidth, regNoWidth, nameWidth, subjectColWidth, headerHeight);
    
    // Before Remedial Action section
    let currentY = startY + headerHeight;
    this.addRemedialSection(doc, currentY, 'BEFORE REMEDIAL ACTION', subjectResults, slNoWidth, regNoWidth, nameWidth, subjectColWidth, dataRowHeight);
    
    // After Remedial Action section  
    currentY += dataRowHeight * 3;
    this.addRemedialSection(doc, currentY, 'AFTER REMEDIAL ACTION', subjectResults, slNoWidth, regNoWidth, nameWidth, subjectColWidth, dataRowHeight);
    
    doc.y = startY + headerHeight + (dataRowHeight * 6) + 20;
  }

  /**
   * Add table header exactly matching the image
   */
  addImageMatchingTableHeader(doc, startY, subjectResults, slNoWidth, regNoWidth, nameWidth, subjectColWidth, headerHeight) {
    // Header background
    doc.rect(this.margin, startY, this.margin + slNoWidth + regNoWidth + nameWidth + (subjectColWidth * subjectResults.length), headerHeight)
       .fill('#F0F0F0')
       .stroke();
    
    doc.fill('#000000');
    
    // Basic info headers
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text('Sl', this.margin + 5, startY + 25, { width: slNoWidth - 10, align: 'center' })
       .text('REG NO', this.margin + slNoWidth + 5, startY + 25, { width: regNoWidth - 10, align: 'center' })
       .text('NAME OF THE STUDENT', this.margin + slNoWidth + regNoWidth + 5, startY + 25, { width: nameWidth - 10, align: 'center' });
    
    // Subject headers with faculty names
    let currentX = this.margin + slNoWidth + regNoWidth + nameWidth;
    subjectResults.forEach((subject, index) => {
      // Subject code
      doc.fontSize(7)
         .font('Helvetica-Bold')
         .text(subject.subjectCode || `CS20${index + 3}`, currentX + 2, startY + 5, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      // Faculty name (empty for now as requested)
      doc.fontSize(6)
         .text(reportData.facultyPerSubject?.[subject.subjectCode] || '', currentX + 2, startY + 15, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      // Subject name (empty area as requested)
      doc.fontSize(6)
         .text('', currentX + 2, startY + 25, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      // Course code
      doc.fontSize(6)
         .text(`${subject.subjectCode || 'COURSE'}`, currentX + 2, startY + 40, {
           width: subjectColWidth - 4,
           align: 'center'
         });
      
      currentX += subjectColWidth;
    });
    
    // Draw separators
    this.drawImageMatchingSeparators(doc, startY, startY + headerHeight, slNoWidth, regNoWidth, nameWidth, subjectColWidth, subjectResults.length);
  }

  /**
   * Add remedial action section (before/after)
   */
  addRemedialSection(doc, startY, sectionTitle, subjectResults, slNoWidth, regNoWidth, nameWidth, subjectColWidth, rowHeight) {
    // Section title
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text(sectionTitle, this.margin + 5, startY + 5);
    
    // Data rows
    const rowLabels = ['TOTAL STUDENT', 'PASS', 'PERCENTAGE OF PASS'];
    
    rowLabels.forEach((label, rowIndex) => {
      const currentY = startY + (rowIndex * rowHeight);
      
      // Row background
      if (rowIndex % 2 === 1) {
        doc.rect(this.margin, currentY, this.margin + slNoWidth + regNoWidth + nameWidth + (subjectColWidth * subjectResults.length), rowHeight)
           .fill('#F9FAFB')
           .stroke();
        doc.fill('#000000');
      }
      
      // Row label
      doc.fontSize(7)
         .font('Helvetica')
         .text(label, this.margin + slNoWidth + 5, currentY + 8, {
           width: regNoWidth + nameWidth - 10,
           align: 'left'
         });
      
      // Subject data
      let currentX = this.margin + slNoWidth + regNoWidth + nameWidth;
      subjectResults.forEach((subject) => {
        let value = '';
        
        if (rowIndex === 0) { // Total students
          value = subject.totalStudents.toString();
        } else if (rowIndex === 1) { // Pass count
          value = subject.passedStudents.toString();
        } else if (rowIndex === 2) { // Pass percentage
          value = subject.passPercentage.toFixed(1) + '%';
        }
        
        doc.fontSize(8)
           .font('Helvetica')
           .text(value, currentX + 2, currentY + 8, {
             width: subjectColWidth - 4,
             align: 'center'
           });
        
        currentX += subjectColWidth;
      });
      
      // Draw separators for this row
      this.drawImageMatchingSeparators(doc, currentY, currentY + rowHeight, slNoWidth, regNoWidth, nameWidth, subjectColWidth, subjectResults.length);
    });
  }

  /**
   * Draw table separators matching the image
   */
  drawImageMatchingSeparators(doc, startY, endY, slNoWidth, regNoWidth, nameWidth, subjectColWidth, numSubjects) {
    // Vertical separators
    let x = this.margin + slNoWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    x += regNoWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    x += nameWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    
    // Subject column separators
    for (let i = 0; i < numSubjects; i++) {
      x += subjectColWidth;
      doc.moveTo(x, startY).lineTo(x, endY).stroke();
    }
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

  /**
   * Generate institutional report matching the exact format from the provided image
   */
  async generateInstitutionalReport(reportData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Use landscape orientation for institutional reports
        const doc = new PDFKit({
          size: 'A4',
          layout: 'landscape',
          margin: this.margin,
          bufferPages: true
        });
        
        // Update content width for landscape mode
        this.contentWidth = this.landscapeWidth - (2 * this.margin);

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Generate the institutional format report
        this.addInstitutionalHeader(doc, reportData);
        this.addDegreeAndBranchSection(doc, reportData);
        this.addInstitutionalMainTable(doc, reportData);
        this.addSummaryAndSignatures(doc, reportData);

        doc.end();

        stream.on('finish', () => {
          // Restore portrait content width for other reports
          this.contentWidth = this.pageWidth - (2 * this.margin);
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
   * Add institutional header matching the image
   */
  addInstitutionalHeader(doc, reportData) {
    // Main title
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY - ERODE - 638 316', this.margin, 30, {
         width: this.contentWidth,
         align: 'center'
       });

    // Subtitle
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('RESULT ANALYSIS NOV/DEC 2024', this.margin, 50, {
         width: this.contentWidth,
         align: 'center'
       });

    doc.moveDown(1);
  }

  /**
   * Add degree and branch section
   */
  addDegreeAndBranchSection(doc, reportData) {
    const startY = doc.y;
    
    // Degree section
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('DEGREE: B.TECH', this.margin, startY);
    
    // Branch section - use actual department data
    doc.text(`BRANCH: ${reportData.department || 'IT'}`, this.margin + 200, startY);
    
    // Semester section - use actual semester data
    doc.text(`SEM: ${reportData.semester || 'I'}`, this.margin + 400, startY);

    doc.moveDown(1.5);
  }

  /**
   * Add the main institutional table matching the exact format
   */
  addInstitutionalMainTable(doc, reportData) {
    const { subjectResults } = reportData;
    const startY = doc.y;
    const tableWidth = this.contentWidth;
    const rowHeight = 25;
    const headerRowHeight = 50;

    // Column widths
    const slNoWidth = 30;
    const courseCodeWidth = 60;
    const subjectNameWidth = 100;
    const staffNameWidth = 100;
    const deptWidth = 80;
    const appearedWidth = 60;
    const passedBeforeWidth = 60;
    const passedAfterWidth = 60;
    const passPercentBeforeWidth = 70;
    const passPercentAfterWidth = 70;

    // Table border
    doc.rect(this.margin, startY, tableWidth, headerRowHeight + (rowHeight * 8))
       .stroke();

    // Header section
    this.addInstitutionalTableHeader(doc, startY, headerRowHeight, {
      slNoWidth, courseCodeWidth, subjectNameWidth, staffNameWidth, 
      deptWidth, appearedWidth, passedBeforeWidth, passedAfterWidth, 
      passPercentBeforeWidth, passPercentAfterWidth
    });

    // Data rows with actual subject data
    let currentY = startY + headerRowHeight;
    const maxRows = Math.max(subjectResults.length, 8); // Ensure at least 8 rows
    
    for (let i = 0; i < maxRows; i++) {
      // Row background alternating
      if (i % 2 === 1) {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .fill('#F9FAFB')
           .stroke();
        doc.fill('#000000');
      } else {
        doc.rect(this.margin, currentY, tableWidth, rowHeight)
           .stroke();
      }

      // Row number
      doc.fontSize(8)
         .font('Helvetica')
         .text((i + 1).toString(), this.margin + 2, currentY + 8, {
           width: slNoWidth - 4,
           align: 'center'
         });

      // Fill with actual data if available
      if (i < subjectResults.length) {
        const subject = subjectResults[i];
        const facultyName = reportData.facultyAssignments?.[subject.subjectCode] || '';
        
        let currentX = this.margin + slNoWidth;
        
        // Course Code
        doc.text(subject.subjectCode || '', currentX + 2, currentY + 8, {
          width: courseCodeWidth - 4,
          align: 'center'
        });
        currentX += courseCodeWidth;
        
        // Subject Name
        doc.text(subject.subjectName || subject.subjectCode || '', currentX + 2, currentY + 8, {
          width: subjectNameWidth - 4,
          align: 'center'
        });
        currentX += subjectNameWidth;
        
        // Staff Name
        doc.text(facultyName, currentX + 2, currentY + 8, {
          width: staffNameWidth - 4,
          align: 'center'
        });
        currentX += staffNameWidth;
        
        // Department
        doc.text(reportData.department || '', currentX + 2, currentY + 8, {
          width: deptWidth - 4,
          align: 'center'
        });
        currentX += deptWidth;
        
        // Appeared
        doc.text(subject.totalStudents?.toString() || '', currentX + 2, currentY + 8, {
          width: appearedWidth - 4,
          align: 'center'
        });
        currentX += appearedWidth;
        
        // Passed Before Revaluation
        doc.text(subject.passedStudents?.toString() || '', currentX + 2, currentY + 8, {
          width: passedBeforeWidth - 4,
          align: 'center'
        });
        currentX += passedBeforeWidth;
        
        // Passed After Revaluation (same as before for now)
        doc.text(subject.passedStudents?.toString() || '', currentX + 2, currentY + 8, {
          width: passedAfterWidth - 4,
          align: 'center'
        });
        currentX += passedAfterWidth;
        
        // Percentage Before Revaluation
        doc.text(subject.passPercentage ? subject.passPercentage.toFixed(1) + '%' : '', currentX + 2, currentY + 8, {
          width: passPercentBeforeWidth - 4,
          align: 'center'
        });
        currentX += passPercentBeforeWidth;
        
        // Percentage After Revaluation (same as before for now)
        doc.text(subject.passPercentage ? subject.passPercentage.toFixed(1) + '%' : '', currentX + 2, currentY + 8, {
          width: passPercentAfterWidth - 4,
          align: 'center'
        });
      }

      // Draw column separators
      this.drawInstitutionalColumnSeparators(doc, currentY, currentY + rowHeight, {
        slNoWidth, courseCodeWidth, subjectNameWidth, staffNameWidth,
        deptWidth, appearedWidth, passedBeforeWidth, passedAfterWidth,
        passPercentBeforeWidth, passPercentAfterWidth
      });

      currentY += rowHeight;
    }

    doc.y = currentY + 20;
  }

  /**
   * Add institutional table header
   */
  addInstitutionalTableHeader(doc, startY, headerHeight, columnWidths) {
    const {
      slNoWidth, courseCodeWidth, subjectNameWidth, staffNameWidth,
      deptWidth, appearedWidth, passedBeforeWidth, passedAfterWidth,
      passPercentBeforeWidth, passPercentAfterWidth
    } = columnWidths;

    // Header background
    doc.rect(this.margin, startY, this.contentWidth, headerHeight)
       .fill('#E5E7EB')
       .stroke();
    
    doc.fill('#000000');

    // Header text
    doc.fontSize(8)
       .font('Helvetica-Bold');

    let currentX = this.margin;

    // S.No
    doc.text('S.NO', currentX + 2, startY + 20, {
      width: slNoWidth - 4,
      align: 'center'
    });
    currentX += slNoWidth;

    // Course Code
    doc.text('COURSE\nCODE', currentX + 2, startY + 15, {
      width: courseCodeWidth - 4,
      align: 'center'
    });
    currentX += courseCodeWidth;

    // Subject Name
    doc.text('NAME OF THE\nSUBJECT', currentX + 2, startY + 15, {
      width: subjectNameWidth - 4,
      align: 'center'
    });
    currentX += subjectNameWidth;

    // Staff Name
    doc.text('NAME OF THE STAFF\nHANDLED THE SUBJECT', currentX + 2, startY + 10, {
      width: staffNameWidth - 4,
      align: 'center'
    });
    currentX += staffNameWidth;

    // Department
    doc.text('DEPT M/\nTR OF\nSTAFF', currentX + 2, startY + 10, {
      width: deptWidth - 4,
      align: 'center'
    });
    currentX += deptWidth;

    // Appeared
    doc.text('APPEARED', currentX + 2, startY + 20, {
      width: appearedWidth - 4,
      align: 'center'
    });
    currentX += appearedWidth;

    // Passed Before
    doc.text('PASSED\nBEFORE\nREVALU-\nATION', currentX + 2, startY + 5, {
      width: passedBeforeWidth - 4,
      align: 'center'
    });
    currentX += passedBeforeWidth;

    // Passed After
    doc.text('PASSED\nAFTER\nREVALU-\nATION', currentX + 2, startY + 5, {
      width: passedAfterWidth - 4,
      align: 'center'
    });
    currentX += passedAfterWidth;

    // Percentage Before
    doc.text('PERCENTAGE\nOF PASS\nBEFORE\nREVALUATIO\nN', currentX + 2, startY + 5, {
      width: passPercentBeforeWidth - 4,
      align: 'center'
    });
    currentX += passPercentBeforeWidth;

    // Percentage After
    doc.text('PERCENTAGE\nOF PASS\nAFTER\nREVALUATION', currentX + 2, startY + 10, {
      width: passPercentAfterWidth - 4,
      align: 'center'
    });

    // Draw header column separators
    this.drawInstitutionalColumnSeparators(doc, startY, startY + headerHeight, columnWidths);
  }

  /**
   * Draw column separators for institutional table
   */
  drawInstitutionalColumnSeparators(doc, startY, endY, columnWidths) {
    const {
      slNoWidth, courseCodeWidth, subjectNameWidth, staffNameWidth,
      deptWidth, appearedWidth, passedBeforeWidth, passedAfterWidth,
      passPercentBeforeWidth, passPercentAfterWidth
    } = columnWidths;

    let x = this.margin + slNoWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += courseCodeWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += subjectNameWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += staffNameWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += deptWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += appearedWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += passedBeforeWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += passedAfterWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();

    x += passPercentBeforeWidth;
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
  }

  /**
   * Add summary statistics and signature sections
   */
  addSummaryAndSignatures(doc, reportData) {
    const startY = doc.y;
    const summaryHeight = 60;

    // Summary section box
    doc.rect(this.margin, startY, this.contentWidth / 3, summaryHeight)
       .stroke();

    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('NO.OF STUDENTS APPEARED', this.margin + 5, startY + 5, {
         width: (this.contentWidth / 3) - 10,
         align: 'left'
       });

    // Box with actual data
    doc.rect(this.margin + 5, startY + 20, (this.contentWidth / 3) - 15, 15)
       .stroke();
    
    // Fill with actual total students
    if (reportData.totalStudents > 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(reportData.totalStudents.toString(), this.margin + 10, startY + 26, {
           width: (this.contentWidth / 3) - 25,
           align: 'center'
         });
    }

    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('NO.OF STUDENTS PASSED', this.margin + 5, startY + 40, {
         width: (this.contentWidth / 3) - 10,
         align: 'left'
       });

    // Box with actual data
    doc.rect(this.margin + 5, startY + 50, (this.contentWidth / 3) - 15, 8)
       .stroke();
    
    // Fill with calculated passed students count
    if (reportData.totalStudents > 0) {
      const overallPassed = Math.round((reportData.totalStudents * reportData.overallPassPercentage) / 100);
      doc.fontSize(8)
         .font('Helvetica')
         .text(overallPassed.toString(), this.margin + 10, startY + 52, {
           width: (this.contentWidth / 3) - 25,
           align: 'center'
         });
    }

    // Overall pass percentage label - positioned lower
    const overallPassY = startY + summaryHeight + 10;
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('OVERALL PASS PERCENTAGE', this.margin, overallPassY);

    doc.rect(this.margin + 5, overallPassY + 15, (this.contentWidth / 3) - 15, 15)
       .stroke();
    
    // Fill with actual pass percentage
    if (reportData.overallPassPercentage >= 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${reportData.overallPassPercentage.toFixed(1)}%`, this.margin + 10, overallPassY + 21, {
           width: (this.contentWidth / 3) - 25,
           align: 'center'
         });
    }

    // Signature sections
    const signaturesY = overallPassY + 50;
    const signatureWidth = this.contentWidth / 3;

    // Class Advisor
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('CLASS ADVISOR', this.margin, signaturesY, {
         width: signatureWidth,
         align: 'center'
       });

    // Head of Department
    doc.text('HEAD OF THE DEPARTMENT', this.margin + signatureWidth, signaturesY, {
      width: signatureWidth,
      align: 'center'
    });

    // Principal
    doc.text('PRINCIPAL', this.margin + (2 * signatureWidth), signaturesY, {
      width: signatureWidth,
      align: 'center'
    });

    // Signature lines
    const signatureLineY = signaturesY + 60;
    doc.fontSize(8)
       .font('Helvetica')
       .text('_________________', this.margin + 20, signatureLineY, {
         width: signatureWidth - 40,
         align: 'center'
       })
       .text('_________________', this.margin + signatureWidth + 20, signatureLineY, {
         width: signatureWidth - 40,
         align: 'center'
       })
       .text('_________________', this.margin + (2 * signatureWidth) + 20, signatureLineY, {
         width: signatureWidth - 40,
         align: 'center'
       });
  }
}

// Export singleton instance
export const pdfReportService = new PDFReportService();

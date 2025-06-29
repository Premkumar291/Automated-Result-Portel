// Grade Analysis Engine for PDF Result Processing

export class GradeAnalyzer {
  constructor() {
    // Define pass and fail grades according to Anna University standards
    this.passGrades = ['O', 'A+', 'A', 'B+', 'B', 'C'];
    this.failGrades = ['RA', 'AB', 'F', 'U', 'W'];
    
    // Subject code patterns (e.g., CS2301, MA2211, etc.)
    this.subjectCodePattern = /^[A-Z]{2,3}\d{4}[A-Z]?$/;
    
    // Register number patterns (12 digits for Anna University)
    this.registerNumberPattern = /^\d{12}$/;
    
    // Grade patterns
    this.gradePattern = /^(O|A\+|A|B\+|B|C|RA|AB|F|U|W)$/;
  }

  /**
   * Analyze grades from extracted PDF data
   * @param {Object} pdfData - Extracted PDF data with tables and pages
   * @returns {Object} Analysis results with subject-wise statistics
   */
  analyzeGrades(pdfData) {
    try {
      console.log('Starting grade analysis...');
      
      // Extract student records from tables
      const studentRecords = this.extractStudentRecords(pdfData);
      console.log(`Extracted ${studentRecords.length} student records`);
      
      // Group records by subject code
      const subjectGroups = this.groupBySubject(studentRecords);
      console.log(`Found ${Object.keys(subjectGroups).length} unique subjects`);
      
      // Calculate statistics for each subject
      const subjectAnalysis = this.calculateSubjectStatistics(subjectGroups);
      
      // Calculate overall statistics
      const overallStats = this.calculateOverallStatistics(subjectAnalysis);
      
      return {
        success: true,
        subjects: subjectAnalysis,
        overallStats: overallStats,
        totalRecords: studentRecords.length,
        analysisDate: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Grade analysis error:', error);
      return {
        success: false,
        error: error.message,
        subjects: [],
        overallStats: {}
      };
    }
  }

  /**
   * Extract student records from PDF tables
   * @param {Object} pdfData - PDF data with tables
   * @returns {Array} Array of student records
   */
  extractStudentRecords(pdfData) {
    const records = [];
    
    if (!pdfData.tables || pdfData.tables.length === 0) {
      console.log('No tables found in PDF data');
      return records;
    }
    
    pdfData.tables.forEach((table, tableIndex) => {
      if (!table.rows || table.rows.length === 0) return;
      
      console.log(`Processing table ${tableIndex + 1} with ${table.rows.length} rows`);
      
      // Skip header row (first row)
      const dataRows = table.rows.slice(1);
      
      dataRows.forEach((row, rowIndex) => {
        const record = this.parseStudentRecord(row, tableIndex, rowIndex);
        if (record) {
          records.push(record);
        }
      });
    });
    
    return records;
  }

  /**
   * Parse individual student record from table row
   * @param {Array} row - Table row data
   * @param {number} tableIndex - Table index
   * @param {number} rowIndex - Row index
   * @returns {Object|null} Parsed student record or null
   */
  parseStudentRecord(row, tableIndex, rowIndex) {
    if (!row || row.length === 0) return null;
    
    let registerNumber = null;
    let studentName = null;
    let subjectCode = null;
    let grade = null;
    
    // Analyze each cell in the row
    row.forEach((cell, cellIndex) => {
      if (!cell) return;
      
      const cellText = String(cell).trim().toUpperCase();
      
      // Identify register number (12 digits)
      if (this.registerNumberPattern.test(cellText)) {
        registerNumber = cellText;
      }
      
      // Identify subject code (e.g., CS2301, MA2211)
      if (this.subjectCodePattern.test(cellText)) {
        subjectCode = cellText;
      }
      
      // Identify grade
      if (this.gradePattern.test(cellText)) {
        grade = cellText;
      }
      
      // Identify student name (alphabetic with spaces, length > 3)
      if (/^[A-Z][A-Z\s]{2,}$/.test(cellText) && cellText.length > 3 && !this.subjectCodePattern.test(cellText)) {
        studentName = cellText;
      }
    });
    
    // Return record if we have essential data
    if ((registerNumber || studentName) && subjectCode && grade) {
      return {
        registerNumber: registerNumber || `UNKNOWN_${tableIndex}_${rowIndex}`,
        studentName: studentName || 'Unknown Student',
        subjectCode: subjectCode,
        grade: grade,
        status: this.determinePassFail(grade),
        tableIndex: tableIndex,
        rowIndex: rowIndex
      };
    }
    
    return null;
  }

  /**
   * Determine if grade is pass or fail
   * @param {string} grade - Student grade
   * @returns {string} 'PASS' or 'FAIL'
   */
  determinePassFail(grade) {
    if (this.passGrades.includes(grade)) {
      return 'PASS';
    } else if (this.failGrades.includes(grade)) {
      return 'FAIL';
    } else {
      // Unknown grade, treat as fail for safety
      return 'FAIL';
    }
  }

  /**
   * Group student records by subject code
   * @param {Array} records - Array of student records
   * @returns {Object} Records grouped by subject code
   */
  groupBySubject(records) {
    const groups = {};
    
    records.forEach(record => {
      const subjectCode = record.subjectCode;
      
      if (!groups[subjectCode]) {
        groups[subjectCode] = [];
      }
      
      groups[subjectCode].push(record);
    });
    
    return groups;
  }

  /**
   * Calculate statistics for each subject
   * @param {Object} subjectGroups - Records grouped by subject
   * @returns {Array} Array of subject analysis objects
   */
  calculateSubjectStatistics(subjectGroups) {
    const analysis = [];
    
    Object.keys(subjectGroups).forEach(subjectCode => {
      const records = subjectGroups[subjectCode];
      
      // Calculate basic statistics
      const totalStudents = records.length;
      const passedStudents = records.filter(r => r.status === 'PASS').length;
      const failedStudents = records.filter(r => r.status === 'FAIL').length;
      const passPercentage = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0;
      
      // Calculate grade distribution
      const gradeDistribution = {};
      records.forEach(record => {
        const grade = record.grade;
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
      });
      
      // Sort grades for consistent display
      const sortedGrades = {};
      [...this.passGrades, ...this.failGrades].forEach(grade => {
        if (gradeDistribution[grade]) {
          sortedGrades[grade] = gradeDistribution[grade];
        }
      });
      
      analysis.push({
        subjectCode: subjectCode,
        totalStudents: totalStudents,
        passedStudents: passedStudents,
        failedStudents: failedStudents,
        passPercentage: parseFloat(passPercentage),
        gradeDistribution: sortedGrades,
        students: records
      });
    });
    
    // Sort by subject code for consistent display
    return analysis.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
  }

  /**
   * Calculate overall statistics across all subjects
   * @param {Array} subjectAnalysis - Array of subject analysis objects
   * @returns {Object} Overall statistics
   */
  calculateOverallStatistics(subjectAnalysis) {
    if (subjectAnalysis.length === 0) {
      return {
        totalSubjects: 0,
        totalStudents: 0,
        averagePassRate: 0,
        totalPassed: 0,
        totalFailed: 0,
        overallPassRate: 0
      };
    }
    
    const totalSubjects = subjectAnalysis.length;
    const totalStudents = Math.max(...subjectAnalysis.map(s => s.totalStudents));
    const totalPassed = subjectAnalysis.reduce((sum, s) => sum + s.passedStudents, 0);
    const totalFailed = subjectAnalysis.reduce((sum, s) => sum + s.failedStudents, 0);
    const totalAttempts = totalPassed + totalFailed;
    
    const averagePassRate = subjectAnalysis.reduce((sum, s) => sum + s.passPercentage, 0) / totalSubjects;
    const overallPassRate = totalAttempts > 0 ? (totalPassed / totalAttempts) * 100 : 0;
    
    return {
      totalSubjects: totalSubjects,
      totalStudents: totalStudents,
      averagePassRate: parseFloat(averagePassRate.toFixed(2)),
      totalPassed: totalPassed,
      totalFailed: totalFailed,
      totalAttempts: totalAttempts,
      overallPassRate: parseFloat(overallPassRate.toFixed(2))
    };
  }
}

export default GradeAnalyzer;

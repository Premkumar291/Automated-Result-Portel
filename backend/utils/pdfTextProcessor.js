/**
 * Advanced PDF Text Processing Utilities
 * Handles complex patterns and edge cases in academic PDF parsing
 */

export class PdfTextProcessor {
  
  /**
   * Clean and normalize extracted PDF text
   * @param {string} rawText - Raw text from PDF
   * @returns {string} Cleaned and normalized text
   */
  static cleanText(rawText) {
    return rawText
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Convert remaining carriage returns
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .replace(/([A-Z]{2,3}\d{4})\s*([A-Z+\-]+)/g, '$1 $2') // Normalize subject-grade spacing
      .trim();
  }

  /**
   * Extract semester information using multiple patterns
   * @param {string} text - Text to search
   * @returns {Array} Array of semester numbers found
   */
  static extractSemesters(text) {
    const patterns = [
      /Semester\s+(?:No\.?\s*:?\s*)?(\d+)/gi,
      /Sem\s*:?\s*(\d+)/gi,
      /(?:III|IV|V|VI|VII|VIII|I|II)\s+Semester/gi,
      /(\d+)(?:st|nd|rd|th)\s+Semester/gi
    ];

    const semesters = new Set();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const semNum = this.romanToNumber(match[1]) || parseInt(match[1]);
        if (semNum >= 1 && semNum <= 8) {
          semesters.add(semNum);
        }
      }
    });

    return Array.from(semesters).sort();
  }

  /**
   * Convert Roman numerals to numbers
   * @param {string} roman - Roman numeral
   * @returns {number|null} Converted number or null
   */
  static romanToNumber(roman) {
    const romanMap = {
      'I': 1, 'II': 2, 'III': 3, 'IV': 4,
      'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8
    };
    return romanMap[roman?.toUpperCase()] || null;
  }

  /**
   * Identify section types (arrear/current) using multiple indicators
   * @param {string} text - Text to analyze
   * @returns {Object} Object with section boundaries
   */
  static identifySections(text) {
    const lines = text.split('\n');
    const sections = {
      arrear: { start: -1, end: -1 },
      current: { start: -1, end: -1 }
    };

    const arrearKeywords = [
      'arrear', 'backlog', 'previous semester', 'pending',
      'supplementary', 'reappear', 'carry forward'
    ];

    const currentKeywords = [
      'current semester', 'regular', 'present semester',
      'ongoing', 'this semester'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Check for arrear section
      if (arrearKeywords.some(keyword => line.includes(keyword))) {
        if (sections.arrear.start === -1) {
          sections.arrear.start = i;
        }
      }

      // Check for current section
      if (currentKeywords.some(keyword => line.includes(keyword))) {
        if (sections.arrear.start !== -1 && sections.arrear.end === -1) {
          sections.arrear.end = i - 1;
        }
        if (sections.current.start === -1) {
          sections.current.start = i;
        }
      }
    }

    // Set end boundaries if not found
    if (sections.arrear.start !== -1 && sections.arrear.end === -1) {
      sections.arrear.end = sections.current.start - 1;
    }
    if (sections.current.start !== -1 && sections.current.end === -1) {
      sections.current.end = lines.length - 1;
    }

    return sections;
  }

  /**
   * Enhanced registration number extraction with multiple patterns
   * @param {string} text - Text to search
   * @returns {Array} Array of found registration numbers
   */
  static extractRegistrationNumbers(text) {
    const patterns = [
      /\b\d{12}\b/g,           // Standard 12-digit format
      /\b\d{2}[A-Z]{2}\d{8}\b/g, // 2 digits + 2 letters + 8 digits
      /\b\d{4}[A-Z]{2}\d{6}\b/g, // 4 digits + 2 letters + 6 digits
      /\b[A-Z]{2}\d{10}\b/g     // 2 letters + 10 digits
    ];

    const regNumbers = new Set();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        regNumbers.add(match[0]);
      }
    });

    return Array.from(regNumbers);
  }

  /**
   * Extract student names with improved accuracy
   * @param {string} text - Text containing student info
   * @param {string} regNo - Registration number
   * @returns {string|null} Extracted student name
   */
  static extractStudentName(text, regNo) {
    const patterns = [
      new RegExp(`${regNo}\\s+([A-Z][A-Z\\s]+?)(?=\\s+[A-Z]{2}\\d+|\\s+\\d+|$)`, 'i'),
      new RegExp(`${regNo}\\s*[\\s\\n]+([A-Z][A-Z\\s]+?)(?=\\s+[A-Z]{2}\\d+|\\s+\\d+|$)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, ''); // Remove special characters
        
        // Validate name (should be at least 2 characters and contain letters)
        if (name.length >= 2 && /[A-Za-z]/.test(name)) {
          return name.toUpperCase();
        }
      }
    }

    return null;
  }

  /**
   * Enhanced subject and grade extraction
   * @param {string} text - Text to search
   * @returns {Array} Array of subject-grade pairs
   */
  static extractSubjectsAndGrades(text) {
    const subjects = [];
    
    // Multiple patterns for different PDF formats
    const patterns = [
      /([A-Z]{2,4}\d{4})\s+([OABCPFURA+\-]+)/g,
      /([A-Z]{2,4}\d{4})\s*:\s*([OABCPFURA+\-]+)/g,
      /([A-Z]{2,4}\d{4})\s*-\s*([OABCPFURA+\-]+)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const code = match[1].trim();
        const grade = match[2].trim();
        
        if (this.isValidSubjectCode(code) && this.isValidGrade(grade)) {
          subjects.push({
            code: code.toUpperCase(),
            grade: grade.toUpperCase()
          });
        }
      }
    });

    // Remove duplicates based on subject code
    const uniqueSubjects = subjects.filter((subject, index, self) =>
      index === self.findIndex(s => s.code === subject.code)
    );

    return uniqueSubjects;
  }

  /**
   * Validate subject code format
   * @param {string} code - Subject code to validate
   * @returns {boolean} True if valid
   */
  static isValidSubjectCode(code) {
    const patterns = [
      /^[A-Z]{2,4}\d{4}$/, // Standard format (CS3351, MA3354)
      /^[A-Z]{2,4}\d{3}[A-Z]$/ // Alternative format (CS351A)
    ];

    return patterns.some(pattern => pattern.test(code));
  }

  /**
   * Enhanced grade validation
   * @param {string} grade - Grade to validate
   * @returns {boolean} True if valid
   */
  static isValidGrade(grade) {
    const validGrades = [
      'O', 'A+', 'A', 'B+', 'B', 'C', 'P', // Passing grades
      'RA', 'AB', 'F', 'U', 'I', 'W'       // Failing/other grades
    ];

    return validGrades.includes(grade.toUpperCase());
  }

  /**
   * Calculate CGPA/GPA based on grades (if needed)
   * @param {Array} subjects - Array of subject objects
   * @returns {Object} GPA calculation result
   */
  static calculateGPA(subjects) {
    const gradePoints = {
      'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4,
      'RA': 0, 'AB': 0, 'F': 0, 'U': 0, 'I': 0, 'W': 0
    };

    let totalPoints = 0;
    let totalSubjects = 0;
    let passedSubjects = 0;

    subjects.forEach(subject => {
      const points = gradePoints[subject.grade.toUpperCase()];
      if (points !== undefined) {
        totalPoints += points;
        totalSubjects++;
        if (points > 0) passedSubjects++;
      }
    });

    return {
      gpa: totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : 0,
      totalSubjects,
      passedSubjects,
      failedSubjects: totalSubjects - passedSubjects,
      passPercentage: totalSubjects > 0 ? ((passedSubjects / totalSubjects) * 100).toFixed(2) : 0
    };
  }

  /**
   * Extract academic year/batch information
   * @param {string} text - Text to search
   * @returns {string|null} Academic year or batch
   */
  static extractAcademicYear(text) {
    const patterns = [
      /(?:Academic Year|A\.Y\.?)\s*:?\s*(\d{4}-\d{4}|\d{4}-\d{2})/i,
      /(?:Batch|Year)\s*:?\s*(\d{4}-\d{4}|\d{4})/i,
      /(\d{4}-\d{4})\s*Batch/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract course/program information
   * @param {string} text - Text to search
   * @returns {string|null} Course name
   */
  static extractCourse(text) {
    const patterns = [
      /(?:Course|Program|Degree)\s*:?\s*([A-Z\s]+?)(?=\n|Semester|Regulation)/i,
      /(B\.Tech|M\.Tech|B\.E|M\.E|BCA|MCA|MBA)\s*\(?([A-Z\s&]+?)\)?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return null;
  }

  /**
   * Extract regulation information
   * @param {string} text - Text to search
   * @returns {string|null} Regulation code
   */
  static extractRegulation(text) {
    const patterns = [
      /(?:Regulation|Reg\.?)\s*:?\s*([A-Z]?\d{4})/i,
      /(?:R|REG)-?(\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}

export default PdfTextProcessor;

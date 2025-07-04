import pdf from 'pdf-parse';
import groqService from './groqService.js';

class PDFProcessor {
  async processAndAnalyzePDF(pdfBuffer) {
    try {
      console.log('Starting PDF processing...');
      
      // Extract text from PDF
      const pdfData = await pdf(pdfBuffer);
      const extractedText = pdfData.text;
      
      console.log(`PDF text extracted: ${extractedText.length} characters`);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }
      
      // Enhanced text preprocessing for better semester extraction
      const preprocessedText = this.preprocessPDFText(extractedText);
      
      // Analyze with Groq AI
      const analysisResult = await groqService.analyzePDFText(preprocessedText);
      
      console.log('Analysis result:', JSON.stringify(analysisResult, null, 2));
      
      // Post-process to ensure all 8 semesters are handled
      const enhancedResult = this.enhanceAnalysisResult(analysisResult, preprocessedText);
      
      return {
        ...enhancedResult,
        metadata: {
          originalTextLength: extractedText.length,
          preprocessedTextLength: preprocessedText.length,
          pdfPages: pdfData.numpages,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  preprocessPDFText(text) {
    console.log('Preprocessing PDF text for better semester extraction...');
    
    // Clean up common PDF extraction issues
    let cleanedText = text
      // Fix line breaks and spacing
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      
      // Fix common semester markers
      .replace(/SEMESTER\s*-\s*(\d+)/gi, 'SEMESTER $1')
      .replace(/SEM\s*-\s*(\d+)/gi, 'SEMESTER $1')
      .replace(/(\d+)\s*SEMESTER/gi, 'SEMESTER $1')
      .replace(/SEMESTER\s*(\d+)\s*RESULT/gi, 'SEMESTER $1 RESULT')
      
      // Fix subject code patterns
      .replace(/([A-Z]{2,4})\s*(\d{4})/g, '$1$2')
      .replace(/(\d{2})\s*([A-Z]{2,4})\s*(\d{3,4})/g, '$1$2$3')
      
      // Fix grade patterns
      .replace(/GRADE\s*:\s*([A-Z+]+)/gi, 'GRADE: $1')
      .replace(/([A-Z])\s*\+/g, '$1+')
      
      // Fix student info patterns
      .replace(/REGISTER\s*NO\s*:\s*/gi, 'REGISTER NO: ')
      .replace(/STUDENT\s*NAME\s*:\s*/gi, 'STUDENT NAME: ')
      .replace(/NAME\s*:\s*/gi, 'NAME: ')
      
      // Fix table continuation markers
      .replace(/\.\.\.\s*contd?\s*\.\.\./gi, '...CONTINUED...')
      .replace(/continued\s*on\s*next\s*page/gi, 'CONTINUED ON NEXT PAGE')
      
      // Enhanced semester detection patterns
      .replace(/FIRST\s*SEMESTER/gi, 'SEMESTER 1')
      .replace(/SECOND\s*SEMESTER/gi, 'SEMESTER 2')
      .replace(/THIRD\s*SEMESTER/gi, 'SEMESTER 3')
      .replace(/FOURTH\s*SEMESTER/gi, 'SEMESTER 4')
      .replace(/FIFTH\s*SEMESTER/gi, 'SEMESTER 5')
      .replace(/SIXTH\s*SEMESTER/gi, 'SEMESTER 6')
      .replace(/SEVENTH\s*SEMESTER/gi, 'SEMESTER 7')
      .replace(/EIGHTH\s*SEMESTER/gi, 'SEMESTER 8')
      
      // Roman numeral conversion
      .replace(/SEMESTER\s*I\b/gi, 'SEMESTER 1')
      .replace(/SEMESTER\s*II\b/gi, 'SEMESTER 2')
      .replace(/SEMESTER\s*III\b/gi, 'SEMESTER 3')
      .replace(/SEMESTER\s*IV\b/gi, 'SEMESTER 4')
      .replace(/SEMESTER\s*V\b/gi, 'SEMESTER 5')
      .replace(/SEMESTER\s*VI\b/gi, 'SEMESTER 6')
      .replace(/SEMESTER\s*VII\b/gi, 'SEMESTER 7')
      .replace(/SEMESTER\s*VIII\b/gi, 'SEMESTER 8')
      
      // Fix common spacing issues
      .replace(/\s+/g, ' ')
      .trim();
    
    // Add clear semester separators for better section splitting
    cleanedText = this.addSemesterSeparators(cleanedText);
    
    console.log(`Text preprocessing complete. Length: ${cleanedText.length}`);
    return cleanedText;
  }

  addSemesterSeparators(text) {
    // Add clear separators before semester markers to help with section splitting
    const semesterPatterns = [
      /SEMESTER\s*[1-8]\s*RESULT/gi,
      /SEMESTER\s*[1-8]\b/gi,
      /SEM\s*[1-8]\b/gi,
      /Anna\s*University\s*::\s*Chennai/gi
    ];
    
    let processedText = text;
    
    semesterPatterns.forEach(pattern => {
      processedText = processedText.replace(pattern, (match) => {
        return `\n\n===SEMESTER_SEPARATOR===\n${match}`;
      });
    });
    
    return processedText;
  }

  enhanceAnalysisResult(analysisResult, originalText) {
    console.log('Enhancing analysis result for better semester coverage...');
    
    // Ensure we have all 8 semesters if they exist in the text
    const detectedSemesters = this.detectAllSemesters(originalText);
    console.log(`Detected semesters in text: ${detectedSemesters.join(', ')}`);
    
    // If analysis result has fewer semesters than detected, try to extract missing ones
    const currentSemesters = new Set(analysisResult.semesters || []);
    const missingSemesters = detectedSemesters.filter(sem => !currentSemesters.has(sem));
    
    if (missingSemesters.length > 0) {
      console.log(`Missing semesters found: ${missingSemesters.join(', ')}`);
      
      // Try to extract data for missing semesters
      const additionalData = this.extractMissingSemesters(originalText, missingSemesters);
      
      // Merge additional data
      if (additionalData.students && additionalData.students.length > 0) {
        analysisResult.students = [...(analysisResult.students || []), ...additionalData.students];
        console.log(`Added ${additionalData.students.length} students from missing semesters`);
      }
    }
    
    // Update semesters list
    analysisResult.semesters = Array.from(new Set([
      ...(analysisResult.semesters || []),
      ...detectedSemesters
    ])).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Ensure data quality
    analysisResult.students = this.validateAndCleanStudentData(analysisResult.students || []);
    
    console.log(`Analysis enhancement complete. Total semesters: ${analysisResult.semesters.length}`);
    return analysisResult;
  }

  detectAllSemesters(text) {
    const semesters = new Set();
    
    // Pattern to detect semester numbers
    const semesterPatterns = [
      /SEMESTER\s*([1-8])/gi,
      /SEM\s*([1-8])/gi,
      /([1-8])\s*SEMESTER/gi,
      /SEMESTER\s*([1-8])\s*RESULT/gi
    ];
    
    semesterPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const semesterNum = match[1];
        if (semesterNum && semesterNum >= '1' && semesterNum <= '8') {
          semesters.add(semesterNum);
        }
      }
    });
    
    return Array.from(semesters).sort();
  }

  extractMissingSemesters(text, missingSemesters) {
    // Simple extraction for missing semesters
    const students = [];
    
    missingSemesters.forEach(semester => {
      const semesterPattern = new RegExp(`SEMESTER\\s*${semester}[\\s\\S]*?(?=SEMESTER\\s*[1-8]|$)`, 'i');
      const semesterMatch = text.match(semesterPattern);
      
      if (semesterMatch) {
        const semesterText = semesterMatch[0];
        
        // Extract basic student info if possible
        const rollNumberPattern = /\b\d{2}[A-Z]{2,4}\d{3,4}\b/g;
        const rollNumbers = semesterText.match(rollNumberPattern);
        
        if (rollNumbers) {
          rollNumbers.forEach(rollNumber => {
            students.push({
              name: `Student ${rollNumber}`,
              rollNumber: rollNumber,
              semester: semester,
              subjects: [],
              sgpa: 'N/A',
              cgpa: 'N/A',
              result: 'N/A'
            });
          });
        }
      }
    });
    
    return { students };
  }

  validateAndCleanStudentData(students) {
    return students.map(student => {
      // Ensure all required fields exist
      const cleanedStudent = {
        name: student.name || 'Unknown Student',
        rollNumber: student.rollNumber || 'N/A',
        semester: student.semester || '1',
        subjects: Array.isArray(student.subjects) ? student.subjects : [],
        sgpa: student.sgpa || 'N/A',
        cgpa: student.cgpa || 'N/A',
        result: student.result || 'N/A'
      };
      
      // Clean subject data
      cleanedStudent.subjects = cleanedStudent.subjects.map(subject => ({
        code: subject.code || 'N/A',
        name: subject.name || 'N/A',
        credits: subject.credits || 'N/A',
        grade: subject.grade || 'N/A',
        marks: subject.marks || 'N/A'
      }));
      
      return cleanedStudent;
    });
  }

  groupBySemester(analysisData) {
    console.log('Grouping students by semester...');
    
    const semesterGroups = {};
    
    if (!analysisData.students || !Array.isArray(analysisData.students)) {
      console.log('No students data to group');
      return semesterGroups;
    }
    
    analysisData.students.forEach(student => {
      const semester = student.semester || '1';
      
      if (!semesterGroups[semester]) {
        semesterGroups[semester] = {
          semester: semester,
          students: [],
          institution: analysisData.institution || 'Anna University',
          examType: analysisData.examType || 'Regular',
          academicYear: analysisData.academicYear || 'N/A',
          generatedAt: new Date().toISOString()
        };
      }
      
      semesterGroups[semester].students.push(student);
    });
    
    // Sort semesters numerically
    const sortedGroups = {};
    Object.keys(semesterGroups)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(key => {
        sortedGroups[key] = semesterGroups[key];
      });
    
    console.log(`Grouped into ${Object.keys(sortedGroups).length} semesters:`, 
      Object.keys(sortedGroups).map(sem => `Semester ${sem}: ${sortedGroups[sem].students.length} students`));
    
    return sortedGroups;
  }
}

export default new PDFProcessor();

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import groqService from './groqService.js';

class PDFProcessor {
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      return {
        text: data.text,
        totalPages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async processAndAnalyzePDF(pdfBuffer) {
    try {
      // Extract text from PDF
      const pdfData = await this.extractTextFromPDF(pdfBuffer);
      
      // Analyze text with Groq LLM
      const analysisResult = await groqService.analyzePDFText(pdfData.text);
      
      // Add metadata
      const processedData = {
        ...analysisResult,
        metadata: {
          totalPages: pdfData.totalPages,
          extractedAt: new Date(),
          textLength: pdfData.text.length,
          info: pdfData.info
        }
      };

      return processedData;
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  groupBySemester(analysisData) {
    try {
      const semesterGroups = {};
      
      if (analysisData.students && Array.isArray(analysisData.students)) {
        analysisData.students.forEach(student => {
          const semester = student.semester || 'Unknown';
          
          if (!semesterGroups[semester]) {
            semesterGroups[semester] = {
              semester: semester,
              students: [],
              institution: analysisData.institution,
              examType: analysisData.examType,
              academicYear: analysisData.academicYear
            };
          }
          
          semesterGroups[semester].students.push(student);
        });
      }

      return semesterGroups;
    } catch (error) {
      console.error('Semester grouping error:', error);
      throw new Error(`Failed to group by semester: ${error.message}`);
    }
  }
}

export default new PDFProcessor();

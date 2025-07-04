import Groq from 'groq-sdk';

// Model configuration with multiple fallbacks for rate limiting
const GROQ_MODEL_CONFIG = {
  models: [
    "llama-3.3-70b-versatile",      // Primary model
    "llama-3.1-8b-instant",         // Fast fallback
    "mixtral-8x7b-32768",           // Alternative model
    "gemma2-9b-it",                 // Another fallback
    "llama3-8b-8192"                // Final fallback
  ],
  test: "llama-3.1-8b-instant"     // For connection testing
};

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async analyzePDFText(pdfText) {
    try {
      console.log(`Starting analysis of ${pdfText.length} characters of PDF text`);
      
      // Split the PDF text by "Anna University :: Chennai" to get individual result sections
      const sections = this.splitByUniversityHeaders(pdfText);
      console.log(`Found ${sections.length} sections separated by "Anna University :: Chennai"`);
      
      let allStudents = [];
      let allSemesters = new Set();
      let institutionName = "Anna University";
      let examType = "Regular";
      let academicYear = "N/A";
      
      // Process each section separately
      for (let i = 0; i < sections.length; i++) {
        console.log(`Processing section ${i + 1}/${sections.length}...`);
        
        try {
          const sectionResult = await this.analyzeSingleSection(sections[i], i + 1);
          
          if (sectionResult && sectionResult.students && sectionResult.students.length > 0) {
            allStudents.push(...sectionResult.students);
            
            // Collect semester information
            if (sectionResult.semesters) {
              sectionResult.semesters.forEach(sem => allSemesters.add(sem));
            }
            
            // Update metadata from first valid section
            if (sectionResult.institution && sectionResult.institution !== "N/A") {
              institutionName = sectionResult.institution;
            }
            if (sectionResult.examType && sectionResult.examType !== "N/A") {
              examType = sectionResult.examType;
            }
            if (sectionResult.academicYear && sectionResult.academicYear !== "N/A") {
              academicYear = sectionResult.academicYear;
            }
            
            console.log(`✅ Section ${i + 1} processed successfully: ${sectionResult.students.length} students`);
          } else {
            console.log(`⚠️ Section ${i + 1} returned no valid students`);
            
            // Try with a simpler prompt for difficult sections
            console.log(`🔄 Retrying section ${i + 1} with simplified approach...`);
            const retryResult = await this.retryWithSimplePrompt(sections[i], i + 1);
            if (retryResult && retryResult.students && retryResult.students.length > 0) {
              allStudents.push(...retryResult.students);
              console.log(`✅ Section ${i + 1} retry successful: ${retryResult.students.length} students`);
            }
          }
        } catch (sectionError) {
          console.error(`❌ Error processing section ${i + 1}:`, sectionError.message);
          // Continue with other sections even if one fails
        }
      }
      
      console.log(`Analysis complete: ${allStudents.length} students found across ${allSemesters.size} semesters`);
      
      return {
        students: allStudents,
        institution: institutionName,
        examType: examType,
        academicYear: academicYear,
        semesters: Array.from(allSemesters).sort(),
        totalSections: sections.length,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('PDF analysis error:', error);
      throw new Error(`Failed to analyze PDF: ${error.message}`);
    }
  }

  splitByUniversityHeaders(pdfText) {
    console.log(`Original text length: ${pdfText.length} characters`);
    
    // Enhanced splitting patterns for comprehensive semester detection
    const splitPatterns = [
      // University headers
      'Anna University :: Chennai',
      'Anna University :: Chennai-600025',
      'Anna University :: Chennai-25',
      'Anna University::Chennai',
      'ANNA UNIVERSITY :: CHENNAI',
      'Anna University Chennai',
      'Anna University, Chennai',
      'ANNA UNIVERSITY, CHENNAI',
      
      // Semester patterns with results
      'SEMESTER\\s*[1-8]\\s*RESULT',
      'SEMESTER\\s*[1-8]\\s*RESULTS',
      'SEM\\s*[1-8]\\s*RESULT',
      'SEM\\s*[1-8]\\s*RESULTS',
      
      // Direct semester markers
      'SEMESTER\\s*[1-8]\\b',
      'SEM\\s*[1-8]\\b',
      
      // Written semester forms
      'FIRST\\s*SEMESTER',
      'SECOND\\s*SEMESTER',
      'THIRD\\s*SEMESTER',
      'FOURTH\\s*SEMESTER',
      'FIFTH\\s*SEMESTER',
      'SIXTH\\s*SEMESTER',
      'SEVENTH\\s*SEMESTER',
      'EIGHTH\\s*SEMESTER',
      
      // Roman numerals
      'SEMESTER\\s*I\\b',
      'SEMESTER\\s*II\\b',
      'SEMESTER\\s*III\\b',
      'SEMESTER\\s*IV\\b',
      'SEMESTER\\s*V\\b',
      'SEMESTER\\s*VI\\b',
      'SEMESTER\\s*VII\\b',
      'SEMESTER\\s*VIII\\b',
      
      // Numeric forms
      '[1-8]\\s*SEMESTER',
      '[1-8]st\\s*SEMESTER',
      '[1-8]nd\\s*SEMESTER',
      '[1-8]rd\\s*SEMESTER',
      '[1-8]th\\s*SEMESTER'
    ];
    
    let sections = [pdfText]; // Start with full text
    
    // Split by each pattern
    for (const pattern of splitPatterns) {
      const newSections = [];
      for (const section of sections) {
        const regex = new RegExp(pattern, 'gi');
        const parts = section.split(regex);
        
        if (parts.length > 1) {
          // Keep the delimiter with the next section for context
          for (let i = 0; i < parts.length; i++) {
            if (i === 0) {
              if (parts[i].trim()) newSections.push(parts[i]);
            } else {
              // Find the actual matched text and include it
              const matches = [...section.matchAll(regex)];
              const matchedText = matches[i - 1] ? matches[i - 1][0] : pattern;
              newSections.push(matchedText + ' ' + parts[i]);
            }
          }
        } else {
          newSections.push(section);
        }
      }
      sections = newSections;
    }
    
    // Advanced multi-page table splitting
    if (sections.length <= 3) {
      console.log('Applying advanced multi-page table splitting...');
      
      // Enhanced patterns for multi-page table detection
      const multiPagePatterns = [
        // Student roll number patterns
        /(?=\b\d{2}[A-Z]{2,4}\d{3,4}\b)/g,  // Like 19CSE001, 20IT123
        /(?=\b\d{4}[A-Z]{2,4}\d{3,4}\b)/g,  // Like 2019CSE001
        /(?=\b[A-Z]{2,4}\d{2}\d{3,4}\b)/g,  // Like CSE19001
        
        // Registration/Roll number headers
        /(?=Register\s*No|Roll\s*No|Reg\s*No|Registration\s*No)/gi,
        /(?=Student\s*Name|NAME\s*OF\s*STUDENT|Student\s*Details)/gi,
        
        // Subject code patterns
        /(?=\b[A-Z]{2}\d{4}\b)/g,  // CS1234, MA8151
        /(?=\b\d{2}[A-Z]{2}\d{3}\b)/g,  // 18CS101, 19MA102
        /(?=\b[A-Z]{2,4}\d{3,4}\b)/g,  // ECE201, MECH1001
        
        // Result and grade patterns
        /(?=Result\s*:|RESULT\s*:|Result\s*-|RESULT\s*-)/gi,
        /(?=Grade\s*Point|GRADE\s*POINT|GPA|SGPA|CGPA)/gi,
        
        // Table continuation markers
        /(?=\.\.\.\s*contd|\.\.\.\s*continued|continued\s*on\s*next\s*page)/gi,
        
        // Page break indicators
        /(?=Page\s*\d+|PAGE\s*\d+)/gi,
        
        // Academic year patterns
        /(?=\b\d{4}-\d{4}\b|\b\d{4}-\d{2}\b)/g  // 2019-2020, 2019-20
      ];
      
      for (const pattern of multiPagePatterns) {
        const newSections = [];
        for (const section of sections) {
          const parts = section.split(pattern);
          if (parts.length > sections.length) {
            // Only split if we get more meaningful sections
            parts.forEach(part => {
              const trimmed = part.trim();
              if (trimmed.length > 150) { // Minimum meaningful section size
                newSections.push(part);
              }
            });
          } else {
            newSections.push(section);
          }
        }
        if (newSections.length > sections.length) {
          sections = newSections;
          console.log(`Advanced split by pattern, now have ${sections.length} sections`);
          break;
        }
      }
    }
    
    // Intelligent chunk splitting for very large documents
    if (sections.length === 1 && pdfText.length > 15000) {
      console.log('Applying intelligent chunk splitting for large document...');
      
      const targetChunkSize = 10000;
      const overlapSize = 1000; // Overlap to handle split data
      const chunks = [];
      
      let start = 0;
      while (start < pdfText.length) {
        let end = Math.min(start + targetChunkSize, pdfText.length);
        
        // Try to break at natural boundaries
        if (end < pdfText.length) {
          const possibleBreaks = [
            pdfText.lastIndexOf('Anna University', end),
            pdfText.lastIndexOf('SEMESTER', end),
            pdfText.lastIndexOf('Result:', end),
            pdfText.lastIndexOf('\n\n', end),
            pdfText.lastIndexOf('\n', end),
            pdfText.lastIndexOf(' ', end)
          ];
          
          const bestBreak = possibleBreaks.find(pos => pos > start + targetChunkSize * 0.7);
          if (bestBreak && bestBreak > start) {
            end = bestBreak;
          }
        }
        
        // Add chunk with overlap for continuity
        let chunk = pdfText.substring(start, end);
        
        // Add overlap from previous chunk for continuity
        if (start > 0 && start < pdfText.length - overlapSize) {
          const overlapStart = Math.max(0, start - overlapSize);
          const overlap = pdfText.substring(overlapStart, start);
          chunk = '...PREVIOUS CONTEXT...\n' + overlap + '\n...CURRENT SECTION...\n' + chunk;
        }
        
        chunks.push(chunk);
        start = end;
      }
      
      sections = chunks;
      console.log(`Split into ${sections.length} intelligent chunks`);
    }
    
    // Enhanced filtering for valid sections
    const validSections = sections.filter(section => {
      const trimmed = section.trim();
      const hasMinLength = trimmed.length > 100;
      
      // Check for academic content indicators
      const hasAcademicContent = (
        trimmed.includes('Student') || 
        trimmed.includes('Register') || 
        trimmed.includes('Grade') || 
        trimmed.includes('Subject') ||
        trimmed.includes('SGPA') ||
        trimmed.includes('CGPA') ||
        trimmed.includes('Result') ||
        trimmed.includes('Name') ||
        trimmed.includes('Semester') ||
        trimmed.includes('University') ||
        /\b\d{2}[A-Z]{2,4}\d{3,4}\b/.test(trimmed) || // Roll number pattern
        /\b[A-Z]{2,4}\d{3,4}\b/.test(trimmed) || // Subject code pattern
        /\b[A-Z]\+?\b/.test(trimmed) || // Grade pattern
        /\bSGPA\b|\bCGPA\b/.test(trimmed) // GPA patterns
      );
      
      return hasMinLength && hasAcademicContent;
    });
    
    console.log(`Split into ${validSections.length} valid sections from ${sections.length} total parts`);
    console.log('Section lengths:', validSections.map(s => s.length));
    console.log('Sample section starts:', validSections.map(s => s.substring(0, 100).replace(/\n/g, ' ')));
    
    return validSections.length > 0 ? validSections : [pdfText]; // Fallback to original text
  }

  async analyzeSingleSection(sectionText, sectionNumber) {
    try {
      // Limit each section to reasonable size for AI processing
      const maxSectionSize = 12000;
      let textToAnalyze = sectionText.trim();
      
      if (textToAnalyze.length > maxSectionSize) {
        // Try to find a good breaking point (like end of a student record)
        const cutoff = textToAnalyze.lastIndexOf('Result:', maxSectionSize);
        if (cutoff > maxSectionSize * 0.7) {
          textToAnalyze = textToAnalyze.substring(0, cutoff + 50);
        } else {
          textToAnalyze = textToAnalyze.substring(0, maxSectionSize);
        }
        console.log(`Section ${sectionNumber} truncated from ${sectionText.length} to ${textToAnalyze.length} characters`);
      }

      const prompt = `
You are an expert at extracting student academic data from Indian university result PDFs with 99% accuracy.

This is section ${sectionNumber} of a multi-page result document. Extract ALL student data with MAXIMUM ACCURACY.

🎯 CRITICAL MISSION: Extract ALL 8 semesters with PERFECT subject codes and grades for Excel generation.

📋 ENHANCED EXTRACTION RULES:

1. SEMESTER DETECTION (MANDATORY):
   - Primary: "SEMESTER 1", "SEMESTER 2", ... "SEMESTER 8"
   - Secondary: "SEM 1", "SEM I", "FIRST SEMESTER", "1st SEMESTER"
   - Roman: I, II, III, IV, V, VI, VII, VIII
   - Extract semester number from any context

2. MULTI-PAGE TABLE MASTERY:
   - Look for "...continued", "...contd", "continued on next page"
   - Student data may span 2-3 pages
   - Subject tables may be split across pages
   - Roll numbers may repeat with different subjects
   - Merge data from same student across pages

3. SUBJECT CODE PRECISION (CRITICAL):
   - Standard: MA8151, CS8251, PH8151, EC8251, GE8152, etc.
   - Alternative: 18CS101, 19MA102, 20PH201, 21EC301, etc.
   - Department codes: CS, IT, ECE, EEE, MECH, CIVIL, BME, etc.
   - Pattern: [PREFIX][DIGITS] or [DIGITS][PREFIX][DIGITS]
   - Extract EXACTLY as written, no modifications

4. GRADE EXTRACTION (CRITICAL):
   - Letter grades: A+, A, B+, B, C+, C, D, F, O, S, U
   - Full words: PASS, FAIL, ABSENT, REAPPEAR, WITHHELD
   - Numeric: 10, 9, 8, 7, 6, 5, 4, 0
   - Extract EXACTLY as written, preserve case

5. ADVANCED PARSING TECHNIQUES:
   - Look for tabular structures even if poorly formatted
   - Handle vertical and horizontal table layouts
   - Extract from lists, grids, or any structured format
   - Parse incomplete or corrupted table data
   - Handle merged cells and split data

6. STUDENT DATA CONTINUITY:
   - Same student may appear multiple times
   - Merge subjects from same student
   - Handle continuation across pages
   - Preserve all subject entries

7. ACCURACY VALIDATION:
   - Subject codes must match actual patterns
   - Grades must be valid academic grades
   - Semester numbers must be 1-8
   - Roll numbers must follow institutional format

🔍 PARSING STRATEGY:
- Scan entire section for ALL semester markers
- Extract each semester's data separately
- Merge continuation data
- Validate extracted codes and grades
- Handle edge cases gracefully

Return ONLY a valid JSON object:
{
  "students": [
    {
      "name": "STUDENT_NAME",
      "rollNumber": "REGISTRATION_NUMBER", 
      "semester": "SEMESTER_NUMBER",
      "subjects": [
        {
          "code": "EXACT_SUBJECT_CODE",
          "name": "Subject Name",
          "credits": "CREDITS",
          "grade": "EXACT_GRADE",
          "marks": "MARKS"
        }
      ],
      "sgpa": "SGPA_VALUE",
      "cgpa": "CGPA_VALUE",
      "result": "PASS_OR_FAIL"
    }
  ],
  "institution": "Anna University",
  "examType": "Regular",
  "academicYear": "YEAR",
  "semesters": ["SEMESTER_NUMBERS"]
}

PARSING RULES:
1. If you find ANY student data, include it
2. Use "N/A" for missing fields
3. Extract from tables, lists, or any structured format
4. Be liberal in interpretation - include partial data
5. Look for patterns across multiple lines
6. Students may span multiple lines
7. Subjects may be in table format or lists
8. Prioritize accuracy over completeness for subject codes and grades
9. Handle all 8 semesters if present
10. Merge data from multi-page tables

Text to analyze:
${textToAnalyze}

REMEMBER: Return valid JSON only. Extract ALL recognizable student/subject data across ALL semesters with ACCURATE subject codes and grades.
      `;

      // Use the new fallback method with multiple models
      const response = await this.callGroqWithFallback([
        {
          role: "system",
          content: "You are an expert at extracting structured academic data from PDF text. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ], 8000, 0.1);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from Groq API for section ${sectionNumber}`);
      }

      console.log(`Raw Groq response for section ${sectionNumber}:`, content);

      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      
      // Remove ```json and ``` markers
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '');
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.replace(/\s*```$/, '');
      }

      console.log(`Cleaned content for section ${sectionNumber}:`, cleanContent.substring(0, 200) + '...');

      // Check if content looks like valid JSON
      if (!cleanContent.startsWith('{') && !cleanContent.startsWith('[')) {
        throw new Error(`Section ${sectionNumber} response does not appear to be JSON format`);
      }

      // Parse JSON response with better error handling
      try {
        const jsonData = this.parseJSONRobustly(cleanContent, sectionNumber);
        
        // Validate the structure
        if (!jsonData.students || !Array.isArray(jsonData.students)) {
          console.log(`Section ${sectionNumber}: Invalid structure - creating fallback data`);
          return this.createSectionFallbackData(sectionNumber);
        }
        
        // Ensure each student has required fields
        jsonData.students = jsonData.students.map(student => ({
          name: student.name || "Unknown Student",
          rollNumber: student.rollNumber || "N/A",
          semester: student.semester || "1",
          subjects: Array.isArray(student.subjects) ? student.subjects : [],
          sgpa: student.sgpa || "N/A",
          cgpa: student.cgpa || "N/A",
          result: student.result || "N/A"
        }));
        
        console.log(`Section ${sectionNumber}: Successfully parsed ${jsonData.students.length} students`);
        return jsonData;
        
      } catch (parseError) {
        console.error(`JSON Parse Error for section ${sectionNumber}:`, parseError);
        console.error('Content preview:', cleanContent.substring(0, 500) + '...');
        
        return this.createSectionFallbackData(sectionNumber, parseError.message);
      }

    } catch (error) {
      console.error(`Error analyzing section ${sectionNumber}:`, error);
      return this.createSectionFallbackData(sectionNumber, error.message);
    }
  }

  async retryWithSimplePrompt(sectionText, sectionNumber) {
    try {
      console.log(`Retry attempt for section ${sectionNumber} with simplified prompt`);
      
      // Much simpler prompt for difficult sections
      const simplePrompt = `
Extract student names, roll numbers, and any academic data from this text.
Return JSON format:
{
  "students": [
    {
      "name": "STUDENT_NAME",
      "rollNumber": "ROLL_NUMBER",
      "semester": "SEMESTER",
      "subjects": [{"code": "CODE", "name": "NAME", "grade": "GRADE"}],
      "result": "PASS"
    }
  ],
  "institution": "Anna University",
  "semesters": ["1"]
}

Text:
${sectionText.substring(0, 6000)}

Extract ANY recognizable data. Use "N/A" for missing fields.
      `;

      const response = await this.callGroqWithFallback([
        {
          role: "system",
          content: "Extract academic data and return valid JSON only."
        },
        {
          role: "user",
          content: simplePrompt
        }
      ], 4000, 0.2);

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      // Clean and parse
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '');
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.replace(/\s*```$/, '');
      }

      try {
        const jsonData = this.parseJSONRobustly(cleanContent, sectionNumber);
        if (jsonData.students && Array.isArray(jsonData.students) && jsonData.students.length > 0) {
          console.log(`Retry successful for section ${sectionNumber}: ${jsonData.students.length} students`);
          return jsonData;
        }
      } catch (parseError) {
        console.log(`Retry also failed for section ${sectionNumber}: ${parseError.message}`);
      }
      
      return null;
    } catch (error) {
      console.error(`Retry failed for section ${sectionNumber}:`, error.message);
      return null;
    }
  }

  createFallbackData(errorMessage) {
    return {
      students: [{
        name: "Unable to parse student data",
        rollNumber: "N/A",
        semester: "1",
        subjects: [{
          code: "ERROR",
          name: "PDF parsing failed - please check PDF format",
          credits: "N/A",
          grade: "N/A",
          marks: "N/A"
        }],
        sgpa: "N/A",
        cgpa: "N/A",
        result: "PARSING_ERROR"
      }],
      institution: "Unable to parse institution",
      examType: "Unable to parse exam type",
      academicYear: "Unable to parse academic year",
      semesters: ["1"],
      parsing_error: true,
      error_message: errorMessage,
      instructions: "Please ensure your PDF contains clear academic result data with student names, roll numbers, subjects, and grades."
    };
  }

  createSectionFallbackData(sectionNumber, errorMessage = 'Unknown error') {
    console.log(`Creating fallback data for section ${sectionNumber}: ${errorMessage}`);
    
    return {
      students: [], // Empty array instead of error student
      institution: "Anna University",
      examType: "Regular",
      academicYear: "N/A",
      semesters: [],
      parsing_error: true,
      error_message: errorMessage,
      section_number: sectionNumber,
      note: `Section ${sectionNumber} could not be parsed - continuing with other sections`
    };
  }

  async testConnection() {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Say 'Hello' to test the connection."
          }
        ],
        model: GROQ_MODEL_CONFIG.test,
        max_tokens: 10
      });

      return {
        success: true,
        message: 'Groq API connection successful',
        response: response.choices[0]?.message?.content
      };
    } catch (error) {
      console.error('Groq connection test failed:', error);
      return {
        success: false,
        message: 'Groq API connection failed',
        error: error.message
      };
    }
  }

  async callGroqWithFallback(messages, maxTokens = 8000, temperature = 0.1) {
    let lastError = null;
    
    for (let i = 0; i < GROQ_MODEL_CONFIG.models.length; i++) {
      const model = GROQ_MODEL_CONFIG.models[i];
      console.log(`Trying model ${i + 1}/${GROQ_MODEL_CONFIG.models.length}: ${model}`);
      
      try {
        const response = await this.groq.chat.completions.create({
          messages: messages,
          model: model,
          temperature: temperature,
          max_tokens: maxTokens
        });
        
        console.log(`✅ Successfully used model: ${model}`);
        return response;
        
      } catch (error) {
        console.log(`❌ Model ${model} failed: ${error.message}`);
        lastError = error;
        
        // If rate limited, wait a bit before trying next model
        if (error.message.includes('rate_limit')) {
          console.log('Rate limit hit, waiting 2 seconds before next model...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Continue to next model
        continue;
      }
    }
    
    // If all models failed, throw the last error
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  parseJSONRobustly(content, sectionNumber) {
    try {
      // Try parsing as-is first
      return JSON.parse(content);
    } catch (error) {
      console.log(`Initial JSON parse failed for section ${sectionNumber}: ${error.message}`);
      
      // Try to fix common JSON issues
      let fixedContent = content;
      
      // Fix unterminated strings by finding the last complete object
      if (error.message.includes('Unterminated string')) {
        console.log('Attempting to fix unterminated string...');
        
        // Find the last complete closing brace
        const lastBrace = fixedContent.lastIndexOf('}');
        if (lastBrace > 0) {
          fixedContent = fixedContent.substring(0, lastBrace + 1);
        }
      }
      
      // Fix missing quotes around property names
      if (error.message.includes('Expected double-quoted property name')) {
        console.log('Attempting to fix property names...');
        
        // Simple regex to add quotes around unquoted property names
        fixedContent = fixedContent.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      }
      
      // Try parsing the fixed content
      try {
        const result = JSON.parse(fixedContent);
        console.log(`✅ JSON fixed and parsed successfully for section ${sectionNumber}`);
        return result;
      } catch (secondError) {
        console.log(`JSON fix attempt failed: ${secondError.message}`);
        
        // Try to extract just the students array if possible
        const studentsMatch = fixedContent.match(/"students"\s*:\s*\[(.*?)\]/s);
        if (studentsMatch) {
          try {
            const studentsArray = JSON.parse(`[${studentsMatch[1]}]`);
            console.log(`✅ Extracted students array for section ${sectionNumber}`);
            return {
              students: studentsArray,
              institution: "Anna University",
              examType: "Regular",
              academicYear: "N/A",
              semesters: ["1"]
            };
          } catch (arrayError) {
            console.log(`Students array extraction failed: ${arrayError.message}`);
          }
        }
        
        // Final fallback - return empty structure
        console.log(`❌ All JSON parsing attempts failed for section ${sectionNumber}`);
        throw new Error(`JSON parsing failed: ${error.message}`);
      }
    }
  }
}

export default new GroqService();
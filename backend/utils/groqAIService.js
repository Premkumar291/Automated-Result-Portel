import Groq from 'groq-sdk';

/**
 * AI-Powered PDF Processing Service using Groq SDK
 * Provides intelligent parsing and data extraction from academic PDFs
 */
class GroqAIService {
  constructor() {
    this.groq = null;
    this.isInitialized = false;
    this.initializeGroq();
  }

  /**
   * Initialize Groq SDK with API key
   */
  async initializeGroq() {
    try {
      if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not found in environment variables. AI parsing will be disabled.');
        return;
      }

      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      this.isInitialized = true;
      console.log('Groq AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Groq AI Service:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Check if AI service is available
   * @returns {boolean} True if AI service is ready
   */
  isAvailable() {
    return this.isInitialized && this.groq !== null;
  }

  /**
   * Parse PDF text using AI for intelligent data extraction
   * @param {string} rawText - Raw text extracted from PDF
   * @returns {Promise<Array>} Array of structured student records
   */
  async parseWithAI(rawText) {
    if (!this.isAvailable()) {
      throw new Error('Groq AI Service is not initialized');
    }

    try {
      console.log('Starting AI-powered PDF parsing...');
      
      const prompt = this.createParsingPrompt(rawText);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile", // Using Llama 3.3 for better reasoning
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 4096,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response received from AI model');
      }

      const parsedData = JSON.parse(response);
      console.log(`AI successfully parsed ${parsedData.students?.length || 0} student records`);
      
      return this.validateAIResponse(parsedData);

    } catch (error) {
      console.error('AI parsing failed:', error.message);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  /**
   * Create a structured prompt for AI parsing
   * @param {string} rawText - Raw PDF text
   * @returns {string} Formatted prompt
   */
  createParsingPrompt(rawText) {
    return `
Please analyze this academic result PDF text and extract student data in the specified JSON format.

PDF TEXT:
"""
${rawText.substring(0, 8000)} // Limit text to avoid token limits
"""

EXTRACTION REQUIREMENTS:
1. Identify semester numbers (look for "Semester No.: X" or similar patterns)
2. Separate ARREAR results from CURRENT/REGULAR semester results
3. Extract student registration numbers (typically 12 digits like 731123205005)
4. Extract student names (usually in ALL CAPS after reg number)
5. Extract subject codes (format: 2-3 letters + 4 digits like CS3351, MA3354)
6. Extract grades (O, A+, A, B+, B, C, P for passing; RA, AB, F, U for failing)
7. Extract academic metadata (course, regulation, batch/year if available)

IMPORTANT PATTERNS TO RECOGNIZE:
- Registration numbers: Usually 12 digits (e.g., 731123205005)
- Subject codes: Pattern like CS3351, MA3354, EN3251, etc.
- Valid grades: O, A+, A, B+, B, C, P (passing), RA, AB, F, U (failing)
- Section indicators: "ARREAR", "BACKLOG", "CURRENT SEMESTER", "REGULAR"

Please respond with ONLY valid JSON matching the expected format.
`;
  }

  /**
   * Get system prompt for AI model
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are an expert academic data extraction AI specialized in parsing Indian university result PDFs. 

Your task is to extract student academic results from PDF text and structure them into JSON format.

EXPECTED JSON OUTPUT FORMAT:
{
  "metadata": {
    "totalStudents": number,
    "semestersFound": [array of semester numbers],
    "course": "string (if found)",
    "regulation": "string (if found)",
    "academicYear": "string (if found)",
    "university": "string (if found)"
  },
  "students": [
    {
      "reg_no": "string (12 digits)",
      "name": "string (ALL CAPS)",
      "semester": number,
      "type": "arrear" or "current",
      "subjects": [
        {
          "code": "string (e.g., CS3351)",
          "grade": "string (e.g., A+, O, B)"
        }
      ]
    }
  ]
}

VALIDATION RULES:
- Registration numbers must be 12 digits
- Names must be in ALL CAPS
- Semester must be between 1-8
- Type must be either "arrear" or "current"
- Subject codes must follow pattern: 2-3 letters + 4 digits
- Grades must be valid: O, A+, A, B+, B, C, P, RA, AB, F, U
- Each student must have at least one subject

PARSING GUIDELINES:
1. Look for clear section headers to identify arrear vs current results
2. Student data usually appears in tabular format: RegNo Name Subject1 Grade1 Subject2 Grade2...
3. Multiple subjects for same student may be on same line or continuation lines
4. Ignore header/footer information, focus on student data sections
5. If semester is not explicitly stated per student, use the semester number from section headers

Return ONLY the JSON object, no additional text or explanations.`;
  }

  /**
   * Validate AI response and ensure data quality
   * @param {Object} aiResponse - Response from AI model
   * @returns {Array} Validated student records
   */
  validateAIResponse(aiResponse) {
    if (!aiResponse || !aiResponse.students || !Array.isArray(aiResponse.students)) {
      throw new Error('Invalid AI response format: missing students array');
    }

    const validatedStudents = [];

    for (const student of aiResponse.students) {
      try {
        // Validate required fields
        if (!student.reg_no || !student.name || !student.semester || !student.type) {
          console.warn('Skipping student with missing required fields:', student);
          continue;
        }

        // Validate registration number (12 digits)
        if (!/^\d{12}$/.test(student.reg_no)) {
          console.warn('Invalid registration number format:', student.reg_no);
          continue;
        }

        // Validate semester (1-8)
        if (student.semester < 1 || student.semester > 8) {
          console.warn('Invalid semester:', student.semester);
          continue;
        }

        // Validate type
        if (!['arrear', 'current'].includes(student.type.toLowerCase())) {
          console.warn('Invalid type:', student.type);
          continue;
        }

        // Validate subjects
        if (!Array.isArray(student.subjects) || student.subjects.length === 0) {
          console.warn('Student has no valid subjects:', student.reg_no);
          continue;
        }

        // Validate and clean subjects
        const validSubjects = student.subjects.filter(subject => {
          return this.isValidSubjectCode(subject.code) && 
                 this.isValidGrade(subject.grade);
        });

        if (validSubjects.length === 0) {
          console.warn('No valid subjects found for student:', student.reg_no);
          continue;
        }

        // Create validated student record
        const validatedStudent = {
          reg_no: student.reg_no.toUpperCase(),
          name: student.name.toUpperCase().trim(),
          semester: parseInt(student.semester),
          type: student.type.toLowerCase(),
          subjects: validSubjects.map(subject => ({
            code: subject.code.toUpperCase(),
            grade: subject.grade.toUpperCase()
          }))
        };

        // Add optional metadata if available
        if (aiResponse.metadata?.course) {
          validatedStudent.course = aiResponse.metadata.course;
        }
        if (aiResponse.metadata?.regulation) {
          validatedStudent.regulation = aiResponse.metadata.regulation;
        }
        if (aiResponse.metadata?.academicYear) {
          validatedStudent.batch = aiResponse.metadata.academicYear;
        }

        validatedStudents.push(validatedStudent);

      } catch (error) {
        console.warn('Error validating student record:', error.message, student);
      }
    }

    console.log(`AI validation complete: ${validatedStudents.length}/${aiResponse.students.length} students validated`);
    return validatedStudents;
  }

  /**
   * Validate subject code format
   * @param {string} code - Subject code
   * @returns {boolean} True if valid
   */
  isValidSubjectCode(code) {
    if (!code || typeof code !== 'string') return false;
    return /^[A-Z]{2,4}\d{4}$/.test(code.toUpperCase());
  }

  /**
   * Validate grade format
   * @param {string} grade - Grade
   * @returns {boolean} True if valid
   */
  isValidGrade(grade) {
    if (!grade || typeof grade !== 'string') return false;
    const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'RA', 'AB', 'F', 'U', 'I', 'W'];
    return validGrades.includes(grade.toUpperCase());
  }

  /**
   * Enhanced parsing with AI + fallback to traditional methods
   * @param {string} rawText - Raw PDF text
   * @returns {Promise<Array>} Parsed student records
   */
  async intelligentParse(rawText) {
    let aiResults = [];
    let traditionalResults = [];

    // Try AI parsing first
    if (this.isAvailable()) {
      try {
        console.log('Attempting AI-powered parsing...');
        aiResults = await this.parseWithAI(rawText);
        
        if (aiResults.length > 0) {
          console.log(`AI parsing successful: ${aiResults.length} records found`);
          return {
            method: 'ai',
            confidence: 'high',
            results: aiResults,
            fallbackResults: null
          };
        }
      } catch (error) {
        console.warn('AI parsing failed, falling back to traditional parsing:', error.message);
      }
    }

    // Fallback to traditional parsing
    console.log('Using traditional pattern-based parsing...');
    const PdfTextProcessor = (await import('./pdfTextProcessor.js')).default;
    
    // Use traditional parsing logic here
    // This would integrate with your existing parsing logic
    traditionalResults = await this.traditionalParse(rawText);

    return {
      method: 'traditional',
      confidence: aiResults.length > 0 ? 'medium' : 'low',
      results: traditionalResults,
      fallbackResults: aiResults.length > 0 ? aiResults : null
    };
  }

  /**
   * Traditional parsing fallback method
   * @param {string} rawText - Raw PDF text
   * @returns {Promise<Array>} Parsed results using traditional methods
   */
  async traditionalParse(rawText) {
    // This would call your existing traditional parsing logic
    // For now, return empty array - integrate with existing PdfTextProcessor
    console.log('Traditional parsing would be implemented here...');
    return [];
  }

  /**
   * Get AI service status and statistics
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      available: this.isAvailable(),
      apiKeyConfigured: !!process.env.GROQ_API_KEY,
      service: 'Groq AI (Llama 3.3 70B)'
    };
  }
}

// Export singleton instance
const groqAIService = new GroqAIService();
export default groqAIService;

import fs from 'fs-extra';
import path from 'path';
import XLSX from 'xlsx';
import PdfResult from '../models/pdfResult.model.js';
import PdfTextProcessor from '../utils/pdfTextProcessor.js';
import groqAIService from '../utils/groqAIService.js';

// PDF parsing libraries with fallback support
let pdfParse = null;
let PDFParser = null;

// Initialize PDF parsing libraries with error handling
async function initializePdfLibraries() {
  try {
    const pdfParseModule = await import('pdf-parse');
    pdfParse = pdfParseModule.default;
    console.log('pdf-parse library loaded successfully');
  } catch (error) {
    console.warn('pdf-parse library failed to load:', error.message);
  }

  try {
    const pdf2jsonModule = await import('pdf2json');
    PDFParser = pdf2jsonModule.default;
    console.log('pdf2json library loaded successfully');
  } catch (error) {
    console.warn('pdf2json library failed to load:', error.message);
  }
}

// Initialize libraries on module load
initializePdfLibraries();

/**
 * PDF Processing Controller for Automated College Result Portal
 * Handles extraction and structuring of student result data from academic PDFs
 */
class PdfProcessingController {
  
  /**
   * Main endpoint to process uploaded PDF files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async processPdfResults(req, res) {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No PDF file uploaded'
        });
      }

      const { originalname, buffer, mimetype } = req.file;
      
      // Validate file type
      if (mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'Only PDF files are allowed'
        });
      }

      console.log(`Processing PDF: ${originalname}`);

      // Extract text from PDF using available library
      let extractedText;
      try {
        extractedText = await PdfProcessingController.extractTextFromPdf(buffer);
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
        return res.status(400).json({
          success: false,
          message: 'Failed to extract text from PDF. Please ensure the PDF is not corrupted or password-protected.',
          error: pdfError.message
        });
      }

      // Parse and structure the data using AI + traditional methods
      let parseResult;
      try {
        parseResult = await PdfProcessingController.intelligentParseData(extractedText);
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Failed to parse PDF content. The PDF format may not be supported.',
          error: parseError.message
        });
      }

      let structuredData = parseResult.results;
      
      // Validate and clean the data
      structuredData = PdfProcessingController.validateAndCleanData(structuredData);
      
      if (structuredData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid student records found in the PDF. Please check the PDF format.'
        });
      }
      
      // Save to database
      const savedResults = await PdfProcessingController.saveToDatabase(
        structuredData, 
        originalname, 
        req.user.id
      );

      // Generate Excel files
      const excelFiles = await PdfProcessingController.generateExcelFiles(structuredData, originalname);

      // Create output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), 'backend', 'outputs');
      await fs.ensureDir(outputDir);

      // Save JSON file
      const jsonPath = path.join(outputDir, `${Date.now()}_${originalname.replace('.pdf', '.json')}`);
      await fs.writeJSON(jsonPath, structuredData, { spaces: 2 });

      return res.status(200).json({
        success: true,
        message: 'PDF processed successfully',
        data: {
          totalRecords: structuredData.length,
          savedRecords: savedResults.length,
          parsingMethod: parseResult.method,
          confidence: parseResult.confidence,
          aiServiceStatus: groqAIService.getServiceStatus(),
          summary: PdfProcessingController.generateSummary(structuredData),
          files: {
            json: jsonPath,
            excel: excelFiles
          },
          results: structuredData
        }
      });

    } catch (error) {
      console.error('PDF Processing Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process PDF',
        error: error.message
      });
    }
  }

  /**
   * Parse raw PDF text into structured JSON format
   * @param {string} text - Raw text extracted from PDF
   * @returns {Array} Array of structured student result objects
   */
  static async parseResultData(text) {
    const results = [];
    
    // Clean and normalize the text
    const cleanedText = PdfTextProcessor.cleanText(text);
    const lines = cleanedText.split('\n').filter(line => line.trim().length > 0);
    
    // Extract global information
    const semesters = PdfTextProcessor.extractSemesters(cleanedText);
    const academicYear = PdfTextProcessor.extractAcademicYear(cleanedText);
    const course = PdfTextProcessor.extractCourse(cleanedText);
    const regulation = PdfTextProcessor.extractRegulation(cleanedText);
    
    console.log('Extracted metadata:', { semesters, academicYear, course, regulation });
    
    // Identify section boundaries
    const sections = PdfTextProcessor.identifySections(cleanedText);
    
    // Extract registration numbers first
    const regNumbers = PdfTextProcessor.extractRegistrationNumbers(cleanedText);
    console.log(`Found ${regNumbers.length} registration numbers`);

    // Process each semester found
    for (const semester of semesters) {
      console.log(`Processing semester ${semester}`);
      
      // Process arrear results
      if (sections.arrear.start !== -1) {
        const arrearResults = this.processSection(
          lines.slice(sections.arrear.start, sections.arrear.end + 1),
          semester,
          'arrear',
          { academicYear, course, regulation }
        );
        results.push(...arrearResults);
      }

      // Process current results
      if (sections.current.start !== -1) {
        const currentResults = this.processSection(
          lines.slice(sections.current.start, sections.current.end + 1),
          semester,
          'current',
          { academicYear, course, regulation }
        );
        results.push(...currentResults);
      }

      // If sections are not clearly identified, process the entire text
      if (sections.arrear.start === -1 && sections.current.start === -1) {
        console.log('No clear sections found, processing entire text');
        const allResults = this.processSection(
          lines,
          semester,
          'current', // Default to current
          { academicYear, course, regulation }
        );
        results.push(...allResults);
      }
    }

    // Remove duplicates and validate results
    const uniqueResults = this.removeDuplicates(results);
    console.log(`Processed ${uniqueResults.length} unique student records`);

    return uniqueResults;
  }

  /**
   * Process a specific section (arrear or current)
   * @param {Array} lines - Lines to process
   * @param {number} semester - Semester number
   * @param {string} type - Section type ('arrear' or 'current')
   * @param {Object} metadata - Additional metadata
   * @returns {Array} Array of student records
   */
  static processSection(lines, semester, type, metadata) {
    const results = [];
    const sectionText = lines.join('\n');
    
    // Extract registration numbers from this section
    const regNumbers = PdfTextProcessor.extractRegistrationNumbers(sectionText);
    
    for (const regNo of regNumbers) {
      // Extract student name
      const name = PdfTextProcessor.extractStudentName(sectionText, regNo);
      
      if (!name) {
        console.log(`Could not extract name for registration number: ${regNo}`);
        continue;
      }

      // Extract subjects and grades for this student
      const studentPattern = new RegExp(`${regNo}[\\s\\S]*?(?=${regNumbers[regNumbers.indexOf(regNo) + 1]}|$)`, 'i');
      const studentMatch = sectionText.match(studentPattern);
      
      if (studentMatch) {
        const studentText = studentMatch[0];
        const subjects = PdfTextProcessor.extractSubjectsAndGrades(studentText);
        
        if (subjects.length > 0) {
          const studentRecord = {
            reg_no: regNo,
            name: name,
            semester: semester,
            type: type,
            subjects: subjects,
            // Additional metadata
            ...(metadata.academicYear && { batch: metadata.academicYear }),
            ...(metadata.course && { course: metadata.course }),
            ...(metadata.regulation && { regulation: metadata.regulation })
          };

          results.push(studentRecord);
          console.log(`Processed ${name} (${regNo}) - ${subjects.length} subjects`);
        }
      }
    }

    return results;
  }

  /**
   * Remove duplicate records
   * @param {Array} results - Array of results
   * @returns {Array} Array without duplicates
   */
  static removeDuplicates(results) {
    const seen = new Set();
    return results.filter(record => {
      const key = `${record.reg_no}-${record.semester}-${record.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Enhanced data validation and cleaning
   * @param {Array} data - Raw parsed data
   * @returns {Array} Validated and cleaned data
   */
  static validateAndCleanData(data) {
    return data.filter(record => {
      // Validate required fields
      if (!record.reg_no || !record.name || !record.semester || !record.type) {
        console.log(`Invalid record missing required fields:`, record);
        return false;
      }

      // Validate semester range
      if (record.semester < 1 || record.semester > 8) {
        console.log(`Invalid semester: ${record.semester}`);
        return false;
      }

      // Validate type
      if (!['arrear', 'current'].includes(record.type)) {
        console.log(`Invalid type: ${record.type}`);
        return false;
      }

      // Validate subjects
      if (!Array.isArray(record.subjects) || record.subjects.length === 0) {
        console.log(`No valid subjects for: ${record.reg_no}`);
        return false;
      }

      // Clean and validate subjects
      record.subjects = record.subjects.filter(subject => 
        PdfTextProcessor.isValidSubjectCode(subject.code) && 
        PdfTextProcessor.isValidGrade(subject.grade)
      );

      return record.subjects.length > 0;
    });
  }

  /**
   * Save structured data to MongoDB
   * @param {Array} data - Structured result data
   * @param {string} fileName - Original PDF filename
   * @param {string} userId - ID of user who uploaded the file
   * @returns {Array} Array of saved records
   */
  static async saveToDatabase(data, fileName, userId) {
    const savedResults = [];

    for (const record of data) {
      try {
        // Check if record already exists
        const existingRecord = await PdfResult.findOne({
          reg_no: record.reg_no,
          semester: record.semester,
          type: record.type
        });

        if (existingRecord) {
          console.log(`Record already exists for ${record.reg_no} - Semester ${record.semester} (${record.type})`);
          continue;
        }

        // Create new record
        const newResult = new PdfResult({
          ...record,
          originalFileName: fileName,
          uploadedBy: userId
        });

        const saved = await newResult.save();
        savedResults.push(saved);

      } catch (error) {
        console.error(`Error saving record for ${record.reg_no}:`, error.message);
      }
    }

    return savedResults;
  }

  /**
   * Generate Excel files for each semester
   * @param {Array} data - Structured result data
   * @param {string} fileName - Original filename
   * @returns {Object} Object containing paths to generated Excel files
   */
  static async generateExcelFiles(data, fileName) {
    const outputDir = path.join(process.cwd(), 'backend', 'outputs', 'excel');
    await fs.ensureDir(outputDir);

    const excelFiles = {};
    
    // Group data by semester
    const groupedBySemester = data.reduce((acc, record) => {
      if (!acc[record.semester]) {
        acc[record.semester] = [];
      }
      acc[record.semester].push(record);
      return acc;
    }, {});

    // Generate Excel file for each semester
    for (const [semester, records] of Object.entries(groupedBySemester)) {
      const workbook = XLSX.utils.book_new();

      // Separate arrear and current records
      const arrearRecords = records.filter(r => r.type === 'arrear');
      const currentRecords = records.filter(r => r.type === 'current');

      // Create arrear worksheet
      if (arrearRecords.length > 0) {
        const arrearData = PdfProcessingController.flattenDataForExcel(arrearRecords);
        const arrearWs = XLSX.utils.json_to_sheet(arrearData);
        XLSX.utils.book_append_sheet(workbook, arrearWs, 'Arrear Results');
      }

      // Create current semester worksheet
      if (currentRecords.length > 0) {
        const currentData = PdfProcessingController.flattenDataForExcel(currentRecords);
        const currentWs = XLSX.utils.json_to_sheet(currentData);
        XLSX.utils.book_append_sheet(workbook, currentWs, 'Current Results');
      }

      // Save Excel file
      const timestamp = Date.now();
      const excelFileName = `Semester_${semester}_${timestamp}_${fileName.replace('.pdf', '.xlsx')}`;
      const excelPath = path.join(outputDir, excelFileName);
      
      XLSX.writeFile(workbook, excelPath);
      excelFiles[`semester_${semester}`] = excelPath;
    }

    return excelFiles;
  }

  /**
   * Flatten nested subject data for Excel export
   * @param {Array} records - Student records
   * @returns {Array} Flattened data for Excel
   */
  static flattenDataForExcel(records) {
    const flattened = [];

    for (const record of records) {
      // Get all unique subject codes
      const subjectCodes = [...new Set(record.subjects.map(s => s.code))].sort();

      const flatRecord = {
        'Registration Number': record.reg_no,
        'Student Name': record.name,
        'Semester': record.semester,
        'Type': record.type,
        'Total Subjects': record.subjects.length
      };

      // Add each subject as a separate column
      subjectCodes.forEach(code => {
        const subject = record.subjects.find(s => s.code === code);
        flatRecord[code] = subject ? subject.grade : '';
      });

      flattened.push(flatRecord);
    }

    return flattened;
  }

  /**
   * Generate summary statistics
   * @param {Array} data - Processed result data
   * @returns {Object} Summary statistics
   */
  static generateSummary(data) {
    const summary = {
      totalRecords: data.length,
      semesterBreakdown: {},
      typeBreakdown: { arrear: 0, current: 0 },
      studentCount: new Set(data.map(r => r.reg_no)).size
    };

    data.forEach(record => {
      // Semester breakdown
      if (!summary.semesterBreakdown[record.semester]) {
        summary.semesterBreakdown[record.semester] = { arrear: 0, current: 0 };
      }
      summary.semesterBreakdown[record.semester][record.type]++;

      // Type breakdown
      summary.typeBreakdown[record.type]++;
    });

    return summary;
  }

  /**
   * Get processing history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProcessingHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const results = await PdfResult.find({ uploadedBy: req.user.id })
        .sort({ processingDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'name email');

      const total = await PdfResult.countDocuments({ uploadedBy: req.user.id });

      return res.status(200).json({
        success: true,
        data: {
          results,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get Processing History Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve processing history',
        error: error.message
      });
    }
  }

  /**
   * Get results by registration number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getResultsByRegNo(req, res) {
    try {
      const { regNo } = req.params;
      
      if (!regNo) {
        return res.status(400).json({
          success: false,
          message: 'Registration number is required'
        });
      }

      const results = await PdfResult.findByRegNo(regNo);
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No results found for this registration number'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          regNo: regNo.toUpperCase(),
          studentName: results[0].name,
          totalRecords: results.length,
          results: results
        }
      });

    } catch (error) {
      console.error('Get Results by RegNo Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve results',
        error: error.message
      });
    }
  }

  /**
   * Get results by semester
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getResultsBySemester(req, res) {
    try {
      const { semester } = req.params;
      const { type } = req.query;

      if (!semester || isNaN(semester)) {
        return res.status(400).json({
          success: false,
          message: 'Valid semester number is required'
        });
      }

      const results = await PdfResult.findBySemester(parseInt(semester), type);
      const statistics = await PdfResult.getResultStatistics(parseInt(semester));

      return res.status(200).json({
        success: true,
        data: {
          semester: parseInt(semester),
          type: type || 'all',
          totalRecords: results.length,
          statistics,
          results
        }
      });

    } catch (error) {
      console.error('Get Results by Semester Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester results',
        error: error.message
      });
    }
  }

  /**
   * Get AI service status and configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAIServiceStatus(req, res) {
    try {
      const status = groqAIService.getServiceStatus();
      
      return res.status(200).json({
        success: true,
        message: 'AI service status retrieved',
        data: {
          ...status,
          capabilities: {
            intelligentParsing: status.available,
            multiFormatSupport: status.available,
            contextualExtraction: status.available,
            errorRecovery: true // Always available with fallback
          },
          recommendations: status.available ? 
            ['AI parsing provides higher accuracy', 'Handles various PDF formats better'] :
            ['Consider adding GROQ_API_KEY for enhanced parsing', 'Traditional parsing still available']
        }
      });

    } catch (error) {
      console.error('Get AI Service Status Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve AI service status',
        error: error.message
      });
    }
  }

  /**
   * Intelligent parsing using AI + traditional methods with fallback
   * @param {string} text - Raw text extracted from PDF
   * @returns {Promise<Object>} Parse result with method and confidence info
   */
  static async intelligentParseData(text) {
    console.log('Starting intelligent PDF parsing...');
    
    // Check AI service availability
    const aiStatus = groqAIService.getServiceStatus();
    console.log('AI Service Status:', aiStatus);

    let parseResult = {
      method: 'traditional',
      confidence: 'medium',
      results: [],
      aiAttempted: false,
      fallbackUsed: false
    };

    // Try AI parsing first if available
    if (groqAIService.isAvailable()) {
      try {
        console.log('Attempting AI-powered parsing with Groq...');
        parseResult.aiAttempted = true;
        
        const aiResults = await groqAIService.parseWithAI(text);
        
        if (aiResults && aiResults.length > 0) {
          console.log(`AI parsing successful: ${aiResults.length} records extracted`);
          parseResult.method = 'ai';
          parseResult.confidence = 'high';
          parseResult.results = aiResults;
          return parseResult;
        } else {
          console.log('AI parsing returned no results, falling back to traditional parsing');
        }
      } catch (error) {
        console.warn('AI parsing failed:', error.message);
        parseResult.fallbackUsed = true;
      }
    } else {
      console.log('AI service not available, using traditional parsing');
    }

    // Fallback to traditional parsing
    console.log('Using traditional pattern-based parsing...');
    try {
      const traditionalResults = await PdfProcessingController.parseResultData(text);
      parseResult.results = traditionalResults;
      parseResult.confidence = parseResult.aiAttempted ? 'medium' : 'low';
      
      console.log(`Traditional parsing completed: ${traditionalResults.length} records found`);
    } catch (error) {
      console.error('Traditional parsing also failed:', error.message);
      throw new Error(`Both AI and traditional parsing failed: ${error.message}`);
    }

    return parseResult;
  }

  /**
   * Extract text from PDF buffer using available libraries with fallback
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractTextFromPdf(buffer) {
    let extractedText = '';

    // Try pdf-parse first
    if (pdfParse) {
      try {
        console.log('Attempting PDF extraction with pdf-parse...');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        console.log('Successfully extracted text with pdf-parse');
        return extractedText;
      } catch (error) {
        console.warn('pdf-parse extraction failed:', error.message);
      }
    }

    // Fallback to pdf2json
    if (PDFParser) {
      try {
        console.log('Attempting PDF extraction with pdf2json...');
        extractedText = await PdfProcessingController.extractWithPdf2json(buffer);
        console.log('Successfully extracted text with pdf2json');
        return extractedText;
      } catch (error) {
        console.warn('pdf2json extraction failed:', error.message);
      }
    }

    // If both fail, provide fallback
    throw new Error('No PDF parsing library available. Please install pdf-parse or pdf2json.');
  }

  /**
   * Extract text using pdf2json library
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractWithPdf2json(buffer) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          let text = '';
          
          // Extract text from all pages
          if (pdfData.formImage && pdfData.formImage.Pages) {
            pdfData.formImage.Pages.forEach(page => {
              if (page.Texts) {
                page.Texts.forEach(textObj => {
                  if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                    text += decodeURIComponent(textObj.R[0].T) + ' ';
                  }
                });
              }
            });
          }
          
          resolve(text.trim());
        } catch (error) {
          reject(new Error('Failed to parse PDF data: ' + error.message));
        }
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
  }
}

export default PdfProcessingController;

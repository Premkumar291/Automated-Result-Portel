import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFParser from 'pdf2json';
import Tesseract from 'tesseract.js';
import Result from '../models/result.model.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/results';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// PDF parsing utilities using pdf2json as primary method
const extractTextWithPdf2json = async (filePath) => {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser(null, 1);
    
    pdfParser.on('pdfParser_dataError', (errData) => {
      console.error('PDF2JSON extraction failed:', errData.parserError);
      resolve(null);
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        // Extract text content from PDF2JSON data
        let extractedText = '';
        
        if (pdfData && pdfData.Pages) {
          pdfData.Pages.forEach(page => {
            if (page.Texts) {
              page.Texts.forEach(textItem => {
                if (textItem.R) {
                  textItem.R.forEach(textRun => {
                    if (textRun.T) {
                      // Decode the text and add spacing
                      extractedText += decodeURIComponent(textRun.T) + ' ';
                    }
                  });
                }
                extractedText += '\n'; // Add line break after each text item
              });
            }
          });
        }
        
        // Fallback to getRawTextContent if above method doesn't work
        if (!extractedText.trim()) {
          extractedText = pdfParser.getRawTextContent();
        }
        
        resolve(extractedText.trim());
      } catch (error) {
        console.error('PDF2JSON text extraction failed:', error);
        resolve(null);
      }
    });
    
    pdfParser.loadPDF(filePath);
  });
};

const extractStructuredDataWithPdf2json = async (filePath) => {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser(null, 1);
    
    pdfParser.on('pdfParser_dataError', (errData) => {
      console.error('PDF2JSON structured extraction failed:', errData.parserError);
      resolve(null);
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const structuredData = {
          text: '',
          tables: [],
          metadata: {}
        };
        
        if (pdfData && pdfData.Pages) {
          pdfData.Pages.forEach((page, pageIndex) => {
            const pageText = [];
            const pageRows = [];
            
            if (page.Texts) {
              // Group texts by Y coordinate (rows)
              const textByY = {};
              
              page.Texts.forEach(textItem => {
                const y = Math.round(textItem.y * 100); // Round to group nearby texts
                if (!textByY[y]) textByY[y] = [];
                
                if (textItem.R) {
                  textItem.R.forEach(textRun => {
                    if (textRun.T) {
                      textByY[y].push({
                        x: textItem.x,
                        text: decodeURIComponent(textRun.T)
                      });
                    }
                  });
                }
              });
              
              // Sort by Y coordinate and create rows
              Object.keys(textByY)
                .sort((a, b) => parseFloat(a) - parseFloat(b))
                .forEach(y => {
                  const rowTexts = textByY[y]
                    .sort((a, b) => a.x - b.x)
                    .map(item => item.text);
                  
                  const rowText = rowTexts.join(' ').trim();
                  if (rowText) {
                    pageText.push(rowText);
                    pageRows.push(rowTexts);
                  }
                });
            }
            
            structuredData.text += pageText.join('\n') + '\n';
            if (pageRows.length > 0) {
              structuredData.tables.push({
                page: pageIndex + 1,
                rows: pageRows
              });
            }
          });
        }
        
        resolve(structuredData);
      } catch (error) {
        console.error('PDF2JSON structured extraction failed:', error);
        resolve(null);
      }
    });
    
    pdfParser.loadPDF(filePath);
  });
};

const extractTextWithOCR = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return null;
  }
};

// Parse result data from extracted text
// Enhanced parsing function for structured data from pdf2json
const parseStructuredResultData = (structuredData, originalFileName) => {
  const results = [];
  
  if (!structuredData || (!structuredData.text && !structuredData.tables)) {
    return results;
  }
  
  const text = structuredData.text || '';
  
  // Enhanced patterns for different result formats
  const patterns = {
    // More flexible patterns for tabular data
    table: [
      // Pattern 1: Roll Number, Name, Marks/Grade (with optional subjects)
      /(\d{2,15})\s+([A-Za-z][A-Za-z\s.]{2,30})\s+(\d{1,3}|[A-F][+-]?|ABSENT|ABS|PASS|FAIL)/gi,
      // Pattern 2: With semester/year info
      /(\d{2,15})\s+([A-Za-z][A-Za-z\s.]{2,30})\s+(?:SEM|SEMESTER|YEAR)?\s*(\d+)?\s+(\d{1,3}|[A-F][+-]?|ABSENT|ABS)/gi,
      // Pattern 3: Simple format
      /(\d{2,15})\s+([A-Za-z\s.]{3,}?)\s+(\d{1,3})/gi
    ],
    
    // More comprehensive metadata patterns
    course: /(?:course|program|branch|department|dept|stream)[\s:]*([A-Za-z\s&.-]+?)(?:\n|semester|year|batch|regulation|$)/i,
    subject: /(?:subject|paper|course name|subject name)[\s:]*([A-Za-z\s&.-]+?)(?:\n|semester|year|batch|regulation|$)/i,
    semester: /(?:semester|sem|term)[\s:]*(\d+|[IVX]+|one|two|three|four|five|six|seven|eight)/i,
    batch: /(?:batch|year|session|academic year)[\s:]*(\d{4}[-–]\d{4}|\d{4})/i,
    regulation: /(?:regulation|scheme|syllabus)[\s:]*([A-Za-z0-9\s.-]+?)(?:\n|semester|year|batch|$)/i,
    examType: /(?:examination|exam type|exam)[\s:]*([A-Za-z\s.-]+?)(?:\n|semester|year|batch|$)/i
  };

  // Extract metadata with better error handling
  const extractMetadata = (text) => {
    const courseMatch = text.match(patterns.course);
    const subjectMatch = text.match(patterns.subject);
    const semesterMatch = text.match(patterns.semester);
    const batchMatch = text.match(patterns.batch);
    const regulationMatch = text.match(patterns.regulation);
    const examTypeMatch = text.match(patterns.examType);

    return {
      course: courseMatch ? courseMatch[1].trim().replace(/\s+/g, ' ') : 'Unknown',
      subject: subjectMatch ? subjectMatch[1].trim().replace(/\s+/g, ' ') : 'Unknown',
      semester: semesterMatch ? semesterMatch[1].trim() : 'Unknown',
      batch: batchMatch ? batchMatch[1].trim() : 'Unknown',
      regulation: regulationMatch ? regulationMatch[1].trim().replace(/\s+/g, ' ') : 'Unknown',
      examType: examTypeMatch ? examTypeMatch[1].trim().replace(/\s+/g, ' ') : 'Regular'
    };
  };

  const metadata = extractMetadata(text);

  // Function to parse marks/grades
  const parseMarkOrGrade = (markOrGrade) => {
    let marks = null;
    let grade = null;
    let status = 'Pass';

    const cleanMark = markOrGrade.trim().toUpperCase();

    // Check if it's a number (marks)
    if (/^\d+$/.test(cleanMark)) {
      marks = parseInt(cleanMark);
      status = marks >= 35 ? 'Pass' : 'Fail';
    }
    // Check if it's a grade
    else if (/^[A-F][+-]?$/.test(cleanMark)) {
      grade = cleanMark;
      status = ['F', 'F+', 'F-'].includes(cleanMark) ? 'Fail' : 'Pass';
    }
    // Check for absent
    else if (/^(ABSENT|ABS|AB)$/.test(cleanMark)) {
      status = 'Absent';
    }
    // Check for pass/fail
    else if (/^(PASS|P)$/.test(cleanMark)) {
      status = 'Pass';
    }
    else if (/^(FAIL|F)$/.test(cleanMark)) {
      status = 'Fail';
    }

    return { marks, grade, status };
  };

  // Try to extract from structured tables first
  if (structuredData.tables && structuredData.tables.length > 0) {
    structuredData.tables.forEach(table => {
      table.rows.forEach(row => {
        if (row.length >= 3) {
          const potentialRoll = row[0]?.trim();
          const potentialName = row[1]?.trim();
          const potentialResult = row[row.length - 1]?.trim(); // Last column is usually the result
          
          // Validate if this looks like a result row
          if (potentialRoll && /^\d{2,15}$/.test(potentialRoll) && 
              potentialName && potentialName.length > 2 &&
              potentialResult) {
            
            const { marks, grade, status } = parseMarkOrGrade(potentialResult);
            
            results.push({
              ...metadata,
              rollNumber: potentialRoll,
              studentName: potentialName,
              marks,
              grade,
              status,
              originalFileName
            });
          }
        }
      });
    });
  }

  // If no results from structured tables, try pattern matching on text
  if (results.length === 0) {
    patterns.table.forEach(pattern => {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(text)) !== null) {
        const rollNumber = match[1].trim();
        const studentName = match[2].trim();
        const markOrGrade = match[match.length - 1].trim(); // Last capture group

        // Validate the extracted data
        if (rollNumber.length >= 2 && studentName.length > 2) {
          const { marks, grade, status } = parseMarkOrGrade(markOrGrade);

          results.push({
            ...metadata,
            rollNumber,
            studentName: studentName.replace(/\s+/g, ' ').trim(),
            marks,
            grade,
            status,
            originalFileName
          });
        }
      }
    });
  }

  // Remove duplicates based on roll number
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.rollNumber === result.rollNumber)
  );

  return uniqueResults;
};

// Fallback parsing function for simple text
const parseResultData = (text, originalFileName) => {
  const structuredData = { text, tables: [] };
  return parseStructuredResultData(structuredData, originalFileName);
};

// Check for duplicates
const checkDuplicates = async (resultData) => {
  const duplicates = [];
  const newResults = [];

  for (const result of resultData) {
    const existing = await Result.findOne({
      course: result.course,
      subject: result.subject,
      semester: result.semester,
      batch: result.batch,
      rollNumber: result.rollNumber
    }).maxTimeMS(5000);

    if (existing) {
      duplicates.push({
        rollNumber: result.rollNumber,
        studentName: result.studentName,
        existingUploadDate: existing.uploadDate
      });
    } else {
      newResults.push(result);
    }
  }

  return { duplicates, newResults };
};

// Main upload controller
export const uploadResultPDF = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Step 1: Extract data using pdf2json (primary method)
    console.log('Extracting PDF data with pdf2json...');
    let structuredData = await extractStructuredDataWithPdf2json(filePath);
    
    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      console.log('Structured extraction failed, trying simple text extraction...');
      const extractedText = await extractTextWithPdf2json(filePath);
      
      if (extractedText && extractedText.trim().length >= 50) {
        structuredData = { text: extractedText, tables: [] };
      }
    }
    
    // Fallback to OCR if pdf2json fails
    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      console.log('PDF2JSON failed, trying OCR as fallback...');
      const extractedText = await extractTextWithOCR(filePath);
      
      if (extractedText && extractedText.trim().length >= 50) {
        structuredData = { text: extractedText, tables: [] };
      }
    }

    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unable to extract readable text from PDF. Please ensure the PDF contains clear, readable content.'
      });
    }

    // Step 2: Parse result data using structured approach
    const resultData = parseStructuredResultData(structuredData, fileName);
    
    if (resultData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No valid result data found in the PDF. Please check the format.'
      });
    }

    // Step 3: Check for duplicates
    const { duplicates, newResults } = await checkDuplicates(resultData);

    // Step 4: Save new results
    const savedResults = [];
    if (newResults.length > 0) {
      for (const result of newResults) {
        const newResult = new Result({
          ...result,
          uploadedBy: req.user.userId,
          processingStatus: 'Completed'
        });
        const saved = await newResult.save({ maxTimeMS: 10000 });
        savedResults.push(saved);
      }
    }

    // Step 5: Clean up uploaded file
    fs.unlinkSync(filePath);

    // Step 6: Send response
    res.status(200).json({
      success: true,
      message: 'PDF processed successfully',
      data: {
        totalProcessed: resultData.length,
        newResults: savedResults.length,
        duplicates: duplicates.length,
        duplicateDetails: duplicates,
        results: savedResults
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate result data detected',
        error: 'Some results already exist in the database'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during PDF processing',
      error: error.message
    });
  }
};

// Get uploaded results
export const getResults = async (req, res) => {
  try {
    console.log('getResults called, req.user:', req.user);
    console.log('getResults called, req.userId:', req.userId);
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      console.error('Authentication check failed:', {
        hasReqUser: !!req.user,
        reqUser: req.user,
        hasUserId: !!(req.user && req.user.userId)
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required - req.user.userId is missing'
      });
    }

    const { page = 1, limit = 10, course, semester, batch } = req.query;
    
    const filter = { uploadedBy: req.user.userId };
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (batch) filter.batch = batch;

    const results = await Result.find(filter)
      .sort({ uploadDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .maxTimeMS(10000)
      .exec();

    const total = await Result.countDocuments(filter).maxTimeMS(5000);

    res.status(200).json({
      success: true,
      data: {
        results,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// Delete results
export const deleteResults = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { resultIds } = req.body;
    
    if (!resultIds || !Array.isArray(resultIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result IDs provided'
      });
    }

    const deletedResults = await Result.deleteMany({
      _id: { $in: resultIds },
      uploadedBy: req.user.userId
    });

    res.status(200).json({
      success: true,
      message: `${deletedResults.deletedCount} results deleted successfully`,
      deletedCount: deletedResults.deletedCount
    });
  } catch (error) {
    console.error('Delete results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting results',
      error: error.message
    });
  }
};

// Test endpoint to verify pdf2json functionality
export const testPdfProcessing = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded for testing' 
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`Testing PDF processing for file: ${fileName}`);

    // Extract structured data with pdf2json
    const structuredData = await extractStructuredDataWithPdf2json(filePath);
    
    // Extract simple text with pdf2json
    const simpleText = await extractTextWithPdf2json(filePath);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'PDF processing test completed',
      data: {
        fileName,
        structuredData: {
          textLength: structuredData?.text?.length || 0,
          tablesFound: structuredData?.tables?.length || 0,
          firstFewLines: structuredData?.text?.split('\n').slice(0, 10) || [],
          sampleTable: structuredData?.tables?.[0] || null
        },
        simpleText: {
          textLength: simpleText?.length || 0,
          firstFewLines: simpleText?.split('\n').slice(0, 10) || []
        }
      }
    });

  } catch (error) {
    console.error('Test PDF processing error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Test PDF processing failed',
      error: error.message
    });
  }
};

// New function to reconstruct content into clean tabular format
const reconstructTabularData = (structuredData, originalFileName) => {
  const result = {
    success: false,
    data: {
      headers: [],
      rows: [],
      metadata: {
        totalRows: 0,
        detectedFormat: 'unknown',
        confidence: 0,
        ambiguousRows: [],
        errors: []
      },
      rawTables: structuredData.tables || []
    }
  };

  if (!structuredData || (!structuredData.text && !structuredData.tables)) {
    result.data.errors.push('No structured data available');
    return result;
  }

  // Try to extract from structured tables first
  if (structuredData.tables && structuredData.tables.length > 0) {
    const tabularResult = extractFromStructuredTables(structuredData.tables);
    if (tabularResult.success) {
      return tabularResult;
    }
  }

  // Fallback to text analysis
  return extractFromTextContent(structuredData.text, originalFileName);
};

const extractFromStructuredTables = (tables) => {
  const result = {
    success: false,
    data: {
      headers: [],
      rows: [],
      metadata: {
        totalRows: 0,
        detectedFormat: 'structured_table',
        confidence: 0,
        ambiguousRows: [],
        errors: []
      }
    }
  };

  try {
    // Find the table with the most consistent structure
    let bestTable = null;
    let maxConsistency = 0;

    for (const table of tables) {
      if (!table.rows || table.rows.length < 2) continue;
      
      const consistency = calculateTableConsistency(table.rows);
      if (consistency > maxConsistency) {
        maxConsistency = consistency;
        bestTable = table;
      }
    }

    if (!bestTable || maxConsistency < 0.3) {
      result.data.errors.push('No consistent table structure found');
      return result;
    }

    // Extract headers and data
    const { headers, dataRows, confidence } = processTableStructure(bestTable.rows);
    
    result.success = true;
    result.data.headers = headers;
    result.data.rows = dataRows;
    result.data.metadata.totalRows = dataRows.length;
    result.data.metadata.confidence = confidence;

    return result;

  } catch (error) {
    result.data.errors.push(`Table processing error: ${error.message}`);
    return result;
  }
};

const extractFromTextContent = (text, originalFileName) => {
  const result = {
    success: false,
    data: {
      headers: [],
      rows: [],
      metadata: {
        totalRows: 0,
        detectedFormat: 'text_analysis',
        confidence: 0,
        ambiguousRows: [],
        errors: []
      }
    }
  };

  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Detect common header patterns
    const headerPatterns = [
      /(?:roll\s*no|roll\s*number|reg\s*no|registration|student\s*id)/i,
      /(?:name|student\s*name)/i,
      /(?:marks|grade|score|result|cgpa|gpa)/i,
      /(?:subject|course|paper)/i,
      /(?:semester|sem|year)/i,
      /(?:batch|class|section)/i
    ];

    let headerLine = null;
    let headerIndex = -1;

    // Find potential header line
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      let matchCount = 0;
      
      for (const pattern of headerPatterns) {
        if (pattern.test(line)) {
          matchCount++;
        }
      }
      
      if (matchCount >= 2) { // At least 2 header patterns match
        headerLine = line;
        headerIndex = i;
        break;
      }
    }

    // Extract headers
    let headers = [];
    if (headerLine) {
      headers = parseHeaderLine(headerLine);
    } else {
      // Default headers based on common patterns
      headers = detectDefaultHeaders(lines);
    }

    // Extract data rows
    const dataStartIndex = headerIndex >= 0 ? headerIndex + 1 : 0;
    const dataRows = [];
    const ambiguousRows = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      const parsedRow = parseDataLine(line, headers);
      
      if (parsedRow.isValid) {
        dataRows.push(parsedRow.data);
      } else if (parsedRow.isAmbiguous) {
        ambiguousRows.push({
          lineNumber: i + 1,
          content: line,
          issues: parsedRow.issues
        });
      }
    }

    // Calculate confidence based on successful parsing
    const confidence = dataRows.length > 0 ? 
      (dataRows.length / (dataRows.length + ambiguousRows.length)) : 0;

    result.success = dataRows.length > 0;
    result.data.headers = headers;
    result.data.rows = dataRows;
    result.data.metadata.totalRows = dataRows.length;
    result.data.metadata.confidence = confidence;
    result.data.metadata.ambiguousRows = ambiguousRows;

    return result;

  } catch (error) {
    result.data.errors.push(`Text processing error: ${error.message}`);
    return result;
  }
};

const calculateTableConsistency = (rows) => {
  if (rows.length < 2) return 0;
  
  const columnCounts = rows.map(row => Array.isArray(row) ? row.length : 0);
  const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
  
  // Calculate how consistent the column count is
  const variance = columnCounts.reduce((sum, count) => 
    sum + Math.pow(count - avgColumns, 2), 0) / columnCounts.length;
  
  return Math.max(0, 1 - (variance / avgColumns));
};

const processTableStructure = (rows) => {
  // Assume first row is headers
  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  
  // Clean and standardize headers
  const headers = Array.isArray(headerRow) ? 
    headerRow.map(header => cleanHeaderText(header)) : 
    ['Column 1', 'Column 2', 'Column 3'];

  // Process data rows
  const processedRows = dataRows.map((row, index) => {
    const rowData = {};
    if (Array.isArray(row)) {
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex] || '';
      });
    }
    return rowData;
  });

  return {
    headers,
    dataRows: processedRows,
    confidence: 0.8 // High confidence for structured tables
  };
};

const parseHeaderLine = (line) => {
  // Split by common delimiters and clean
  const headers = line.split(/[\s]{2,}|\t|,|\|/)
    .map(header => cleanHeaderText(header))
    .filter(header => header.length > 0);
  
  return headers.length > 0 ? headers : ['Roll No', 'Name', 'Marks'];
};

const detectDefaultHeaders = (lines) => {
  // Analyze first few data lines to infer headers
  const sampleLines = lines.slice(0, 5);
  const columnPatterns = [];
  
  for (const line of sampleLines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      // Detect if first column looks like roll number
      if (/^\d+$/.test(parts[0])) {
        columnPatterns.push(['Roll No', 'Name']);
        if (parts.length >= 3 && /^\d+$/.test(parts[parts.length - 1])) {
          columnPatterns.push('Marks');
        }
        break;
      }
    }
  }
  
  return columnPatterns.length > 0 ? columnPatterns.flat() : ['Roll No', 'Name', 'Marks'];
};

const parseDataLine = (line, headers) => {
  const result = {
    isValid: false,
    isAmbiguous: false,
    data: {},
    issues: []
  };

  try {
    // Split line into parts
    const parts = line.split(/\s+/).filter(part => part.length > 0);
    
    if (parts.length === 0) {
      return result;
    }

    // Check if this looks like a data row
    const hasNumber = parts.some(part => /\d/.test(part));
    const hasText = parts.some(part => /[a-zA-Z]/.test(part));
    
    if (!hasNumber && !hasText) {
      return result;
    }

    // Try to map parts to headers
    const rowData = {};
    let confidence = 0;

    // Smart mapping based on content patterns
    if (headers.length > 0) {
      if (parts.length >= headers.length) {
        // Direct mapping
        headers.forEach((header, index) => {
          rowData[header] = parts[index] || '';
        });
        confidence = 1;
      } else if (parts.length === 2 && headers.length >= 2) {
        // Assume first part is ID/Roll No, second is Name or Marks
        rowData[headers[0]] = parts[0];
        rowData[headers[1]] = parts[1];
        confidence = 0.7;
      } else {
        // Intelligent mapping
        const mapping = intelligentColumnMapping(parts, headers);
        Object.assign(rowData, mapping.data);
        confidence = mapping.confidence;
        result.issues = mapping.issues;
      }
    }

    // Validate the row
    if (confidence > 0.5) {
      result.isValid = true;
      result.data = rowData;
    } else if (confidence > 0.2) {
      result.isAmbiguous = true;
      result.data = rowData;
      result.issues.push('Low confidence in column mapping');
    }

    return result;

  } catch (error) {
    result.issues.push(`Parsing error: ${error.message}`);
    return result;
  }
};

const intelligentColumnMapping = (parts, headers) => {
  const result = {
    data: {},
    confidence: 0,
    issues: []
  };

  // Pattern-based mapping
  for (let i = 0; i < parts.length && i < headers.length; i++) {
    const part = parts[i];
    const header = headers[i];
    
    // Roll number detection
    if (/roll|reg|id/i.test(header) && /^\d+$/.test(part)) {
      result.data[header] = part;
      result.confidence += 0.3;
    }
    // Name detection
    else if (/name/i.test(header) && /^[a-zA-Z\s.]+$/.test(part)) {
      result.data[header] = part;
      result.confidence += 0.3;
    }
    // Marks/Grade detection
    else if (/mark|grade|score/i.test(header) && /^\d+$|^[A-F][+-]?$/.test(part)) {
      result.data[header] = part;
      result.confidence += 0.3;
    }
    // Default assignment
    else {
      result.data[header] = part;
      result.confidence += 0.1;
    }
  }

  return result;
};

const cleanHeaderText = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// New endpoint for tabular reconstruction
export const reconstructPdfTable = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Extract structured data using pdf2json
    console.log('Extracting structured data for table reconstruction...');
    let structuredData = await extractStructuredDataWithPdf2json(filePath);
    
    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      console.log('Structured extraction failed, trying simple text extraction...');
      const extractedText = await extractTextWithPdf2json(filePath);
      
      if (extractedText && extractedText.trim().length >= 50) {
        structuredData = { text: extractedText, tables: [] };
      }
    }
    
    // Fallback to OCR if pdf2json fails
    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      console.log('PDF2JSON failed, trying OCR for table reconstruction...');
      const extractedText = await extractTextWithOCR(filePath);
      
      if (extractedText && extractedText.trim().length >= 50) {
        structuredData = { text: extractedText, tables: [] };
      }
    }

    if (!structuredData || !structuredData.text || structuredData.text.trim().length < 50) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unable to extract readable content from PDF'
      });
    }

    // Reconstruct tabular data
    const tabularResult = reconstructTabularData(structuredData, fileName);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Add additional metadata
    tabularResult.data.metadata.originalFileName = fileName;
    tabularResult.data.metadata.processedAt = new Date().toISOString();
    tabularResult.data.metadata.extractionMethod = structuredData.tables && structuredData.tables.length > 0 ? 'structured' : 'text_analysis';

    res.status(200).json(tabularResult);

  } catch (error) {
    console.error('Table reconstruction error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing PDF for table reconstruction',
      error: error.message
    });
  }
};

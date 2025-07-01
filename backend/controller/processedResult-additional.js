// Additional controller functions for processedResult.controller.js

// Main upload and extract function
export const uploadAndExtractPdf = async (req, res) => {
  try {
    console.log('=== PDF UPLOAD AND EXTRACTION REQUEST ===');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`Processing file: ${fileName}`);
    console.log(`File path: ${filePath}`);
    console.log(`File size: ${req.file.size} bytes`);

    // Step 1: Extract data using pdf2json (primary method)
    console.log('Starting PDF extraction with pdf2json...');
    let extractedData = await extractPdfData(filePath);
    
    // Step 2: Fallback to OCR if pdf2json fails
    if (!extractedData || !extractedData.structuredTables || extractedData.structuredTables.length === 0) {
      console.log('PDF2JSON failed, trying OCR fallback...');
      extractedData = await extractWithOCR(filePath);
    }

    if (!extractedData) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unable to extract readable content from PDF. Please ensure the PDF contains clear, readable content.'
      });
    }

    // Step 3: Clean and structure the data
    console.log('Cleaning and structuring extracted data...');
    const structuredResult = cleanAndStructureData(extractedData);
    
    if (!structuredResult || !structuredResult.rows || structuredResult.rows.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the PDF. Please check if the PDF contains tabular data.'
      });
    }

    // Step 4: Store temporarily for user confirmation
    const tempId = Date.now().toString();
    const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes
    
    tempSessionStorage.set(tempId, {
      extractedData: structuredResult,
      fileName: fileName,
      originalFile: filePath,
      expiryTime: expiryTime
    });

    // Step 5: Clean up uploaded file
    fs.unlinkSync(filePath);

    // Step 6: Send response with extracted data
    console.log(`Extraction complete: ${structuredResult.rows.length} rows found`);
    console.log('Sample headers:', structuredResult.headers?.slice(0, 5));
    console.log('Sample row:', structuredResult.rows?.[0]?.data || structuredResult.rows?.[0]);

    res.status(200).json({
      success: true,
      message: 'PDF processed successfully',
      data: {
        tempId: tempId,
        fileName: fileName,
        extractedData: structuredResult,
        preview: {
          totalRows: structuredResult.rows.length,
          headers: structuredResult.headers,
          sampleRows: structuredResult.rows.slice(0, 10), // First 10 rows for preview
          metadata: structuredResult.metadata
        }
      }
    });

  } catch (error) {
    console.error('Upload and extraction error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during PDF processing',
      error: error.message
    });
  }
};

// Save extracted data to database or discard
export const saveExtractedData = async (req, res) => {
  try {
    const { tempId, decision } = req.body;
    
    if (!tempId) {
      return res.status(400).json({
        success: false,
        message: 'Temporary ID is required'
      });
    }

    const tempData = tempSessionStorage.get(tempId);
    if (!tempData) {
      return res.status(404).json({
        success: false,
        message: 'Data not found or has expired'
      });
    }

    if (decision === 'save') {
      // Save to database
      const processedResult = new ProcessedResult({
        ...tempData.extractedData,
        uploadedBy: req.user.userId,
        fileName: tempData.fileName,
        originalFile: tempData.originalFile,
        processingStatus: 'Saved'
      });

      await processedResult.save();
      
      // Clean up temporary storage
      tempSessionStorage.delete(tempId);

      res.status(200).json({
        success: true,
        message: 'Data saved successfully',
        data: processedResult
      });
    } else {
      // Discard data
      tempSessionStorage.delete(tempId);
      
      res.status(200).json({
        success: true,
        message: 'Data discarded successfully'
      });
    }
  } catch (error) {
    console.error('Error saving extracted data:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

// Get processed results
export const getProcessedResults = async (req, res) => {
  try {
    const results = await ProcessedResult.find({ 
      uploadedBy: req.user.userId 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching processed results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// Helper function to find header row in table data
const findHeaderRow = (rows) => {
  if (!rows || rows.length === 0) return -1;

  let bestHeaderIndex = -1;
  let bestScore = 0;

  // Check first 3 rows for header patterns
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const row = rows[i];
    const score = calculateHeaderScore(row);
    
    console.log(`Row ${i} header score: ${score.toFixed(2)} - [${row.join(', ')}]`);
    
    if (score > bestScore && score > 0.5) {
      bestScore = score;
      bestHeaderIndex = i;
    }
  }

  return bestHeaderIndex;
};

// Generate smart default headers based on data patterns
const generateSmartHeaders = (rows, maxColumns) => {
  const headers = [];
  
  // Analyze first few rows to understand data patterns
  const sampleRows = rows.slice(0, Math.min(5, rows.length));
  
  for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
    const columnData = sampleRows.map(row => row[colIndex] || '').filter(val => val.trim().length > 0);
    
    if (columnData.length === 0) {
      headers.push(`Column ${colIndex + 1}`);
      continue;
    }

    // Pattern recognition for common column types
    if (columnData.some(val => /^\d{10,}/.test(val))) {
      headers.push('Registration Number');
    } else if (columnData.some(val => /^[A-Z][a-z]+ [A-Z]/.test(val))) {
      headers.push('Student Name');
    } else if (columnData.some(val => /^[A-F][+-]?$|^(PASS|FAIL|U)$/i.test(val))) {
      headers.push('Grade');
    } else if (columnData.some(val => /^\d{3,6}$/.test(val))) {
      headers.push('Subject Code');
    } else if (columnData.some(val => /^\d+(\.\d+)?$/.test(val))) {
      headers.push('Marks');
    } else if (colIndex === 0) {
      headers.push('S.No');
    } else {
      headers.push(`Column ${colIndex + 1}`);
    }
  }

  return headers;
};

// Clean header text for better display
const cleanHeaderText = (header) => {
  if (!header) return 'Column';
  
  return header
    .toString()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'Column';
};

// Structure data from text when no tables are found
const structureFromText = (rawText) => {
  const result = {
    headers: ['Content'],
    rows: [],
    metadata: { 
      confidence: 0.3, 
      totalRows: 0,
      extractionMethod: 'text_fallback',
      issues: ['No table structure detected, displaying as text'] 
    }
  };

  if (!rawText) return result;

  // Split text into lines and create rows
  const lines = rawText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  result.rows = lines.map((line, index) => ({
    data: { 'Content': line },
    issues: [],
    originalIndex: index + 1,
    originalRow: [line],
    columnCount: 1,
    source: 'text_fallback'
  }));

  result.metadata.totalRows = result.rows.length;
  
  return result;
};

// Auto-expire temporary data
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tempSessionStorage.entries()) {
    if (value.expiryTime && value.expiryTime < now) {
      console.log(`Expiring temporary data: ${key}`);
      tempSessionStorage.delete(key);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFParser from 'pdf2json';
import ProcessedResult from '../models/processedResult.model.js';

// In-memory temporary storage (use Redis in production)
const tempSessionStorage = new Map();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/processed-results';
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

// Extract structured data from PDF using pdf2json with spatial grouping
const extractPdfData = async (filePath) => {
  return new Promise((resolve) => {
    try {
      console.log('Starting PDF extraction for:', filePath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('PDF file not found:', filePath);
        resolve(null);
        return;
      }

      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF2JSON extraction failed:', errData?.parserError || errData);
        console.error('File path:', filePath);
        resolve(null);
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          console.log('PDF2JSON data received, processing with spatial grouping...');
          
          if (!pdfData || !pdfData.Pages) {
            console.error('Invalid PDF data structure received');
            resolve(null);
            return;
          }
          
          const extractedData = {
            rawText: '',
            structuredTables: [],
            metadata: {
              pageCount: pdfData.Pages ? pdfData.Pages.length : 0,
              extractionMethod: 'pdf2json-spatial'
          }
        };

        if (pdfData && pdfData.Pages) {
          // Process each page with spatial grouping
          pdfData.Pages.forEach((page, pageIndex) => {
            console.log(`Processing page ${pageIndex + 1} with spatial grouping...`);
            
            if (page.Texts) {
              // Extract all text elements with coordinates
              const textElements = [];
              
              page.Texts.forEach(textItem => {
                if (!textItem.R || !textItem.R.length) return;
                
                textItem.R.forEach(textRun => {
                  if (textRun.T) {
                    const decodedText = decodeURIComponent(textRun.T).trim();
                    if (decodedText.length > 0) {
                      textElements.push({
                        x: textItem.x,
                        y: textItem.y,
                        text: decodedText,
                        width: textItem.w || 0,
                        height: textItem.h || 0
                      });
                    }
                  }
                });
              });
              
              console.log(`Page ${pageIndex + 1}: Found ${textElements.length} text elements`);
              
              // Apply spatial grouping to create table structure
              const tableStructure = createTableFromSpatialGrouping(textElements, pageIndex + 1);
              
              if (tableStructure && tableStructure.rows.length > 0) {
                extractedData.structuredTables.push(tableStructure);
                console.log(`Page ${pageIndex + 1}: Created table with ${tableStructure.rows.length} rows`);
              }
            }
          });
          
          // Combine all pages into a single table if multiple pages
          if (extractedData.structuredTables.length > 1) {
            const combinedTable = combineMultiPageTables(extractedData.structuredTables);
            extractedData.structuredTables = [combinedTable];
          }
        }
        
        console.log(`Spatial grouping complete: ${extractedData.structuredTables.length} tables created`);
        resolve(extractedData);
        
      } catch (error) {
        console.error('PDF spatial processing failed:', error);
        resolve(null);
      }
    });
    
    pdfParser.loadPDF(filePath);
    
  } catch (error) {
    console.error('Error setting up PDF parser:', error);
    resolve(null);
  }
  });
};

// Create table structure from spatial grouping of text elements
const createTableFromSpatialGrouping = (textElements, pageNumber) => {
  console.log(`Creating table structure for page ${pageNumber}...`);
  
  if (textElements.length === 0) return null;
  
  // Step 1: Group text elements by Y coordinate (rows) with tolerance
  const yTolerance = 1.5; // Adjust based on PDF quality
  const rowGroups = {};
  
  textElements.forEach(element => {
    let assignedY = null;
    
    // Find existing Y group within tolerance
    for (const existingY of Object.keys(rowGroups)) {
      if (Math.abs(parseFloat(existingY) - element.y) <= yTolerance) {
        assignedY = existingY;
        break;
      }
    }
    
    // Create new Y group if not found
    if (!assignedY) {
      assignedY = element.y.toString();
      rowGroups[assignedY] = [];
    }
    
    rowGroups[assignedY].push(element);
  });
  
  console.log(`Page ${pageNumber}: Grouped into ${Object.keys(rowGroups).length} rows`);
  
  // Step 2: Sort rows by Y coordinate (top to bottom)
  const sortedYs = Object.keys(rowGroups).sort((a, b) => parseFloat(a) - parseFloat(b));
  
  // Step 3: Process each row - sort by X coordinate and group into columns
  const tableRows = [];
  const allXPositions = []; // To determine consistent column boundaries
  
  sortedYs.forEach((y, rowIndex) => {
    const rowElements = rowGroups[y];
    
    // Sort elements in row by X position (left to right)
    rowElements.sort((a, b) => a.x - b.x);
    
    // Collect X positions for column analysis
    rowElements.forEach(element => {
      allXPositions.push(element.x);
    });
    
    console.log(`Row ${rowIndex}: ${rowElements.length} elements - Y=${y}`);
    rowElements.forEach((el, i) => {
      console.log(`  Element ${i}: x=${el.x.toFixed(2)}, text="${el.text}"`);
    });
  });
  
  // Step 4: Determine column boundaries based on X positions
  const columnBoundaries = determineColumnBoundaries(allXPositions);
  console.log(`Page ${pageNumber}: Determined ${columnBoundaries.length} column boundaries:`, columnBoundaries);
  
  // Step 5: Convert each row to structured columns
  sortedYs.forEach((y, rowIndex) => {
    const rowElements = rowGroups[y];
    rowElements.sort((a, b) => a.x - b.x);
    
    const structuredRow = assignElementsToColumns(rowElements, columnBoundaries);
    
    // Skip header-like rows (university info, etc.) unless they contain table headers
    if (!isSkippableHeader(structuredRow)) {
      tableRows.push({
        rowIndex: rowIndex,
        yPosition: parseFloat(y),
        columns: structuredRow,
        originalElements: rowElements.length
      });
      
      console.log(`Row ${rowIndex} structured:`, structuredRow);
    } else {
      console.log(`Row ${rowIndex} skipped (header):`, structuredRow);
    }
  });
  
  // Step 6: Identify table headers and data rows
  const { headers, dataRows } = identifyHeadersAndData(tableRows);
  
  console.log(`Page ${pageNumber} final structure:`, {
    headers: headers,
    dataRowsCount: dataRows.length
  });
  
  return {
    page: pageNumber,
    headers: headers,
    rows: dataRows,
    totalRows: dataRows.length,
    metadata: {
      originalElements: textElements.length,
      processedRows: tableRows.length,
      columnCount: headers.length
    }
  };
};

// Helper function to determine column boundaries from all X positions
const determineColumnBoundaries = (allXPositions) => {
  if (allXPositions.length === 0) return [];

  // Use a Set to get unique X positions, then sort them
  const uniqueX = [...new Set(allXPositions)].sort((a, b) => a - b);
  
  if (uniqueX.length === 0) return [];

  const boundaries = [uniqueX[0]];
  const xTolerance = 5; // Tolerance to group close X positions into a single column

  for (let i = 1; i < uniqueX.length; i++) {
    if (uniqueX[i] - boundaries[boundaries.length - 1] > xTolerance) {
      boundaries.push(uniqueX[i]);
    }
  }
  
  return boundaries;
};

// Helper function to assign text elements to the correct columns
const assignElementsToColumns = (rowElements, columnBoundaries) => {
  if (columnBoundaries.length === 0) {
    return rowElements.map(el => el.text);
  }

  const structuredRow = Array(columnBoundaries.length).fill('');
  const xTolerance = 5;

  rowElements.forEach(element => {
    let assigned = false;
    for (let i = 0; i < columnBoundaries.length; i++) {
      if (Math.abs(element.x - columnBoundaries[i]) < xTolerance) {
        structuredRow[i] = (structuredRow[i] + ' ' + element.text).trim();
        assigned = true;
        break;
      }
    }
    // If not assigned to a boundary, find the closest one
    if (!assigned) {
        const closestBoundaryIndex = columnBoundaries.reduce((closest, boundary, index) => {
            const dist = Math.abs(element.x - boundary);
            if (dist < Math.abs(element.x - columnBoundaries[closest])) {
                return index;
            }
            return closest;
        }, 0);
        structuredRow[closestBoundaryIndex] = (structuredRow[closestBoundaryIndex] + ' ' + element.text).trim();
    }
  });

  return structuredRow;
};


// Helper function to skip non-table headers
const isSkippableHeader = (structuredRow) => {
  const headerKeywords = ['anna university', 'bonafide certificate', 'provisional certificate', 'consolidated statement'];
  const rowText = structuredRow.join(' ').toLowerCase();
  return headerKeywords.some(keyword => rowText.includes(keyword));
};

// Helper function to identify headers and data rows
const identifyHeadersAndData = (tableRows) => {
    if (tableRows.length === 0) {
        return { headers: [], dataRows: [] };
    }

    let headerRowIndex = -1;
    let maxScore = 0;

    // Score each row to find the most likely header
    tableRows.forEach((row, index) => {
        const score = calculateHeaderScore(row.columns);
        if (score > maxScore) {
            maxScore = score;
            headerRowIndex = index;
        }
    });

    // A simple confidence threshold for the header
    if (maxScore > 0.5 && headerRowIndex !== -1) {
        const headers = tableRows[headerRowIndex].columns;
        const dataRows = tableRows.slice(headerRowIndex + 1).map(r => r.columns);
        return { headers, dataRows };
    }

    // If no confident header is found, assume first row is header or generate default
    if (tableRows.length > 0) {
        const potentialHeaders = tableRows[0].columns;
        // Check if the first row looks like a header
        if (calculateHeaderScore(potentialHeaders) > 0.3) {
             return { headers: potentialHeaders, dataRows: tableRows.slice(1).map(r => r.columns) };
        } else {
            // No header, all are data rows
            const generatedHeaders = Array.from({ length: tableRows[0].columns.length }, (_, i) => `Column ${i + 1}`);
            return { headers: generatedHeaders, dataRows: tableRows.map(r => r.columns) };
        }
    }
    
    return { headers: [], dataRows: [] };
};

// Helper function to combine tables from multiple pages
const combineMultiPageTables = (tables) => {
    if (!tables || tables.length === 0) return null;
    if (tables.length === 1) return tables[0];

    const combined = {
        headers: [],
        rows: [],
        page: 'combined'
    };

    // Use headers from the first page's table, assuming they are consistent
    combined.headers = tables[0].headers;

    tables.forEach(table => {
        // If subsequent pages have headers, check for consistency or skip them
        if (JSON.stringify(table.headers) !== JSON.stringify(combined.headers)) {
            // If headers are different, it might be a new table or just data rows.
            // For now, we just append all rows. A more sophisticated logic can be added here.
        }
        combined.rows.push(...table.rows);
    });

    return combined;
};

// New function to consolidate multi-page table data
const consolidateMultiPageTable = (allPageRows) => {
  console.log('Consolidating multi-page table...');
  console.log(`Total rows to consolidate: ${allPageRows.length}`);
  
  const result = {
    rows: [],
    pageBreakdown: {},
    headerInfo: {
      detectedHeaders: [],
      headerPages: [],
      confidence: 0
    }
  };
  
  // Group rows by page for analysis
  const pageGroups = {};
  allPageRows.forEach((row, index) => {
    console.log(`Row ${index} from page ${row.page}:`, row.columns);
    if (!pageGroups[row.page]) {
      pageGroups[row.page] = [];
    }
    pageGroups[row.page].push(row.columns);
  });
  
  // Analyze each page for headers and data
  const pageAnalysis = {};
  Object.keys(pageGroups).forEach(pageNum => {
    const pageRows = pageGroups[pageNum];
    pageAnalysis[pageNum] = analyzePageStructure(pageRows, parseInt(pageNum));
    
    result.pageBreakdown[pageNum] = {
      totalRows: pageRows.length,
      hasHeader: pageAnalysis[pageNum].hasHeader,
      headerRow: pageAnalysis[pageNum].headerRow,
      dataRows: pageAnalysis[pageNum].dataRows.length
    };
  });
  
  // Find the most comprehensive header (usually from first page)
  let masterHeader = null;
  let maxColumns = 0;
  
  Object.values(pageAnalysis).forEach((analysis, pageIndex) => {
    console.log(`Page ${pageIndex + 1} analysis:`, {
      hasHeader: analysis.hasHeader,
      headerRowLength: analysis.headerRow?.length || 0,
      dataRowsCount: analysis.dataRows.length
    });
    
    if (analysis.hasHeader && analysis.headerRow.length > maxColumns) {
      masterHeader = analysis.headerRow;
      maxColumns = analysis.headerRow.length;
      console.log(`New master header from page ${pageIndex + 1}:`, masterHeader);
    }
  });
  
  // If no clear header found, use the row with most columns as template
  if (!masterHeader) {
    console.log('No header found, creating default headers...');
    allPageRows.forEach((row, index) => {
      console.log(`Checking row ${index} for header template:`, row.columns);
      if (row.columns.length > maxColumns) {
        masterHeader = row.columns.map((_, index) => `Column ${index + 1}`);
        maxColumns = row.columns.length;
        console.log(`Using row ${index} as template, created headers:`, masterHeader);
      }
    });
  }
  
  console.log(`Master header (${maxColumns} columns):`, masterHeader);
  
  // Combine all data rows from all pages
  Object.keys(pageAnalysis).forEach(pageNum => {
    const analysis = pageAnalysis[pageNum];
    
    console.log(`Processing data rows from page ${pageNum}:`, analysis.dataRows.length);
    
    analysis.dataRows.forEach((row, rowIndex) => {
      console.log(`  Page ${pageNum}, Row ${rowIndex}:`, row);
      // Normalize row to match master header length
      const normalizedRow = Array.from({ length: maxColumns }, (_, i) => row[i] || '');
      console.log(`  Normalized to:`, normalizedRow);
      result.rows.push(normalizedRow);
    });
    
    console.log(`Added ${analysis.dataRows.length} data rows from page ${pageNum}`);
  });
  
  result.headerInfo.detectedHeaders = masterHeader || [];
  result.headerInfo.confidence = masterHeader ? 0.8 : 0.3;
  
  console.log(`Final consolidated table: ${result.rows.length} total rows with ${maxColumns} columns`);
  
  return result;
};

// Analyze individual page structure
const analyzePageStructure = (pageRows, pageNumber) => {
  const analysis = {
    hasHeader: false,
    headerRow: null,
    dataRows: [],
    pageNumber: pageNumber
  };
  
  if (pageRows.length === 0) return analysis;
  
  // For first page, likely to have header
  // For subsequent pages, header might be repeated or absent
  if (pageNumber === 1) {
    // First page - look for header in first few rows
    for (let i = 0; i < Math.min(3, pageRows.length); i++) {
      const row = pageRows[i];
      const headerScore = calculateHeaderScore(row);
      
      if (headerScore > 0.6) {
        analysis.hasHeader = true;
        analysis.headerRow = row;
        analysis.dataRows = pageRows.slice(i + 1);
        break;
      }
    }
    
    // If no header found, treat all as data
    if (!analysis.hasHeader) {
      analysis.dataRows = pageRows;
    }
  } else {
    // Subsequent pages - check if first row is repeated header
    const firstRow = pageRows[0];
    const firstRowText = firstRow.join('').toLowerCase();
    
    // Simple heuristic: if first row contains header-like words, skip it
    const hasHeaderWords = /roll|name|student|subject|mark|grade|score|reg|id|no/.test(firstRowText);
    const hasMainlyText = firstRow.every(cell => !/^\d+$/.test(cell.trim()));
    
    if (hasHeaderWords && hasMainlyText && pageRows.length > 1) {
      analysis.hasHeader = true;
      analysis.headerRow = firstRow;
      analysis.dataRows = pageRows.slice(1);
    } else {
      analysis.dataRows = pageRows;
    }
  }
  
  console.log(`Page ${pageNumber} analysis: Header=${analysis.hasHeader}, Data rows=${analysis.dataRows.length}`);
  
  return analysis;
};

// Calculate header likelihood score
const calculateHeaderScore = (row) => {
  let score = 0;
  const totalCells = row.length;
  
  if (totalCells === 0) return 0;
  
  for (const cell of row) {
    if (!cell) continue;
    
    const cellText = cell.toLowerCase().trim();
    
    // Header indicators
    if (cellText.match(/roll|name|student|subject|mark|grade|score|reg|id|no|sno|sl/)) {
      score += 2;
    }
    
    // Headers usually don't start with numbers
    if (!cellText.match(/^\d/)) {
      score += 1;
    }
    
    // Headers are usually shorter
    if (cellText.length < 20) {
      score += 0.5;
    }
    
    // Headers often have capital letters
    if (cellText.match(/^[A-Z]/)) {
      score += 0.5;
    }
  }
  
  return score / totalCells;
};

// Enhanced column detection function for complex table layouts
const detectColumns = (textItems) => {
  if (textItems.length === 0) {
    console.log('  No text items to process for column detection');
    return [];
  }
  
  // If only one item, return it as single column
  if (textItems.length === 1) {
    console.log('  Single text item detected:', textItems[0].text);
    return [textItems[0].text];
  }
  
  // Sort items by X position first
  const sortedItems = textItems.sort((a, b) => a.x - b.x);
  
  console.log(`  Analyzing ${textItems.length} text items for column detection...`);
  sortedItems.forEach((item, i) => {
    console.log(`    Item ${i}: x=${item.x.toFixed(2)}, text="${item.text}"`);
  });
  
  // For complex tables like exam results, use intelligent column detection
  const columns = intelligentColumnDetection(sortedItems);
  
  if (columns.length > 0) {
    console.log(`  Detected ${columns.length} columns: [${columns.join(' | ')}]`);
    return columns;
  }
  
  // Fallback to basic detection
  console.log('  Falling back to basic column detection...');
  const basicColumns = basicColumnDetection(sortedItems);
  console.log(`  Basic detection result: [${basicColumns.join(' | ')}]`);
  return basicColumns;
};

// Intelligent column detection for structured documents
const intelligentColumnDetection = (sortedItems) => {
  // Define expected column positions based on common table layouts
  const totalWidth = sortedItems[sortedItems.length - 1].x - sortedItems[0].x;
  const columns = [];
  
  // Group items by similar X positions (column alignment)
  const columnGroups = {};
  const positionTolerance = 1.5; // Reduced tolerance for better precision with exam results
  
  sortedItems.forEach(item => {
    let assigned = false;
    
    // Try to assign to existing column group
    for (const [groupX, group] of Object.entries(columnGroups)) {
      if (Math.abs(parseFloat(groupX) - item.x) <= positionTolerance) {
        group.push(item);
        assigned = true;
        break;
      }
    }
    
    // Create new column group if not assigned
    if (!assigned) {
      columnGroups[item.x.toString()] = [item];
    }
  });
  
  // Sort column groups by X position
  const sortedGroups = Object.entries(columnGroups)
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b));
  
  console.log(`  Found ${sortedGroups.length} column groups based on X positions`);
  
  // Merge text within each column group with exam result specific logic
  sortedGroups.forEach(([groupX, items], groupIndex) => {
    const groupTexts = items.map(item => item.text.trim()).filter(text => text.length > 0);
    
    console.log(`    Processing group ${groupIndex} at x=${groupX}: [${groupTexts.join(', ')}]`);
    
    if (groupTexts.length > 0) {
      let mergedText = '';
      
      // Special handling for exam result patterns
      if (groupTexts.length === 1) {
        // Single item - likely registration number, grade, or subject code
        mergedText = groupTexts[0];
      } else if (isRegistrationNumber(groupTexts.join(''))) {
        // Registration numbers should not be merged with spaces
        mergedText = groupTexts.join('');
      } else if (isStudentName(groupTexts)) {
        // Student names - merge with spaces
        mergedText = groupTexts.join(' ');
      } else if (isGradeOrMark(groupTexts)) {
        // Grades or marks - keep separate or merge based on pattern
        mergedText = smartGradeMerge(groupTexts);
      } else {
        // Default merging for other content
        mergedText = smartTextMerge(groupTexts);
      }
      
      columns.push(mergedText);
      console.log(`    Group ${groupIndex} result: "${mergedText}"`);
    } else {
      console.log(`    Group ${groupIndex} has no valid text, skipping`);
    }
  });
  
  return columns;
};

// Enhanced text pattern recognition functions
const isRegistrationNumber = (text) => {
  return /^\d{10,}/.test(text.trim()) || // Long numbers (10+ digits)
         /^[A-Z]{1,3}\d{5,}/.test(text.trim()) || // Code + numbers
         /^\d{4}[A-Z]{2}\d{4}/.test(text.trim()); // Common registration patterns
};

const isStudentName = (texts) => {
  const joinedText = texts.join(' ');
  // Check for proper name patterns (capitalized words)
  return /^[A-Z][a-z]+ [A-Z][a-z]+/.test(joinedText) ||
         texts.length >= 2 && texts.every(t => /^[A-Z][a-z]+$/.test(t.trim()));
};

const isGradeOrMark = (texts) => {
  return texts.some(text => 
    /^[A-F][+-]?$/.test(text.trim()) || // Letter grades
    /^(PASS|FAIL|U|ABS)$/i.test(text.trim()) || // Status grades
    /^\d{1,3}(\.\d+)?$/.test(text.trim()) // Numeric marks
  );
};

const smartGradeMerge = (texts) => {
  // If all are individual grades/marks, keep them separate with spaces
  if (texts.every(t => /^[A-F][+-]?$/.test(t.trim()) || /^\d{1,3}(\.\d+)?$/.test(t.trim()))) {
    return texts.join(' ');
  }
  // Otherwise merge normally
  return texts.join(' ');
};

// Smart text merging for names and multi-word fields
const smartTextMerge = (texts) => {
  // If texts look like they should be separate (numbers, codes), don't merge
  if (texts.every(text => /^\d+$/.test(text.trim()))) {
    return texts.join(' '); // Keep numbers separate with spaces
  }
  
  // If texts look like parts of a name or phrase, merge with spaces
  if (texts.some(text => /^[A-Z][a-z]/.test(text.trim()))) {
    return texts.join(' ');
  }
  
  // Default: join with spaces
  return texts.join(' ');
};

// Check if text looks like registration number or code
const isRegistrationOrCode = (text) => {
  return isRegistrationNumber(text) || 
         /^[A-Z]{1,3}\d/.test(text.trim()) || // Code patterns
         /^\d+[A-Z]/.test(text.trim());
};

// Basic column detection fallback
const basicColumnDetection = (sortedItems) => {
  console.log('  Using basic column detection fallback...');
  
  // Calculate gaps between consecutive items
  const gaps = [];
  for (let i = 1; i < sortedItems.length; i++) {
    const gap = sortedItems[i].x - (sortedItems[i-1].x + (sortedItems[i-1].width || 0));
    gaps.push({
      index: i,
      gap: gap,
      beforeText: sortedItems[i-1].text,
      afterText: sortedItems[i].text
    });
  }
  
  if (gaps.length === 0) {
    return [sortedItems.map(item => item.text).join(' ')];
  }
  
  // Find significant gaps (larger than average)
  const avgGap = gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length;
  const significantGaps = gaps.filter(g => g.gap > Math.max(avgGap * 1.2, 1.0));
  
  console.log(`  Average gap: ${avgGap.toFixed(2)}, Significant gaps: ${significantGaps.length}`);
  
  // Group text items into columns based on significant gaps
  const columns = [];
  let currentColumn = [];
  let gapIndex = 0;
  
  for (let i = 0; i < sortedItems.length; i++) {
    currentColumn.push(sortedItems[i].text);
    
    // Check if there's a significant gap after this item
    const hasSignificantGap = significantGaps.some(g => g.index === i + 1);
    
    if (hasSignificantGap || i === sortedItems.length - 1) {
      // End current column
      const columnText = currentColumn.join(' ').trim();
      if (columnText.length > 0) {
        columns.push(columnText);
      }
      currentColumn = [];
    }
  }
  
  return columns.length > 0 ? columns : [sortedItems.map(item => item.text).join(' ')];
};

// Fallback OCR extraction (disabled for PDFs to avoid conflicts)
const extractWithOCR = async (filePath) => {
  try {
    console.log('OCR extraction requested, but skipping for PDF files to avoid conflicts');
    console.log('PDF files should be processed with PDF2JSON only');
    
    // Return a basic fallback structure instead of attempting OCR on PDF
    return {
      rawText: 'OCR extraction skipped for PDF files',
      structuredTables: [],
      metadata: {
        extractionMethod: 'ocr-skipped',
        textLength: 0,
        tablesFound: 0,
        note: 'OCR is not suitable for PDF files, use PDF2JSON instead'
      }
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return null;
  }
};

// Extract table-like structures from OCR text
const extractTablesFromOCRText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const tables = [];
  
  let currentTable = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line looks like a table row (has multiple words/columns)
    const words = line.split(/\s+/).filter(word => word.length > 0);
    const hasMultipleColumns = words.length >= 2;
    const hasTableIndicators = /\||\t|  +/.test(line); // pipes, tabs, or multiple spaces
    const isTableRow = hasMultipleColumns && (hasTableIndicators || words.length >= 3);
    
    if (isTableRow) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }
      
      // Split the line into columns more intelligently
      let columns;
      if (line.includes('|')) {
        columns = line.split('|').map(col => col.trim());
      } else if (line.includes('\t')) {
        columns = line.split('\t').map(col => col.trim());
      } else {
        // Split by multiple spaces (2 or more)
        columns = line.split(/  +/).map(col => col.trim());
      }
      
      currentTable.push(columns.filter(col => col.length > 0));
    } else {
      if (inTable && currentTable.length >= 2) {
        // End of table, save it
        tables.push({
          page: 1,
          rows: currentTable,
          totalRows: currentTable.length
        });
      }
      inTable = false;
      currentTable = [];
    }
  }
  
  // Don't forget the last table
  if (inTable && currentTable.length >= 2) {
    tables.push({
      page: 1,
      rows: currentTable,
      totalRows: currentTable.length
    });
  }
  
  console.log(`OCR found ${tables.length} table structures`);
  return tables;
};

// Clean and structure the extracted data
const cleanAndStructureData = (extractedData) => {
  if (!extractedData) return null;

  const result = {
    headers: [],
    rows: [],
    metadata: {
      ...extractedData.metadata,
      confidence: 0,
      totalRows: 0,
      issues: []
    },
    rawData: extractedData
  };

  try {
    // Try to extract from structured tables first
    if (extractedData.structuredTables && extractedData.structuredTables.length > 0) {
      const bestTable = findBestTable(extractedData.structuredTables);
      if (bestTable) {
        const structured = structureTableData(bestTable);
        return { ...result, ...structured };
      }
    }

    // Fallback to text analysis
    if (extractedData.rawText) {
      const structured = structureFromText(extractedData.rawText);
      return { ...result, ...structured };
    }

    return result;
  } catch (error) {
    console.error('Data structuring failed:', error);
    result.metadata.issues.push(`Structuring error: ${error.message}`);
    return result;
  }
};

// Find the table with the most consistent structure (updated for multi-page)
const findBestTable = (tables) => {
  let bestTable = null;
  let maxScore = 0;

  for (const table of tables) {
    if (!table.rows || table.rows.length < 1) continue;
    
    // For multi-page tables, prioritize the consolidated table
    if (table.page === 'all') {
      console.log('Found multi-page consolidated table with', table.rows.length, 'rows');
      return table; // Always prefer the consolidated multi-page table
    }
    
    // For single page tables, use existing logic
    const columnCounts = table.rows.map(row => row.length);
    const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
    const variance = columnCounts.reduce((sum, count) => 
      sum + Math.pow(count - avgColumns, 2), 0) / columnCounts.length;
    
    const consistency = Math.max(0, 1 - (variance / avgColumns));
    const dataQuality = table.rows.filter(row => 
      row.some(cell => cell && cell.trim().length > 0)
    ).length / table.rows.length;
    
    const score = consistency * 0.6 + dataQuality * 0.4;
    
    if (score > maxScore) {
      maxScore = score;
      bestTable = table;
    }
  }

  return bestTable;
};

// Structure data from the best table (updated for multi-page support)
const structureTableData = (table) => {
  const result = {
    headers: [],
    rows: [],
    metadata: { confidence: 0, totalRows: 0, issues: [] }
  };

  if (!table.rows || table.rows.length === 0) return result;

  console.log(`Structuring table with ${table.rows.length} rows from ${table.page === 'all' ? 'multiple pages' : `page ${table.page}`}`);
  
  // Handle multi-page consolidated table
  if (table.page === 'all' && table.headerInfo) {
    console.log('Processing multi-page consolidated table...');
    
    // Use detected headers from consolidation
    result.headers = table.headerInfo.detectedHeaders;
    
    // Log page breakdown
    if (table.pageBreakdown) {
      console.log('Page breakdown:', table.pageBreakdown);
    }
    
    // Process all consolidated rows
    result.rows = table.rows.map((row, index) => {
      const rowData = {};
      
      // Debug logging for multi-page data
      console.log(`Processing multi-page row ${index}:`, row);
      
      // Ensure row is an array
      const rowArray = Array.isArray(row) ? row : Object.values(row);
      
      result.headers.forEach((header, colIndex) => {
        const cellValue = rowArray[colIndex] || '';
        const cleanValue = cellValue.toString().trim();
        rowData[header] = cleanValue;
        console.log(`  ${header} = "${cleanValue}"`);
      });

      return { 
        data: rowData, 
        issues: [],
        originalIndex: index + 1,
        originalRow: rowArray,
        columnCount: rowArray.length,
        source: 'multi-page'
      };
    }).filter(row => {
      // Only filter out completely empty rows
      const values = Object.values(row.data);
      const hasData = values.some(value => value && value.length > 0);
      console.log(`Row ${row.originalIndex} has data:`, hasData, values);
      return hasData;
    });

    result.metadata.isMultiPage = true;
    result.metadata.pageBreakdown = table.pageBreakdown;
    result.metadata.confidence = table.headerInfo.confidence;
    result.metadata.totalPages = Object.keys(table.pageBreakdown || {}).length;
    
  } else {
    // Handle single page table (existing logic)
    console.log('Processing single page table...');
    
    // Log first few rows to understand structure
    table.rows.slice(0, 3).forEach((row, i) => {
      console.log(`  Row ${i}: [${row.map(cell => `"${cell}"`).join(', ')}] (${row.length} columns)`);
    });

    // Find maximum number of columns across all rows
    const maxColumns = Math.max(...table.rows.map(row => row.length));
    console.log(`Maximum columns detected: ${maxColumns}`);

    // Find the most likely header row by analyzing multiple rows
    let headerRowIndex = findHeaderRow(table.rows);
    
    if (headerRowIndex >= 0) {
      const headerRow = table.rows[headerRowIndex];
      result.headers = Array.from({ length: maxColumns }, (_, index) => {
        const header = headerRow[index];
        return cleanHeaderText(header || `Column ${index + 1}`);
      });
      console.log(`Using header row ${headerRowIndex}: [${result.headers.join(', ')}]`);
    } else {
      // Generate intelligent default headers based on data patterns
      result.headers = generateSmartHeaders(table.rows, maxColumns);
      headerRowIndex = -1; // No header row found, include all rows as data
      console.log(`Generated headers: [${result.headers.join(', ')}]`);
    }

    // Process all data rows (skip header row if found)
    const dataRows = headerRowIndex >= 0 ? table.rows.slice(headerRowIndex + 1) : table.rows;
    console.log(`Processing ${dataRows.length} data rows`);
    
    result.rows = dataRows.map((row, index) => {
      const rowData = {};
      const issues = [];
      
      // Debug logging for single page data
      console.log(`Processing single-page row ${index}:`, row);
      
      // Ensure row has same number of columns as headers
      const normalizedRow = Array.from({ length: maxColumns }, (_, i) => row[i] || '');
      console.log(`Normalized row ${index}:`, normalizedRow);
      
      result.headers.forEach((header, colIndex) => {
        const cellValue = normalizedRow[colIndex] || '';
        const cleanValue = cellValue.toString().trim();
        rowData[header] = cleanValue;
        console.log(`  ${header} = "${cleanValue}"`);
      });

      // Validate row data - keep all rows, even if some columns are empty
      const hasAnyData = Object.values(rowData).some(value => value && value.length > 0);
      if (!hasAnyData) {
        issues.push(`Row ${index + 1}: Completely empty row`);
        console.log(`Row ${index + 1} marked as empty`);
      }

      return { 
        data: rowData, 
        issues,
        originalIndex: index + (headerRowIndex >= 0 ? headerRowIndex + 1 : 0) + 1,
        originalRow: row,
        columnCount: normalizedRow.length,
        source: 'single-page'
      };
    }).filter(row => {
      // Only filter out completely empty rows
      const values = Object.values(row.data);
      const hasData = values.some(value => value && value.length > 0);
      console.log(`Filtering row ${row.originalIndex}, has data:`, hasData, values);
      return hasData;
    });

    result.metadata.headerRowIndex = headerRowIndex;
    result.metadata.maxColumns = maxColumns;
  }

  // Post-process the table structure for better formatting
  const postProcessed = postProcessTableStructure(result);
  console.log(`Post-processed table: ${postProcessed.rows.length} rows`);
  
  return postProcessed;
};

// Post-process extracted table to improve structure for exam results
const postProcessTableStructure = (structuredData) => {
  if (!structuredData || !structuredData.rows) return structuredData;
  
  console.log('Post-processing table structure for better formatting...');
  
  // Analyze the data to identify patterns
  const sampleRows = structuredData.rows.slice(0, 5);
  const patterns = analyzeDataPatterns(sampleRows);
  
  if (patterns.isExamResult) {
    console.log('Detected exam result format, applying specialized formatting...');
    return restructureExamResults(structuredData, patterns);
  }
  
  return structuredData;
};

// Analyze data patterns to identify document type
const analyzeDataPatterns = (sampleRows) => {
  const patterns = {
    isExamResult: false,
    hasRegistrationNumbers: false,
    hasStudentNames: false,
    hasGrades: false,
    commonColumnCount: 0
  };
  
  if (sampleRows.length === 0) return patterns;
  
  // Check for common exam result patterns
  const allText = sampleRows.map(row => 
    Object.values(row.data || row).join(' ').toLowerCase()
  ).join(' ');
  
  patterns.hasRegistrationNumbers = /\d{10,}/.test(allText);
  patterns.hasStudentNames = /[a-z]+ [a-z]+ [a-z]+/i.test(allText);
  patterns.hasGrades = /\b[A-F][+-]?\b|\b(pass|fail)\b/i.test(allText);
  
  // Check for exam-specific keywords
  const examKeywords = /reg|registration|student|name|subject|mark|grade|result|examination/i;
  patterns.isExamResult = examKeywords.test(allText) && 
                         (patterns.hasRegistrationNumbers || patterns.hasStudentNames);
  
  // Find most common column count
  const columnCounts = sampleRows.map(row => Object.keys(row.data || row).length);
  patterns.commonColumnCount = Math.max(...columnCounts);
  
  console.log('Data patterns detected:', patterns);
  return patterns;
};

// Restructure data specifically for exam results
const restructureExamResults = (structuredData, patterns) => {
  const restructured = {
    ...structuredData,
    rows: [],
    headers: [...structuredData.headers]
  };
  
  // Process each row to better format exam result data
  structuredData.rows.forEach((row, index) => {
    const rowData = row.data || row;
    const restructuredRow = restructureExamResultRow(rowData, structuredData.headers, index);
    
    if (restructuredRow && Object.values(restructuredRow).some(val => val && val.length > 0)) {
      restructured.rows.push({
        ...row,
        data: restructuredRow
      });
    }
  });
  
  // Improve headers for exam results
  restructured.headers = improveExamResultHeaders(restructured.headers, restructured.rows);
  
  console.log(`Restructured exam results: ${restructured.rows.length} rows with improved formatting`);
  return restructured;
};

// Restructure individual exam result row
const restructureExamResultRow = (rowData, headers, rowIndex) => {
  const restructured = {};
  const values = Object.values(rowData);
  
  // Skip completely empty rows
  if (values.every(val => !val || val.trim().length === 0)) {
    return null;
  }
  
  // Extract and clean up the data
  const cleanedValues = values.map(val => (val || '').toString().trim()).filter(val => val.length > 0);
  
  if (cleanedValues.length === 0) return null;
  
  // Try to identify and structure the data intelligently for exam results
  let serialNo = '';
  let regNumber = '';
  let studentName = '';
  let subjectCode = '';
  let grade = '';
  let marks = '';
  let otherData = [];
  
  cleanedValues.forEach((value, index) => {
    if (/^\d{1,3}$/.test(value) && index === 0) {
      // First column is often serial number
      serialNo = value;
    } else if (isRegistrationNumber(value)) {
      // Registration number
      if (!regNumber) regNumber = value;
      else otherData.push(value);
    } else if (/^[A-Z][a-z]+ [A-Z]/.test(value) && value.split(' ').length >= 2) {
      // Student name (proper name format)
      if (!studentName) studentName = value;
      else otherData.push(value);
    } else if (/^[A-F][+-]?$|^(PASS|FAIL|U|ABS)$/i.test(value)) {
      // Grade
      if (!grade) grade = value;
      else otherData.push(value);
    } else if (/^\d{3,6}$/.test(value) && !isRegistrationNumber(value)) {
      // Subject code (3-6 digits, but not a registration number)
      if (!subjectCode) subjectCode = value;
      else otherData.push(value);
    } else if (/^\d{1,3}(\.\d+)?$/.test(value)) {
      // Marks (1-3 digits with optional decimal)
      if (!marks) marks = value;
      else otherData.push(value);
    } else {
      otherData.push(value);
    }
  });
  
  // Map to appropriate columns based on header analysis
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase();
    
    if (headerLower.includes('s.no') || headerLower.includes('serial') || headerLower.includes('sl')) {
      restructured[header] = serialNo || (index === 0 ? cleanedValues[0] : '') || '';
    } else if (headerLower.includes('reg') || headerLower.includes('number') || headerLower.includes('roll')) {
      restructured[header] = regNumber || cleanedValues.find(v => isRegistrationNumber(v)) || '';
    } else if (headerLower.includes('name') || headerLower.includes('student')) {
      restructured[header] = studentName || cleanedValues.find(v => /^[A-Z][a-z]+ [A-Z]/.test(v)) || '';
    } else if (headerLower.includes('subject') || headerLower.includes('code')) {
      restructured[header] = subjectCode || cleanedValues.find(v => /^\d{3,6}$/.test(v)) || '';
    } else if (headerLower.includes('grade') || headerLower.includes('result')) {
      restructured[header] = grade || cleanedValues.find(v => /^[A-F][+-]?$|^(PASS|FAIL|U)$/i.test(v)) || '';
    } else if (headerLower.includes('mark') || headerLower.includes('score')) {
      restructured[header] = marks || cleanedValues.find(v => /^\d{1,3}(\.\d+)?$/.test(v)) || '';
    } else {
      // Fill remaining columns with remaining data in order
      const availableIndex = Math.min(index, cleanedValues.length - 1);
      restructured[header] = cleanedValues[availableIndex] || otherData.shift() || '';
    }
  });
  
  return restructured;
};

// Improve headers specifically for exam results
const improveExamResultHeaders = (originalHeaders, rows) => {
  const improved = [...originalHeaders];
  
  if (rows.length === 0) return improved;
  
  // Analyze first few rows to suggest better headers
  const sampleData = rows.slice(0, 5).map(row => Object.values(row.data || row));
  
  improved.forEach((header, index) => {
    const columnData = sampleData.map(row => row[index] || '').filter(val => val.length > 0);
    
    if (columnData.length === 0) return;
    
    const headerLower = header.toLowerCase();
    
    // Suggest better headers based on data patterns
    if (columnData.some(val => /^\d{1,3}$/.test(val)) && index === 0 && !headerLower.includes('no')) {
      improved[index] = 'S.No';
    } else if (columnData.some(val => isRegistrationNumber(val)) && !headerLower.includes('reg')) {
      improved[index] = 'Registration Number';
    } else if (columnData.some(val => /^[A-Z][a-z]+ [A-Z]/.test(val)) && !headerLower.includes('name')) {
      improved[index] = 'Student Name';
    } else if (columnData.some(val => /^[A-F][+-]?$|^(PASS|FAIL|U|ABS)$/i.test(val)) && !headerLower.includes('grade')) {
      improved[index] = 'Grade';
    } else if (columnData.some(val => /^\d{3,6}$/.test(val) && !isRegistrationNumber(val)) && !headerLower.includes('subject')) {
      improved[index] = 'Subject Code';
    } else if (columnData.some(val => /^\d{1,3}(\.\d+)?$/.test(val)) && !headerLower.includes('mark')) {
      improved[index] = 'Marks';
    }
  });
  
  console.log('Improved exam result headers:', improved);
  return improved;
};

// Main controller functions for API routes

// Main controller functions for API routes

// Upload and extract PDF data
export const uploadAndExtractPdf = async (req, res) => {
  console.log('PDF upload and extraction request received');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('Processing uploaded file:', req.file.filename);
    const filePath = req.file.path;

    // Extract data using our enhanced spatial grouping
    const extractedData = await extractPdfData(filePath);
    
    if (!extractedData) {
      console.log('PDF extraction failed with PDF2JSON');
      
      // Instead of OCR fallback (which doesn't work well with PDFs), 
      // provide a more helpful error message
      return res.status(500).json({
        success: false,
        message: 'Failed to extract content from PDF. The PDF might be corrupted, password-protected, or contain only scanned images.',
        error: 'PDF2JSON extraction failed',
        suggestions: [
          'Ensure the PDF is not password-protected',
          'Try with a different PDF file',
          'Check if the PDF contains actual text (not just scanned images)'
        ]
      });
    }

    // Clean and structure the extracted data
    const structuredData = cleanAndStructureData(extractedData);
    
    console.log('PDF extraction completed successfully');
    console.log('Structured data preview:', {
      headers: structuredData.headers?.length,
      rows: structuredData.rows?.length,
      metadata: structuredData.metadata
    });

    res.json({
      success: true,
      message: 'PDF content extracted successfully',
      data: { extractedData: structuredData }
    });

  } catch (error) {
    console.error('Error in uploadAndExtractPdf:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing PDF',
      error: error.message
    });
  } finally {
    // Clean up uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
};

// Save extracted data to database
export const saveExtractedData = async (req, res) => {
  try {
    const { extractedData, metadata } = req.body;
    
    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: 'No extracted data provided'
      });
    }

    const processedResult = new ProcessedResult({
      extractedData,
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
        processingMethod: 'pdf2json-spatial'
      },
      uploadedBy: req.user.userId
    });

    await processedResult.save();
    
    console.log('Extracted data saved to database');

    res.status(201).json({
      success: true,
      message: 'Extracted data saved successfully',
      data: processedResult
    });

  } catch (error) {
    console.error('Error saving extracted data:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving extracted data',
      error: error.message
    });
  }
};

// Get processed results for a user
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

console.log('Processed Result Controller loaded successfully');

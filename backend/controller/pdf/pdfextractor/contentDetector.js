// Content detection and structured analysis
import { createTableFromRows } from './tableCreator.js';
import { createAnnaUniversityGradeTable, createSemanticTable } from './gradeTableCreator.js';

export const detectStructuredContent = (texts) => {
  const structuredContent = {
    tables: [],
    lists: [],
    headers: [],
    paragraphs: []
  };

  // Group texts by similar Y coordinates (rows) with better tolerance
  const rows = {};
  const tolerance = 0.5; // Increased tolerance for better row grouping
  
  texts.forEach(text => {
    let foundGroup = false;
    const currentY = text.y;
    
    // Check if this text belongs to an existing row group
    Object.keys(rows).forEach(existingY => {
      if (Math.abs(currentY - parseFloat(existingY)) <= tolerance) {
        rows[existingY].push(text);
        foundGroup = true;
      }
    });
    
    // If no group found, create new one
    if (!foundGroup) {
      const roundedY = Math.round(currentY * 10) / 10;
      if (!rows[roundedY]) {
        rows[roundedY] = [];
      }
      rows[roundedY].push(text);
    }
  });

  // Sort rows by Y coordinate
  const sortedRows = Object.keys(rows)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .map(y => rows[y]);

  // Enhanced table detection for grade sheets and structured documents
  let potentialTableRows = [];
  let currentTable = null;

  sortedRows.forEach((row, index) => {
    // Sort row by X coordinate (left to right)
    const sortedRow = row.sort((a, b) => a.x - b.x);
    
    // Check if this looks like a table row (multiple elements or specific patterns)
    const isTableLike = sortedRow.length > 1 || 
                       sortedRow.some(text => 
                         /^[A-Z]{2,3}\d{4}/.test(text.text) || // Course codes like GE3151
                         /^\d{12}/.test(text.text) || // Student IDs like 731121205005
                         text.text.toLowerCase().includes('grade') ||
                         /^[ABCDEFPU][+\-]?$/.test(text.text) || // Grades like A, B+, C-, U, P
                         /^UA$/.test(text.text) || // University Absent
                         /^[A-Z][A-Z\s]*$/.test(text.text) && text.text.length > 2 // Names
                       );

    if (isTableLike) {
      potentialTableRows.push({
        y: parseFloat(Object.keys(rows)[sortedRows.indexOf(row)]),
        cells: sortedRow,
        rowIndex: index
      });
    } else {
      // Process accumulated table rows
      if (potentialTableRows.length >= 2) {
        const table = createTableFromRows(potentialTableRows);
        if (table && table.rows.length > 0) {
          structuredContent.tables.push(table);
        }
      }
      potentialTableRows = [];
      
      // Classify single texts
      if (sortedRow.length === 1) {
        const text = sortedRow[0];
        if (text.fontSize > 14 || text.text.length < 50) {
          structuredContent.headers.push(text.text);
        } else {
          structuredContent.paragraphs.push(text.text);
        }
      }
    }
  });

  // Process any remaining table rows
  if (potentialTableRows.length >= 2) {
    const table = createTableFromRows(potentialTableRows);
    if (table && table.rows.length > 0) {
      structuredContent.tables.push(table);
    }
  }

  // If no traditional tables found, try to create semantic tables
  if (structuredContent.tables.length === 0) {
    // Try Anna University grade sheet format first
    const annaUniversityTable = createAnnaUniversityGradeTable(texts);
    if (annaUniversityTable) {
      structuredContent.tables.push(annaUniversityTable);
    } else {
      // Fallback to general semantic table
      const semanticTable = createSemanticTable(texts);
      if (semanticTable) {
        structuredContent.tables.push(semanticTable);
      }
    }
  }

  return structuredContent;
};

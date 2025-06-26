// Table creation from structured content
export const createTableFromRows = (tableRows) => {
  if (tableRows.length < 2) return null;

  // Enhanced column detection for grade sheets
  const allXPositions = [];
  const courseCodes = [];
  const grades = [];
  
  tableRows.forEach(row => {
    row.cells.forEach(cell => {
      allXPositions.push(cell.x);
      
      // Collect course codes and grades for better column mapping
      if (/^[A-Z]{2,3}\d{4}/.test(cell.text)) {
        courseCodes.push(cell);
      } else if (/^[ABCDEFPU][+\-]?$/.test(cell.text) || /^UA$/.test(cell.text)) {
        grades.push(cell);
      }
    });
  });

  // Group similar X positions to determine columns (with better tolerance)
  const columnXPositions = [];
  const positionTolerance = 3.0; // Increased tolerance for PDF variations
  
  allXPositions.sort((a, b) => a - b).forEach(x => {
    let foundColumn = false;
    columnXPositions.forEach(col => {
      if (Math.abs(col.x - x) <= positionTolerance) {
        foundColumn = true;
        // Update column position to average
        col.x = (col.x + x) / 2;
      }
    });
    
    if (!foundColumn) {
      columnXPositions.push({ x: x, width: 10 });
    }
  });

  // Sort columns by X position
  columnXPositions.sort((a, b) => a.x - b.x);

  // Build table rows by mapping cells to columns
  const tableData = {
    columns: columnXPositions,
    rows: []
  };

  // First pass: identify header row with course codes
  let headerRowIndex = -1;
  tableRows.forEach((row, index) => {
    const courseCodeCount = row.cells.filter(cell => /^[A-Z]{2,3}\d{4}/.test(cell.text)).length;
    if (courseCodeCount >= 2) { // Row with multiple course codes is likely header
      headerRowIndex = index;
    }
  });

  tableRows.forEach((row, rowIndex) => {
    const tableRow = new Array(columnXPositions.length).fill('');
    
    row.cells.forEach(cell => {
      // Find which column this cell belongs to
      let bestColumnIndex = 0;
      let minDistance = Math.abs(columnXPositions[0].x - cell.x);
      
      columnXPositions.forEach((col, index) => {
        const distance = Math.abs(col.x - cell.x);
        if (distance < minDistance) {
          minDistance = distance;
          bestColumnIndex = index;
        }
      });
      
      // Place cell in the best matching column
      if (minDistance <= positionTolerance * 1.5) {
        if (tableRow[bestColumnIndex] === '') {
          tableRow[bestColumnIndex] = cell.text;
        } else {
          // Handle multiple texts in same cell
          tableRow[bestColumnIndex] += ' ' + cell.text;
        }
      }
    });
    
    // Only add rows that have content
    if (tableRow.some(cell => cell.trim() !== '')) {
      tableData.rows.push(tableRow);
    }
  });

  // Post-process: Clean up the table and ensure proper structure
  if (tableData.rows.length > 0) {
    // Remove completely empty columns
    const nonEmptyColumns = [];
    for (let colIndex = 0; colIndex < tableData.rows[0].length; colIndex++) {
      const hasContent = tableData.rows.some(row => row[colIndex] && row[colIndex].trim() !== '');
      if (hasContent) {
        nonEmptyColumns.push(colIndex);
      }
    }
    
    if (nonEmptyColumns.length > 0) {
      tableData.rows = tableData.rows.map(row => 
        nonEmptyColumns.map(colIndex => row[colIndex] || '')
      );
      tableData.columns = nonEmptyColumns.map(colIndex => tableData.columns[colIndex]);
    }
  }

  return tableData.rows.length > 0 ? tableData : null;
};

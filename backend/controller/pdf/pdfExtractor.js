// Enhanced PDF data extraction and structuring functionality

// Enhanced PDF data extraction and structuring
export const extractStructuredData = (pdfData) => {
  try {
    const pages = pdfData.Pages || [];
    const extractedData = {
      metadata: {
        title: pdfData.Meta?.Title || 'Untitled Document',
        author: pdfData.Meta?.Author || 'Unknown',
        subject: pdfData.Meta?.Subject || '',
        creator: pdfData.Meta?.Creator || '',
        producer: pdfData.Meta?.Producer || '',
        creationDate: pdfData.Meta?.CreationDate || '',
        modificationDate: pdfData.Meta?.ModDate || '',
        pageCount: pages.length
      },
      pages: [],
      fullText: '',
      tables: [],
      forms: []
    };

    pages.forEach((page, pageIndex) => {
      const pageData = {
        pageNumber: pageIndex + 1,
        width: page.Width,
        height: page.Height,
        texts: [],
        rawTexts: [],
        structuredContent: {}
      };

      // Extract text content
      if (page.Texts && page.Texts.length > 0) {
        page.Texts.forEach(text => {
          if (text.R && text.R.length > 0) {
            text.R.forEach(run => {
              if (run.T) {
                const decodedText = decodeURIComponent(run.T);
                pageData.texts.push({
                  text: decodedText,
                  x: text.x,
                  y: text.y,
                  width: text.w,
                  height: text.h,
                  fontSize: run.TS ? run.TS[1] : 12,
                  fontFamily: run.TS ? run.TS[0] : 'default',
                  color: run.TS ? run.TS[2] : '#000000'
                });
                pageData.rawTexts.push(decodedText);
                
                // Add space or newline for better text formatting
                if (extractedData.fullText.length > 0 && 
                    !extractedData.fullText.endsWith(' ') && 
                    !extractedData.fullText.endsWith('\n')) {
                  extractedData.fullText += ' ';
                }
                extractedData.fullText += decodedText;
              }
            });
          }
        });
        
        // Sort texts by Y position (top to bottom) then X position (left to right)
        pageData.texts.sort((a, b) => {
          if (Math.abs(a.y - b.y) < 1) { // Same line (within 1 unit)
            return a.x - b.x;
          }
          return a.y - b.y;
        });
        
        // Create better formatted text from sorted texts
        let formattedText = '';
        let lastY = -1;
        pageData.texts.forEach(text => {
          if (lastY !== -1 && Math.abs(text.y - lastY) > 1) {
            formattedText += '\n'; // New line for different Y positions
          } else if (formattedText.length > 0 && !formattedText.endsWith(' ')) {
            formattedText += ' '; // Space between texts on same line
          }
          formattedText += text.text;
          lastY = text.y;
        });
        
        // Update page raw texts with formatted version
        if (formattedText.trim()) {
          pageData.formattedText = formattedText;
        }
      }

      // Detect tables and structured content
      pageData.structuredContent = detectStructuredContent(pageData.texts);
      
      // Extract any detected tables
      if (pageData.structuredContent.tables) {
        extractedData.tables.push(...pageData.structuredContent.tables);
      }

      extractedData.pages.push(pageData);
    });

    // Create better formatted full text from all pages
    let betterFullText = '';
    extractedData.pages.forEach((page, index) => {
      if (index > 0) {
        betterFullText += '\n\n--- Page ' + page.pageNumber + ' ---\n\n';
      }
      if (page.formattedText) {
        betterFullText += page.formattedText;
      } else if (page.rawTexts && page.rawTexts.length > 0) {
        betterFullText += page.rawTexts.join(' ');
      }
    });
    
    // Use the better formatted text if available
    if (betterFullText.trim()) {
      extractedData.fullText = betterFullText;
    }

    // Extract form fields if any
    if (pdfData.formImage && pdfData.formImage.Pages) {
      pdfData.formImage.Pages.forEach(page => {
        if (page.Fields) {
          page.Fields.forEach(field => {
            extractedData.forms.push({
              name: field.id?.Id || 'unnamed',
              type: field.AM || 'text',
              value: field.V || '',
              x: field.id?.x || 0,
              y: field.id?.y || 0
            });
          });
        }
      });
    }

    return extractedData;
  } catch (error) {
    console.error('Error extracting structured data:', error);
    return {
      error: 'Failed to extract structured data',
      rawData: pdfData
    };
  }
};

// Detect structured content like tables, lists, etc.
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

// Specialized function for Anna University grade sheet format
export const createAnnaUniversityGradeTable = (texts) => {
  console.log('Attempting Anna University grade sheet detection...');
  
  // Look for specific Anna University patterns
  const hasAnnaUniversity = texts.some(t => t.text.includes('ANNA UNIVERSITY'));
  const courseCodes = texts.filter(t => /^[A-Z]{2,3}\d{4}/.test(t.text));
  const gradeLabels = texts.filter(t => t.text.toLowerCase() === 'grade');
  const grades = texts.filter(t => /^[ABCDEFPU][+\-]?$/.test(t.text) || /^UA$/.test(t.text));
  const names = texts.filter(t => t.text.length > 2 && /^[A-Z][A-Z\s]*$/.test(t.text) && 
                               !t.text.toLowerCase().includes('grade') && 
                               !/^[A-Z]{2,3}\d{4}/.test(t.text) &&
                               !/^[ABCDEFPU][+\-]?$/.test(t.text) &&
                               !/^UA$/.test(t.text) &&
                               !t.text.includes('UNIVERSITY') &&
                               !t.text.includes('COLLEGE') &&
                               !t.text.includes('EXAMINATION') &&
                               !t.text.includes('Subject') &&
                               !t.text.includes('Code') &&
                               !t.text.includes('Name'));
  
  console.log('Anna University detection results:');
  console.log('- Has Anna University header:', hasAnnaUniversity);
  console.log('- Course codes:', courseCodes.length, courseCodes.map(c => `${c.text}(${c.x.toFixed(1)},${c.y.toFixed(1)})`));
  console.log('- Grade labels:', gradeLabels.length, gradeLabels.map(g => `${g.text}(${g.x.toFixed(1)},${g.y.toFixed(1)})`));
  console.log('- Actual grades:', grades.length, grades.map(g => `${g.text}(${g.x.toFixed(1)},${g.y.toFixed(1)})`));
  console.log('- Student names:', names.length, names.map(n => `${n.text}(${n.x.toFixed(1)},${n.y.toFixed(1)})`));
  
  if (courseCodes.length >= 3 && (grades.length >= 3 || names.length >= 1)) {
    // Sort course codes by X position (left to right)
    const sortedCourseCodes = courseCodes.sort((a, b) => a.x - b.x);
    
    // Create header row
    const headerRow = ['Student Name'];
    sortedCourseCodes.forEach(code => {
      headerRow.push(code.text);
    });
    
    console.log('Header row created:', headerRow);
    
    // Enhanced student and grade mapping with improved algorithm
    const studentGradeMap = {};
    
    // First, identify all student rows by Y position
    names.forEach((name, index) => {
      const studentKey = `student_${index}`;
      studentGradeMap[studentKey] = {
        name: name.text,
        y: name.y,
        x: name.x,
        grades: {},
        gradeElements: []
      };
    });
    
    console.log('Student map initialized:', Object.keys(studentGradeMap).length, 'students');
    console.log('Students:', Object.values(studentGradeMap).map(s => `${s.name} at (${s.x.toFixed(1)}, ${s.y.toFixed(1)})`));
    
    // Improved mapping algorithm: use Y-proximity first, then X-alignment
    grades.forEach(grade => {
      console.log(`\nProcessing grade "${grade.text}" at (${grade.x.toFixed(1)}, ${grade.y.toFixed(1)})`);
      
      // Find the closest student by Y position (same row) with much more relaxed tolerance
      let closestStudent = null;
      let minYDistance = Infinity;
      
      Object.values(studentGradeMap).forEach(student => {
        const yDistance = Math.abs(student.y - grade.y);
        console.log(`  - Distance to ${student.name}: Y=${yDistance.toFixed(2)}`);
        
        if (yDistance < minYDistance && yDistance <= 3.0) { // Much more relaxed Y tolerance
          minYDistance = yDistance;
          closestStudent = student;
        }
      });
      
      if (closestStudent) {
        console.log(`  → Assigned to student: ${closestStudent.name} (Y distance: ${minYDistance.toFixed(2)})`);
        
        // Find which course this grade belongs to by X position
        let closestCourse = null;
        let minXDistance = Infinity;
        
        sortedCourseCodes.forEach(course => {
          const xDistance = Math.abs(course.x - grade.x);
          console.log(`    - Distance to ${course.text}: X=${xDistance.toFixed(2)}`);
          
          if (xDistance < minXDistance) {
            minXDistance = xDistance;
            closestCourse = course;
          }
        });
        
        if (closestCourse && minXDistance <= 15.0) { // Much more relaxed X tolerance
          console.log(`    → Assigned to course: ${closestCourse.text} (X distance: ${minXDistance.toFixed(2)})`);
          closestStudent.grades[closestCourse.text] = grade.text;
          closestStudent.gradeElements.push({
            course: closestCourse.text,
            grade: grade.text,
            x: grade.x,
            y: grade.y,
            distance: minXDistance
          });
        } else {
          console.log(`    → No course found within X tolerance (min distance: ${minXDistance.toFixed(2)})`);
        }
      } else {
        console.log(`  → No student found within Y tolerance (min distance: ${minYDistance.toFixed(2)})`);
      }
    });
    
    // Enhanced fallback: If no direct mapping worked, try row-based grouping
    const studentsWithGrades = Object.values(studentGradeMap).filter(s => Object.keys(s.grades).length > 0);
    
    if (studentsWithGrades.length === 0 && grades.length > 0) {
      console.log('\nDirect mapping failed, trying enhanced row-based approach...');
      
      // Create rows by grouping all text elements by Y position
      const allTextElements = [...names, ...grades, ...sortedCourseCodes];
      const rowGroups = {};
      const yTolerance = 2.5; // Increased tolerance
      
      allTextElements.forEach(element => {
        let assigned = false;
        
        // Try to find existing row within tolerance
        Object.keys(rowGroups).forEach(existingY => {
          if (Math.abs(parseFloat(existingY) - element.y) <= yTolerance) {
            rowGroups[existingY].push(element);
            assigned = true;
          }
        });
        
        // Create new row if not assigned
        if (!assigned) {
          const key = element.y.toFixed(1);
          if (!rowGroups[key]) {
            rowGroups[key] = [];
          }
          rowGroups[key].push(element);
        }
      });
      
      console.log('Row groups created:', Object.keys(rowGroups).length);
      
      // Process each row to extract student-grade relationships
      Object.keys(rowGroups).forEach(rowY => {
        const rowElements = rowGroups[rowY].sort((a, b) => a.x - b.x);
        const rowNames = rowElements.filter(el => names.some(n => n.text === el.text));
        const rowGrades = rowElements.filter(el => grades.some(g => g.text === el.text && Math.abs(g.x - el.x) < 1 && Math.abs(g.y - el.y) < 1));
        
        if (rowNames.length > 0 && rowGrades.length > 0) {
          console.log(`Row at Y=${rowY}: ${rowNames.length} names, ${rowGrades.length} grades`);
          
          // For each student in this row, assign grades based on X position
          rowNames.forEach(studentElement => {
            const student = Object.values(studentGradeMap).find(s => s.name === studentElement.text);
            if (student) {
              rowGrades.forEach(gradeElement => {
                // Find closest course code by X position
                let closestCourse = null;
                let minDistance = Infinity;
                
                sortedCourseCodes.forEach(course => {
                  const distance = Math.abs(course.x - gradeElement.x);
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestCourse = course;
                  }
                });
                
                if (closestCourse && minDistance <= 20.0) { // Very relaxed for fallback
                  student.grades[closestCourse.text] = gradeElement.text;
                  console.log(`  Row mapping: ${student.name} → ${gradeElement.text} for ${closestCourse.text}`);
                }
              });
            }
          });
        }
      });
    }
    
    // Build table rows
    const tableRows = [headerRow];
    
    // Sort students by Y position (top to bottom)
    const sortedStudents = Object.values(studentGradeMap).sort((a, b) => a.y - b.y);
    
    sortedStudents.forEach(student => {
      const row = [student.name];
      let hasGrades = false;
      
      sortedCourseCodes.forEach(course => {
        const grade = student.grades[course.text];
        if (grade) {
          hasGrades = true;
          row.push(grade);
        } else {
          row.push(''); // Empty instead of em dash for better visibility
        }
      });
      
      // Only add rows that have at least one grade or are named students
      if (hasGrades || student.name.length > 2) {
        tableRows.push(row);
      }
      
      console.log(`Student row: ${student.name} → [${row.slice(1).join(', ')}]`);
    });
    
    console.log('Final table created:', tableRows.length, 'rows');
    console.log('Table structure:', tableRows);
    
    if (tableRows.length > 1) {
      return {
        columns: headerRow.map((header, index) => ({ x: index * 15, width: 15 })),
        rows: tableRows
      };
    }
  }
  
  return null;
};

// Create table from accumulated rows
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

// Create semantic table for grade sheets and structured documents
export const createSemanticTable = (texts) => {
  const studentIds = texts.filter(t => /^\d{12}/.test(t.text));
  const courseCodes = texts.filter(t => /^[A-Z]{2,3}\d{4}/.test(t.text));
  const grades = texts.filter(t => /^[ABCDEFPU][+\-]?$/.test(t.text) || /^UA$/.test(t.text));
  const gradeLabels = texts.filter(t => t.text.toLowerCase() === 'grade');
  const names = texts.filter(t => t.text.length > 2 && /^[A-Z][A-Z\s]*$/.test(t.text) && 
                               !t.text.toLowerCase().includes('grade') && 
                               !/^[A-Z]{2,3}\d{4}/.test(t.text) &&
                               !/^[ABCDEFPU][+\-]?$/.test(t.text));

  console.log('Semantic table detection:');
  console.log('- Student IDs found:', studentIds.length);
  console.log('- Course codes found:', courseCodes.length);
  console.log('- Grades found:', grades.length);
  console.log('- Names found:', names.length);

  // Enhanced approach: Create a comprehensive grade table
  if (courseCodes.length > 0 && (names.length > 0 || studentIds.length > 0)) {
    
    // Sort course codes by X position to determine column order
    const sortedCourseCodes = courseCodes.sort((a, b) => a.x - b.x);
    
    // Create table structure
    const table = {
      columns: [],
      rows: []
    };

    // Build header row
    const headerRow = ['Name'];
    if (studentIds.length > 0) headerRow.push('Student ID');
    
    // Add course codes as column headers
    sortedCourseCodes.forEach(code => {
      headerRow.push(code.text);
    });

    table.columns = headerRow.map((header, index) => ({ x: index * 15, width: 15 }));
    table.rows.push(headerRow);

    // Group all text elements by Y coordinate to form rows
    const rowGroups = {};
    const tolerance = 1.0;

    [...names, ...studentIds, ...grades].forEach(text => {
      let assigned = false;
      
      // Try to assign to existing row group
      Object.keys(rowGroups).forEach(y => {
        if (Math.abs(parseFloat(y) - text.y) <= tolerance) {
          rowGroups[y].push(text);
          assigned = true;
        }
      });
      
      // Create new row group if not assigned
      if (!assigned) {
        const key = text.y.toFixed(2);
        if (!rowGroups[key]) rowGroups[key] = [];
        rowGroups[key].push(text);
      }
    });

    // Sort row groups by Y coordinate
    const sortedRowGroups = Object.keys(rowGroups)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .map(y => rowGroups[y]);

    // Process each row group
    sortedRowGroups.forEach(rowGroup => {
      // Skip if this row only contains course codes (header row)
      const hasCourseCodes = rowGroup.some(item => courseCodes.some(code => code.text === item.text));
      if (hasCourseCodes && rowGroup.length <= courseCodes.length) {
        return;
      }

      const row = new Array(headerRow.length).fill('');
      
      // Sort row elements by X coordinate
      const sortedRowElements = rowGroup.sort((a, b) => a.x - b.x);
      
      sortedRowElements.forEach(element => {
        if (/^[A-Z][A-Z\s]*$/.test(element.text) && element.text.length > 2 && 
            !courseCodes.some(code => code.text === element.text)) {
          // This is likely a name
          row[0] = element.text;
        } else if (/^\d{12}/.test(element.text)) {
          // This is a student ID
          const idIndex = headerRow.indexOf('Student ID');
          if (idIndex !== -1) row[idIndex] = element.text;
        } else if (/^[ABCDEFPU][+\-]?$/.test(element.text) || /^UA$/.test(element.text)) {
          // This is a grade - find which course column it belongs to
          const gradeX = element.x;
          let bestColumn = -1;
          let minDistance = Infinity;
          
          sortedCourseCodes.forEach((code, index) => {
            const columnIndex = headerRow.indexOf(code.text);
            if (columnIndex !== -1) {
              const distance = Math.abs(code.x - gradeX);
              if (distance < minDistance) {
                minDistance = distance;
                bestColumn = columnIndex;
              }
            }
          });
          
          // Also check by proximity to grade labels
          gradeLabels.forEach(label => {
            const distance = Math.abs(label.x - gradeX);
            if (distance < minDistance) {
              // Find course code closest to this grade label
              let closestCourse = null;
              let closestDistance = Infinity;
              
              sortedCourseCodes.forEach(code => {
                const codeDistance = Math.abs(code.x - label.x);
                if (codeDistance < closestDistance) {
                  closestDistance = codeDistance;
                  closestCourse = code;
                }
              });
              
              if (closestCourse) {
                const columnIndex = headerRow.indexOf(closestCourse.text);
                if (columnIndex !== -1) {
                  bestColumn = columnIndex;
                  minDistance = distance;
                }
              }
            }
          });
          
          if (bestColumn !== -1 && minDistance < 5.0) { // Reasonable proximity threshold
            row[bestColumn] = element.text;
          }
        }
      });
      
      // Only add row if it has meaningful content
      if (row.some(cell => cell.trim() !== '' && cell !== '—')) {
        table.rows.push(row);
      }
    });

    // Alternative approach: Create grid-based table if the above doesn't work well
    if (table.rows.length <= 1) {
      return createGridBasedTable(texts, courseCodes, grades, names, studentIds);
    }

    return table.rows.length > 1 ? table : null;
  }

  return null;
};

// Grid-based table creation for complex layouts
export const createGridBasedTable = (texts, courseCodes, grades, names, studentIds) => {
  console.log('Using grid-based table creation...');
  
  // Create a more flexible grid-based approach
  const allElements = [...courseCodes, ...grades, ...names, ...studentIds];
  
  if (allElements.length === 0) return null;
  
  // Find unique X and Y positions
  const xPositions = [...new Set(allElements.map(el => Math.round(el.x * 2) / 2))].sort((a, b) => a - b);
  const yPositions = [...new Set(allElements.map(el => Math.round(el.y * 2) / 2))].sort((a, b) => a - b);
  
  console.log('Grid dimensions:', xPositions.length, 'x', yPositions.length);
  
  // Create grid
  const grid = Array(yPositions.length).fill(null).map(() => Array(xPositions.length).fill(''));
  
  // Place elements in grid
  allElements.forEach(element => {
    const xIndex = xPositions.findIndex(x => Math.abs(x - element.x) < 1.0);
    const yIndex = yPositions.findIndex(y => Math.abs(y - element.y) < 1.0);
    
    if (xIndex !== -1 && yIndex !== -1) {
      if (grid[yIndex][xIndex] === '') {
        grid[yIndex][xIndex] = element.text;
      } else {
        grid[yIndex][xIndex] += ' ' + element.text;
      }
    }
  });
  
  // Clean up grid and create table
  const cleanedRows = grid.filter(row => row.some(cell => cell.trim() !== ''));
  
  if (cleanedRows.length > 1) {
    return {
      columns: xPositions.map((x, index) => ({ x: x, width: 10 })),
      rows: cleanedRows
    };
  }
  
  return null;
};

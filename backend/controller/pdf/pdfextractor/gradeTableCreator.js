// Specialized grade table creation for academic documents
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

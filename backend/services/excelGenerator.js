import XLSX from 'xlsx';

class ExcelGenerator {
  generateExcelForSemester(semesterData) {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Create main results sheet
      const resultsData = this.prepareResultsData(semesterData);
      const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
      XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');
      
      // Create summary sheet
      const summaryData = this.prepareSummaryData(semesterData);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Create subjects sheet
      const subjectsData = this.prepareSubjectsData(semesterData);
      const subjectsSheet = XLSX.utils.json_to_sheet(subjectsData);
      XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects');
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });
      
      return excelBuffer;
    } catch (error) {
      console.error('Excel generation error:', error);
      throw new Error(`Failed to generate Excel: ${error.message}`);
    }
  }

  prepareResultsData(semesterData) {
    const resultsData = [];
    
    if (semesterData.students && Array.isArray(semesterData.students)) {
      semesterData.students.forEach(student => {
        const baseRow = {
          'Student Name': student.name || 'N/A',
          'Roll Number': student.rollNumber || 'N/A',
          'Semester': student.semester || 'N/A',
          'SGPA': student.sgpa || 'N/A',
          'CGPA': student.cgpa || 'N/A',
          'Result': student.result || 'N/A'
        };

        if (student.subjects && Array.isArray(student.subjects)) {
          student.subjects.forEach(subject => {
            resultsData.push({
              ...baseRow,
              'Subject Code': subject.code || 'N/A',
              'Subject Name': subject.name || 'N/A',
              'Credits': subject.credits || 'N/A',
              'Grade': subject.grade || 'N/A',
              'Marks': subject.marks || 'N/A'
            });
          });
        } else {
          resultsData.push(baseRow);
        }
      });
    }

    return resultsData;
  }

  prepareSummaryData(semesterData) {
    const summary = [];
    
    summary.push({
      'Field': 'Institution',
      'Value': semesterData.institution || 'N/A'
    });
    
    summary.push({
      'Field': 'Semester',
      'Value': semesterData.semester || 'N/A'
    });
    
    summary.push({
      'Field': 'Academic Year',
      'Value': semesterData.academicYear || 'N/A'
    });
    
    summary.push({
      'Field': 'Exam Type',
      'Value': semesterData.examType || 'N/A'
    });
    
    summary.push({
      'Field': 'Total Students',
      'Value': semesterData.students ? semesterData.students.length : 0
    });
    
    summary.push({
      'Field': 'Generated At',
      'Value': new Date().toLocaleString()
    });

    return summary;
  }

  prepareSubjectsData(semesterData) {
    const subjectsMap = new Map();
    
    if (semesterData.students && Array.isArray(semesterData.students)) {
      semesterData.students.forEach(student => {
        if (student.subjects && Array.isArray(student.subjects)) {
          student.subjects.forEach(subject => {
            const key = `${subject.code}-${subject.name}`;
            if (!subjectsMap.has(key)) {
              subjectsMap.set(key, {
                'Subject Code': subject.code || 'N/A',
                'Subject Name': subject.name || 'N/A',
                'Credits': subject.credits || 'N/A',
                'Student Count': 0
              });
            }
            subjectsMap.get(key)['Student Count']++;
          });
        }
      });
    }

    return Array.from(subjectsMap.values());
  }

  generateFileName(semesterData, originalFileName) {
    const semester = semesterData.semester || 'Unknown';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanOriginalName = originalFileName.replace(/\.[^/.]+$/, '');
    
    return `${cleanOriginalName}_Semester_${semester}_${timestamp}.xlsx`;
  }

  // Enhanced method to generate Excel with better formatting
  generateExcelForSemesterEnhanced(semesterData) {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Create main results sheet with better formatting
      const resultsData = this.prepareResultsDataEnhanced(semesterData);
      const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
      
      // Set column widths
      const wscols = [
        { wch: 25 }, // Student Name
        { wch: 15 }, // Roll Number  
        { wch: 10 }, // Semester
        { wch: 15 }, // Subject Code
        { wch: 30 }, // Subject Name
        { wch: 8 },  // Credits
        { wch: 8 },  // Grade
        { wch: 8 },  // Marks
        { wch: 8 },  // SGPA
        { wch: 8 },  // CGPA
        { wch: 10 }  // Result
      ];
      resultsSheet['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Student Results');
      
      // Create summary sheet
      const summaryData = this.prepareSummaryDataEnhanced(semesterData);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Create subjects sheet
      const subjectsData = this.prepareSubjectsDataEnhanced(semesterData);
      const subjectsSheet = XLSX.utils.json_to_sheet(subjectsData);
      XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects');
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });
      
      return excelBuffer;
    } catch (error) {
      console.error('Enhanced Excel generation error:', error);
      // Fallback to basic generation
      return this.generateExcelForSemester(semesterData);
    }
  }

  prepareResultsDataEnhanced(semesterData) {
    const resultsData = [];
    
    if (semesterData.students && Array.isArray(semesterData.students)) {
      semesterData.students.forEach(student => {
        if (student.subjects && Array.isArray(student.subjects) && student.subjects.length > 0) {
          student.subjects.forEach(subject => {
            resultsData.push({
              'Student Name': student.name || 'N/A',
              'Roll Number': student.rollNumber || 'N/A',
              'Semester': student.semester || 'N/A',
              'Subject Code': subject.code || 'N/A',
              'Subject Name': subject.name || 'N/A',
              'Credits': subject.credits || 'N/A',
              'Grade': subject.grade || 'N/A',
              'Marks': subject.marks || 'N/A',
              'SGPA': student.sgpa || 'N/A',
              'CGPA': student.cgpa || 'N/A',
              'Result': student.result || 'N/A'
            });
          });
        } else {
          // Include student even if no subjects
          resultsData.push({
            'Student Name': student.name || 'N/A',
            'Roll Number': student.rollNumber || 'N/A',
            'Semester': student.semester || 'N/A',
            'Subject Code': 'N/A',
            'Subject Name': 'N/A',
            'Credits': 'N/A',
            'Grade': 'N/A',
            'Marks': 'N/A',
            'SGPA': student.sgpa || 'N/A',
            'CGPA': student.cgpa || 'N/A',
            'Result': student.result || 'N/A'
          });
        }
      });
    }

    return resultsData;
  }

  prepareSummaryDataEnhanced(semesterData) {
    const summary = [];
    
    summary.push({
      'Information': 'Institution',
      'Value': semesterData.institution || 'N/A'
    });
    
    summary.push({
      'Information': 'Semester',
      'Value': semesterData.semester || 'N/A'
    });
    
    summary.push({
      'Information': 'Academic Year',
      'Value': semesterData.academicYear || 'N/A'
    });
    
    summary.push({
      'Information': 'Exam Type',
      'Value': semesterData.examType || 'N/A'
    });
    
    summary.push({
      'Information': 'Total Students',
      'Value': semesterData.students ? semesterData.students.length : 0
    });
    
    // Calculate pass/fail statistics
    if (semesterData.students && Array.isArray(semesterData.students)) {
      const passCount = semesterData.students.filter(s => 
        s.result && s.result.toLowerCase().includes('pass')
      ).length;
      
      summary.push({
        'Information': 'Students Passed',
        'Value': passCount
      });
      
      summary.push({
        'Information': 'Students Failed',
        'Value': semesterData.students.length - passCount
      });
    }
    
    summary.push({
      'Information': 'Generated At',
      'Value': new Date().toLocaleString()
    });
    
    return summary;
  }

  prepareSubjectsDataEnhanced(semesterData) {
    const subjectsMap = new Map();
    
    if (semesterData.students && Array.isArray(semesterData.students)) {
      semesterData.students.forEach(student => {
        if (student.subjects && Array.isArray(student.subjects)) {
          student.subjects.forEach(subject => {
            const key = subject.code || 'Unknown';
            if (!subjectsMap.has(key)) {
              subjectsMap.set(key, {
                'Subject Code': subject.code || 'N/A',
                'Subject Name': subject.name || 'N/A',
                'Credits': subject.credits || 'N/A',
                'Student Count': 0,
                'Grades': []
              });
            }
            const subjectData = subjectsMap.get(key);
            subjectData['Student Count']++;
            if (subject.grade) {
              subjectData.Grades.push(subject.grade);
            }
          });
        }
      });
    }

    // Convert to array and add grade distribution
    return Array.from(subjectsMap.values()).map(subject => ({
      'Subject Code': subject['Subject Code'],
      'Subject Name': subject['Subject Name'],
      'Credits': subject['Credits'],
      'Student Count': subject['Student Count'],
      'Unique Grades': [...new Set(subject.Grades)].join(', ')
    }));
  }
}

export default new ExcelGenerator();

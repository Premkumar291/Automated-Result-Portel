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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanOriginalName = originalFileName.replace(/\.[^/.]+$/, '');
    
    return `${cleanOriginalName}_${semester}_${timestamp}.xlsx`;
  }
}

export default new ExcelGenerator();

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/reports`,
  timeout: 300000, // 5 minutes timeout for large files
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Excel Report API Service
 */
export const excelReportsAPI = {
  /**
   * Generate standard Excel report
   */
  generateExcelReport: async (reportData) => {
    try {
      const response = await apiClient.post('/generate-excel', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate Excel report');
    }
  },

  /**
   * Generate enhanced Excel report
   */
  generateEnhancedExcelReport: async (reportData) => {
    try {
      const response = await apiClient.post('/generate-enhanced-excel', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate enhanced Excel report');
    }
  },

  /**
   * Generate institutional Excel report
   */
  generateInstitutionalExcelReport: async (reportData) => {
    try {
      const response = await apiClient.post('/generate-institutional-excel', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate institutional Excel report');
    }
  },

  /**
   * Preview Excel report data
   */
  previewExcelReport: async (reportId) => {
    try {
      const response = await apiClient.get(`/preview-excel/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to preview Excel report');
    }
  },

  /**
   * Update Excel report with new data
   */
  updateExcelReport: async (reportId, updateData) => {
    try {
      const response = await apiClient.put(`/update-excel/${reportId}`, { updateData });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update Excel report');
    }
  },

  /**
   * Download Excel report
   */
  downloadExcelReport: async (reportId) => {
    try {
      const response = await apiClient.get(`/download-excel/${reportId}`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'excel_report.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Excel file downloaded successfully' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download Excel report');
    }
  },

  /**
   * Get all reports (both PDF and Excel)
   */
  getReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/list', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  /**
   * Delete a report
   */
  deleteReport: async (reportId) => {
    try {
      const response = await apiClient.delete(`/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete report');
    }
  }
};

/**
 * Helper functions for Excel report handling
 */
export const excelReportHelpers = {
  /**
   * Validate grade value
   */
  isValidGrade: (grade) => {
    const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'U', 'F', '-', ''];
    return validGrades.includes(grade?.toUpperCase?.());
  },

  /**
   * Format grade for display
   */
  formatGrade: (grade) => {
    if (!grade || grade === '') return '-';
    return grade.toUpperCase();
  },

  /**
   * Get grade color
   */
  getGradeColor: (grade) => {
    const gradeColors = {
      'O': '#10b981',     // Green
      'A+': '#10b981',    // Green
      'A': '#10b981',     // Green
      'B+': '#059669',    // Dark Green
      'B': '#059669',     // Dark Green
      'C': '#f59e0b',     // Yellow
      'P': '#f59e0b',     // Yellow
      'U': '#dc2626',     // Red
      'F': '#dc2626',     // Red
      '-': '#6b7280',     // Gray
      '': '#6b7280'       // Gray
    };
    
    return gradeColors[grade?.toUpperCase()] || gradeColors['-'];
  },

  /**
   * Calculate pass percentage
   */
  calculatePassPercentage: (students, subjectCode) => {
    const validStudents = students.filter(student => 
      student.grades[subjectCode] && student.grades[subjectCode] !== ''
    );
    
    if (validStudents.length === 0) return 0;
    
    const passedStudents = validStudents.filter(student => 
      student.grades[subjectCode] !== 'U' && student.grades[subjectCode] !== 'F'
    );
    
    return (passedStudents.length / validStudents.length) * 100;
  },

  /**
   * Validate Excel report data
   */
  validateReportData: (reportData) => {
    const errors = [];
    
    if (!reportData.facultyName) errors.push('Faculty name is required');
    if (!reportData.semester) errors.push('Semester is required');
    if (!reportData.academicYear) errors.push('Academic year is required');
    if (!reportData.department) errors.push('Department is required');
    
    if (!reportData.analysisData) {
      errors.push('Analysis data is required');
    } else {
      if (!reportData.analysisData.students || !Array.isArray(reportData.analysisData.students)) {
        errors.push('Valid student data is required');
      }
      if (!reportData.analysisData.subjectCodes || !Array.isArray(reportData.analysisData.subjectCodes)) {
        errors.push('Valid subject codes are required');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get report type display name
   */
  getReportTypeDisplayName: (reportType) => {
    const typeNames = {
      'standard': 'Standard Report',
      'enhanced': 'Enhanced Report',
      'institutional': 'Institutional Report'
    };
    
    return typeNames[reportType] || 'Unknown Report';
  },

  /**
   * Get file type icon
   */
  getFileTypeIcon: (fileType) => {
    const icons = {
      'pdf': '📄',
      'excel': '📊'
    };
    
    return icons[fileType] || '📋';
  },

  /**
   * Process analysis data for Excel generation
   */
  processAnalysisDataForExcel: (analysisData) => {
    const { students, subjectCodes } = analysisData;
    
    // Calculate statistics
    const totalStudents = students.length;
    const totalSubjects = subjectCodes.length;
    
    // Calculate overall pass percentage
    const studentsPassedAll = students.filter(student =>
      subjectCodes.every(code =>
        student.grades[code] && student.grades[code] !== 'U' && student.grades[code] !== 'F'
      )
    ).length;
    
    const overallPassPercentage = totalStudents > 0 ? 
      (studentsPassedAll / totalStudents) * 100 : 0;
    
    // Calculate subject-wise results
    const subjectResults = subjectCodes.map(subjectCode => {
      const passPercentage = excelReportHelpers.calculatePassPercentage(students, subjectCode);
      const validStudents = students.filter(student =>
        student.grades[subjectCode] && student.grades[subjectCode] !== ''
      );
      const passedStudents = validStudents.filter(student =>
        student.grades[subjectCode] !== 'U' && student.grades[subjectCode] !== 'F'
      );
      
      return {
        subjectCode,
        subjectName: subjectCode,
        passPercentage,
        totalStudents: validStudents.length,
        passedStudents: passedStudents.length
      };
    });
    
    return {
      totalStudents,
      totalSubjects,
      overallPassPercentage,
      subjectResults,
      studentsData: students
    };
  }
};

export default excelReportsAPI;

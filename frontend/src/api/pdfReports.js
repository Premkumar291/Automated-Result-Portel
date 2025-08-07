import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Configure axios instance for PDF reports
const reportsApi = axios.create({
  baseURL: `${API_BASE_URL}/reports`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * PDF Reports API Service
 * Handles all PDF report generation and management operations
 */
export const pdfReportsApi = {
  
  /**
   * Generate a new PDF report from analysis data
   * @param {Object} reportData - Report generation data
   * @param {string} reportData.facultyName - Name of the faculty handling the report
   * @param {string} reportData.semester - Semester information
   * @param {string} reportData.academicYear - Academic year
   * @param {string} reportData.department - Department name
   * @param {Object} reportData.analysisData - Analysis data from result analysis
   * @param {string} reportData.reportType - Type of report ('standard' or 'enhanced')
   * @returns {Promise} API response with report generation details
   */
  async generateReport(reportData) {
    try {
      console.log('Generating PDF report with data:', reportData);
      
      const response = await reportsApi.post('/generate', reportData);
      
      if (response.data.success) {
        console.log('PDF report generated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate PDF report');
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid report data. Please check all required fields.');
      } else {
        throw new Error('Failed to generate PDF report. Please try again.');
      }
    }
  },

  /**
   * Generate an enhanced PDF report with detailed template
   * @param {Object} reportData - Enhanced report generation data
   * @param {string} reportData.facultyName - Name of the faculty handling the report
   * @param {string} reportData.semester - Semester information
   * @param {string} reportData.academicYear - Academic year
   * @param {string} reportData.department - Department name
   * @param {Object} reportData.analysisData - Analysis data from result analysis
   * @param {string} reportData.subjectCode - Subject code (optional)
   * @param {string} reportData.subjectName - Subject name (optional)
   * @returns {Promise} API response with enhanced report generation details
   */
  async generateEnhancedReport(reportData) {
    try {
      console.log('Generating enhanced PDF report with data:', reportData);
      
      const response = await reportsApi.post('/generate-enhanced', reportData);
      
      if (response.data.success) {
        console.log('Enhanced PDF report generated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate enhanced PDF report');
      }
    } catch (error) {
      console.error('Error generating enhanced PDF report:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid enhanced report data. Please check all required fields.');
      } else {
        throw new Error('Failed to generate enhanced PDF report. Please try again.');
      }
    }
  },

  /**
   * Generate institutional format report matching the exact image format
   * @param {Object} reportData - Institutional report generation data
   * @param {string} reportData.department - Department name
   * @param {string} reportData.semester - Semester information
   * @param {string} reportData.academicYear - Academic year
   * @param {Object} reportData.analysisData - Analysis data (optional)
   * @param {string} reportData.instituteName - Institute name (optional)
   * @param {string} reportData.instituteLocation - Institute location (optional)
   * @returns {Promise} API response with institutional report generation details
   */
  async generateInstitutionalReport(reportData) {
    try {
      console.log('Generating institutional PDF report with data:', reportData);
      
      const response = await reportsApi.post('/generate-institutional', reportData);
      
      if (response.data.success) {
        console.log('Institutional PDF report generated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate institutional PDF report');
      }
    } catch (error) {
      console.error('Error generating institutional PDF report:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid institutional report data. Please check all required fields.');
      } else {
        throw new Error('Failed to generate institutional PDF report. Please try again.');
      }
    }
  },

  /**
   * Get list of generated reports
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @returns {Promise} API response with reports list
   */
  async getReports(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      
      const response = await reportsApi.get('/list', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch reports. Please try again.');
      }
    }
  },

  /**
   * Download a generated PDF report
   * @param {string} reportId - Report ID
   * @returns {Promise} Download blob
   */
  async downloadReport(reportId) {
    try {
      const response = await reportsApi.get(`/download/${reportId}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Report not found or has been deleted.');
      } else {
        throw new Error('Failed to download report. Please try again.');
      }
    }
  },

  /**
   * Get preview URL for a generated PDF report
   * @param {string} reportId - Report ID
   * @returns {string} Preview URL
   */
  getPreviewUrl(reportId) {
    return `${API_BASE_URL}/reports/preview/${reportId}`;
  },

  /**
   * Preview a generated PDF report
   * @param {string} reportId - Report ID
   * @returns {Promise} Preview blob
   */
  async previewReport(reportId) {
    try {
      const response = await reportsApi.get(`/preview/${reportId}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error previewing report:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Report not found or has been deleted.');
      } else {
        throw new Error('Failed to preview report. Please try again.');
      }
    }
  },

  /**
   * Delete a generated report
   * @param {string} reportId - Report ID
   * @returns {Promise} API response
   */
  async deleteReport(reportId) {
    try {
      const response = await reportsApi.delete(`/${reportId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Report not found or has been deleted.');
      } else {
        throw new Error('Failed to delete report. Please try again.');
      }
    }
  },

  /**
   * Helper function to trigger file download from blob
   * @param {Blob} blob - File blob
   * @param {string} filename - Desired filename
   */
  triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default pdfReportsApi;

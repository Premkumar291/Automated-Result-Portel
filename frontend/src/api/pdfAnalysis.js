import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pdf-analysis';

// Upload and analyze PDF file (main function)
export const analyzePDF = async (file, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append('pdfFile', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
      onUploadProgress: onUploadProgress
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Analysis failed' };
  }
};

// Upload and process PDF file (alias for backward compatibility)
export const uploadPDF = async (file, onUploadProgress) => {
  return analyzePDF(file, onUploadProgress);
};

// Get all Excel files (with optional semester filter)
export const getExcelFiles = async (semester = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/excel-files`, {
      params: { semester },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch Excel files' };
  }
};

// Download Excel file
export const downloadExcelFile = async (fileId, fileName) => {
  try {
    const response = await axios.get(`${API_URL}/download/${fileId}`, {
      withCredentials: true,
      responseType: 'blob'
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'File downloaded successfully' };
  } catch (error) {
    throw error.response?.data || { message: 'Download failed' };
  }
};

// Delete Excel file
export const deleteExcelFile = async (fileId) => {
  try {
    const response = await axios.delete(`${API_URL}/excel-files/${fileId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Delete failed' };
  }
};

// Get available semesters
export const getSemesters = async () => {
  try {
    const response = await axios.get(`${API_URL}/semesters`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch semesters' };
  }
};

// Test Groq connection
export const testGroqConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/test-groq`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Connection test failed' };
  }
};

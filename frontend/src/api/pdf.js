const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080/api" : "/api";

// Upload and extract PDF data (old method)
export const uploadPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_URL}/pdf/upload`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload PDF');
    }

    return data;
  } catch (error) {
    console.error('PDF upload error:', error);
    throw error;
  }
};

// Save PDF to database
export const savePDF = async (file, filename, description = '') => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('filename', filename);
    formData.append('description', description);

    const response = await fetch(`${API_URL}/pdf/save`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save PDF');
    }

    return data;
  } catch (error) {
    console.error('PDF save error:', error);
    throw error;
  }
};

// Get all user's PDFs
export const getUserPDFs = async () => {
  try {
    const response = await fetch(`${API_URL}/pdf/list`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch PDFs');
    }

    return data;
  } catch (error) {
    console.error('Get PDFs error:', error);
    throw error;
  }
};

// Analyze specific PDF
export const analyzePDF = async (pdfId) => {
  try {
    const response = await fetch(`${API_URL}/pdf/analyze/${pdfId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to analyze PDF');
    }

    return data;
  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};

// Update PDF info
export const updatePDFInfo = async (pdfId, filename, description) => {
  try {
    const response = await fetch(`${API_URL}/pdf/update/${pdfId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename, description })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update PDF info');
    }

    return data;
  } catch (error) {
    console.error('Update PDF info error:', error);
    throw error;
  }
};

// Download PDF
export const downloadPDF = async (pdfId, filename) => {
  try {
    const response = await fetch(`${API_URL}/pdf/download/${pdfId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to download PDF');
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error) {
    console.error('Download PDF error:', error);
    throw error;
  }
};

// Delete PDF
export const deletePDF = async (pdfId) => {
  try {
    const response = await fetch(`${API_URL}/pdf/delete/${pdfId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete PDF');
    }

    return data;
  } catch (error) {
    console.error('Delete PDF error:', error);
    throw error;
  }
};

// Get PDF analysis results
export const getPDFAnalysis = async (pdfId) => {
  try {
    const response = await fetch(`${API_URL}/pdf/analysis/${pdfId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get PDF analysis');
    }

    return data;
  } catch (error) {
    console.error('Get PDF analysis error:', error);
    throw error;
  }
};

// Get PDF analysis capabilities
export const getPDFAnalysisCapabilities = async () => {
  try {
    const response = await fetch(`${API_URL}/pdf/analysis`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get PDF analysis');
    }

    return data;
  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};

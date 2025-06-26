const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080/api" : "/api";

// Upload and extract PDF data
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

// Get PDF analysis capabilities
export const getPDFAnalysis = async () => {
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

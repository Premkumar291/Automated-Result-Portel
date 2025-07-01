const API_BASE_URL = 'http://localhost:8080/api/results';

// Upload result PDF
export const uploadResultPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resultPDF', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Note: Don't set Content-Type header when using FormData
      // Browser will set it automatically with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle authentication errors
      if (response.status === 401) {
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Authentication required. Please login again.');
      }
      
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Get uploaded results
export const getResults = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/results?${queryParams.toString()}`
      : `${API_BASE_URL}/results`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle authentication errors
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Authentication required. Please login again.');
      }
      
      throw new Error(errorData.message || 'Failed to fetch results');
    }

    return await response.json();
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

// Delete results
export const deleteResults = async (resultIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resultIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle authentication errors
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Authentication required. Please login again.');
      }
      
      throw new Error(errorData.message || 'Failed to delete results');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete results error:', error);
    throw error;
  }
};

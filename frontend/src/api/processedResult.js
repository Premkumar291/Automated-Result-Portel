// Processed Result API functions
const API_URL = "http://localhost:8080/api";

export const uploadAndExtractPDF = async (file) => {
  console.log('🚀 Starting PDF upload...');
  console.log('📄 File:', file.name, file.size, 'bytes');
  console.log('🔗 API URL:', `${API_URL}/processed-results/upload-extract`);

  try {
    const formData = new FormData();
    formData.append('pdfFile', file);

    console.log('📡 Sending request to backend...');
    
    const response = await fetch(`${API_URL}/processed-results/upload-extract`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    
    console.log('📨 Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ Response not OK:', response.status);
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('❌ Error data:', errorData);
      } catch (jsonError) {
        console.error('❌ Could not parse error response as JSON:', jsonError);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Success! Data received:', data);
    
    return data;
    
  } catch (error) {
    console.error('🔥 Upload error details:');
    console.error('  Error name:', error.name);
    console.error('  Error message:', error.message);
    console.error('  Full error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:8080');
    }
    
    throw error;
  }
};

export const saveProcessedResult = async (tempId, decision) => {
  const response = await fetch(`${API_URL}/processed-results/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tempId, decision }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

export const getProcessedResults = async () => {
  const response = await fetch(`${API_URL}/processed-results/list`, {
    method: "GET",
    credentials: "include",
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

export const exportToCSV = (data, fileName = 'extracted_results.csv') => {
  if (!data || !data.headers || !data.rows) {
    throw new Error('Invalid data format for CSV export');
  }

  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => 
      data.headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        return value.toString().includes(',') 
          ? `"${value.toString().replace(/"/g, '""')}"`
          : value.toString();
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

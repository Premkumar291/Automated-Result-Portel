// Processed Result API functions
const API_URL = "http://localhost:8080/api";

export const uploadAndExtractPDF = async (file) => {
  const formData = new FormData();
  formData.append('pdfFile', file);

  const response = await fetch(`${API_URL}/processed-results/upload-extract`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
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

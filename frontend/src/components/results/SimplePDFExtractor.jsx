import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const SimplePDFExtractor = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setExtractedData(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
        setExtractedData(null);
      } else {
        setError('Please drop a valid PDF file');
      }
    }
  };

  const extractPDFContent = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      const response = await fetch('/api/processed-results/upload-extract', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExtractedData(data.data.extractedData);
        setSuccess('PDF content extracted successfully!');
      } else {
        setError(data.message || 'Failed to extract PDF content');
      }
    } catch (error) {
      console.error('Error extracting PDF:', error);
      setError('An error occurred while extracting PDF content');
    } finally {
      setProcessing(false);
    }
  };

  const downloadJSON = () => {
    if (!extractedData) return;

    const jsonContent = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf_content_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!extractedData || !extractedData.headers || !extractedData.rows) return;

    const csvContent = [
      extractedData.headers.join(','),
      ...extractedData.rows.map(row => 
        extractedData.headers.map(header => {
          const value = row[header] || '';
          return value.toString().includes(',') 
            ? `"${value.toString().replace(/"/g, '""')}"`
            : value.toString();
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf_content_${Date.now()}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setError('');
    setSuccess('');
    setViewMode('table');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Content Extractor</h1>
        <p className="text-gray-600">Upload a PDF file to extract and view its content in table or JSON format</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="space-y-6">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {file ? file.name : 'Drop your PDF file here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse your files
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={extractPDFContent}
              disabled={!file || processing}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Extract Content
                </>
              )}
            </button>

            {extractedData && (
              <button
                onClick={resetForm}
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {extractedData && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Extracted Content</h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'json'
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  JSON View
                </button>
              </div>

              {/* Download Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={downloadCSV}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {extractedData.metadata && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Rows:</span>
                  <span className="ml-2 text-gray-900">{extractedData.metadata.totalRows || extractedData.rows?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Columns:</span>
                  <span className="ml-2 text-gray-900">{extractedData.headers?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Method:</span>
                  <span className="ml-2 text-gray-900">{extractedData.metadata.extractionMethod || 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Confidence:</span>
                  <span className={`ml-2 font-medium ${
                    extractedData.metadata.confidence >= 0.8 ? 'text-green-600' :
                    extractedData.metadata.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round((extractedData.metadata.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Content Display */}
          <div className="border rounded-lg overflow-hidden">
            {viewMode === 'table' ? (
              // Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {extractedData.headers?.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {extractedData.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {extractedData.headers?.map((header, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // JSON View
              <div className="p-6">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePDFExtractor;

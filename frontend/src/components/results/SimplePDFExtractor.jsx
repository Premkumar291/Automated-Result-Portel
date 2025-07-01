import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadAndExtractPDF } from '../../api/processedResult';

const SimplePDFExtractor = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Helper functions for cell value formatting and styling
  const formatCellValue = (value) => {
    if (!value || value === '') return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value).trim();
  };

  const getValueClass = (value) => {
    if (!value || value === '' || value === '-') {
      return 'text-gray-400 italic';
    }
    if (typeof value === 'string') {
      // Check if it's a number
      if (/^\d+(\.\d+)?$/.test(value.trim())) {
        return 'text-blue-600 font-mono';
      }
      // Check if it's a grade
      if (/^[A-F][+-]?$/i.test(value.trim())) {
        return 'text-green-600 font-semibold';
      }
      // Check if it's a name (contains multiple words with capitals)
      if (/^[A-Z][a-z]+\s+[A-Z]/i.test(value.trim())) {
        return 'text-gray-900 font-medium';
      }
    }
    return 'text-gray-900';
  };

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
      const data = await uploadAndExtractPDF(file);

      if (data.success) {
        console.log('=== RECEIVED DATA ===');
        console.log('Full response:', data);
        console.log('Extracted data:', data.data.extractedData);
        console.log('Headers:', data.data.extractedData.headers);
        console.log('Rows count:', data.data.extractedData.rows?.length);
        console.log('Sample row structure:', data.data.extractedData.rows?.[0]);
        console.log('Row data keys:', data.data.extractedData.rows?.[0] ? Object.keys(data.data.extractedData.rows[0]) : 'No rows');
        console.log('Metadata:', data.data.extractedData.metadata);
        console.log('====================');
        
        setExtractedData(data.data.extractedData);
        setSuccess('PDF content extracted successfully!');
      } else {
        setError(data.message || 'Failed to extract PDF content');
      }
    } catch (error) {
      console.error('Error extracting PDF:', error);
      setError(error.message || 'An error occurred while extracting PDF content');
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

    console.log('Preparing CSV download...');
    console.log('Headers:', extractedData.headers);
    console.log('Sample row for CSV:', extractedData.rows[0]);

    const csvContent = [
      extractedData.headers.join(','),
      ...extractedData.rows.map((row, rowIndex) => 
        extractedData.headers.map((header, colIndex) => {
          // Use the same data access logic as the table
          let value = '';
          if (row.data && row.data[header]) {
            value = row.data[header];
          } else if (row[header]) {
            value = row[header];
          } else if (Array.isArray(row) && row[colIndex]) {
            value = row[colIndex];
          } else if (row.originalRow && row.originalRow[colIndex]) {
            value = row.originalRow[colIndex];
          } else if (Array.isArray(row) && colIndex < row.length) {
            value = row[colIndex];
          }
          
          const stringValue = value ? value.toString() : '';
          console.log(`CSV Row ${rowIndex}, Column ${header}:`, stringValue);
          
          return stringValue.includes(',') 
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    console.log('CSV content preview:', csvContent.substring(0, 500));

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

          {/* Enhanced Metadata */}
          {extractedData.metadata && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-700">Rows:</span>
                  <span className="ml-2 text-gray-900">{extractedData.metadata.totalRows || extractedData.rows?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Columns:</span>
                  <span className="ml-2 text-gray-900">{extractedData.headers?.length || 0}</span>
                </div>
                {extractedData.metadata.isMultiPage && (
                  <div>
                    <span className="font-medium text-gray-700">Pages:</span>
                    <span className="ml-2 text-blue-600 font-semibold">{extractedData.metadata.totalPages || 1}</span>
                  </div>
                )}
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

              {/* Spatial Grouping Details */}
              {extractedData.structuredTables && extractedData.structuredTables.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                    Spatial Analysis Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {extractedData.structuredTables.map((table, tableIndex) => (
                      <div key={tableIndex} className="bg-white p-3 rounded border border-indigo-200">
                        <div className="font-medium text-indigo-700 mb-2 flex items-center">
                          {table.page === 'all' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                              Combined Table
                            </>
                          ) : (
                            `Page ${table.page}`
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Headers:</span>
                            <span className="font-medium">{table.headers?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Rows:</span>
                            <span className="font-medium">{table.rows?.length || 0}</span>
                          </div>
                          {table.metadata?.originalElements && (
                            <div className="flex justify-between">
                              <span>Text Elements:</span>
                              <span className="font-medium">{table.metadata.originalElements}</span>
                            </div>
                          )}
                          {table.metadata?.columnCount && (
                            <div className="flex justify-between">
                              <span>Columns Detected:</span>
                              <span className="font-medium text-blue-600">{table.metadata.columnCount}</span>
                            </div>
                          )}
                          {table.metadata?.processedRows && (
                            <div className="flex justify-between">
                              <span>Processed Rows:</span>
                              <span className="font-medium">{table.metadata.processedRows}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Multi-page breakdown */}
              {extractedData.metadata.isMultiPage && extractedData.metadata.pageBreakdown && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Page Processing Details:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(extractedData.metadata.pageBreakdown).map(([page, info]) => (
                      <div key={page} className="bg-white p-2 rounded border">
                        <div className="font-medium text-blue-600">Page {page}</div>
                        <div className="text-gray-600">{info.dataRows} data rows</div>
                        {info.hasHeader && <div className="text-green-600">✓ Header detected</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Display */}
          <div className="border rounded-lg overflow-hidden">
            {viewMode === 'table' ? (
              // Enhanced Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        #
                      </th>
                      {extractedData.headers?.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        >
                          <div className="flex items-center">
                            <span>{header}</span>
                            {extractedData.metadata?.issues?.length > 0 && (
                              <AlertCircle className="h-4 w-4 ml-1 text-yellow-500" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {extractedData.rows?.map((row, rowIndex) => {
                      // Handle different row data structures from spatial grouping
                      const getRowData = (row, header, colIndex) => {
                        console.log(`Getting data for row ${rowIndex}, header "${header}", colIndex ${colIndex}:`, row);
                        
                        // Priority 1: Direct array access (from spatial grouping 2D array)
                        if (Array.isArray(row) && colIndex < row.length) {
                          return row[colIndex];
                        }
                        
                        // Priority 2: Object with header keys
                        if (row.data && row.data[header]) {
                          return row.data[header];
                        }
                        if (row[header]) {
                          return row[header];
                        }
                        
                        // Priority 3: Columns array (from our spatial grouping)
                        if (row.columns && Array.isArray(row.columns) && colIndex < row.columns.length) {
                          return row.columns[colIndex];
                        }
                        
                        // Priority 4: Original row data
                        if (row.originalRow && Array.isArray(row.originalRow) && colIndex < row.originalRow.length) {
                          return row.originalRow[colIndex];
                        }
                        
                        // Priority 5: Try to extract from any array-like structure
                        if (typeof row === 'object' && !Array.isArray(row)) {
                          const values = Object.values(row);
                          if (values.length > colIndex) {
                            return values[colIndex];
                          }
                        }
                        
                        return '';
                      };

                      return (
                        <tr 
                          key={rowIndex} 
                          className={`hover:bg-gray-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-500 border-r border-gray-200">
                            {rowIndex + 1}
                          </td>
                          {extractedData.headers?.map((header, colIndex) => {
                            const cellValue = getRowData(row, header, colIndex);
                            const displayValue = formatCellValue(cellValue);
                            
                            return (
                              <td
                                key={colIndex}
                                className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                              >
                                <div className="flex items-center">
                                  <span className={getValueClass(cellValue)}>
                                    {displayValue}
                                  </span>
                                  {row.issues && row.issues.length > 0 && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-red-500" title={row.issues.join(', ')} />
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Table Statistics */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Showing {extractedData.rows?.length || 0} rows × {extractedData.headers?.length || 0} columns
                    </span>
                    {extractedData.metadata?.originalTableRows && (
                      <span>
                        Original PDF had {extractedData.metadata.originalTableRows} rows
                        {extractedData.metadata.headerRowIndex >= 0 && 
                          ` (header at row ${extractedData.metadata.headerRowIndex + 1})`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // JSON View with enhanced debugging
              <div className="p-6">
                {/* Debug Information */}
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Debug Information:</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>Headers count: {extractedData.headers?.length || 0}</div>
                    <div>Rows count: {extractedData.rows?.length || 0}</div>
                    <div>First row type: {extractedData.rows?.[0] ? typeof extractedData.rows[0] : 'N/A'}</div>
                    <div>First row keys: {extractedData.rows?.[0] ? JSON.stringify(Object.keys(extractedData.rows[0])) : 'N/A'}</div>
                    {extractedData.rows?.[0] && (
                      <div>Sample row structure: {JSON.stringify(extractedData.rows[0], null, 2).substring(0, 200)}...</div>
                    )}
                  </div>
                </div>
                
                {/* Full JSON */}
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

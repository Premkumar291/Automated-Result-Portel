import React, { useState } from 'react';
import { Upload, Download, FileText, Table, AlertTriangle, CheckCircle, Eye, RefreshCw } from 'lucide-react';

const TableReconstructor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
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
      } else {
        setError('Please drop a valid PDF file');
      }
    }
  };

  const reconstructTable = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resultPDF', file);

      const response = await fetch('/api/result/reconstruct-table', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to reconstruct table');
      }
    } catch (error) {
      console.error('Error reconstructing table:', error);
      setError('An error occurred while processing the PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reconstructed_table_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSV = () => {
    if (!result || !result.headers || !result.rows) return;

    const csvContent = [
      result.headers.join(','),
      ...result.rows.map(row => 
        result.headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    const exportFileDefaultName = `reconstructed_table_${Date.now()}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Table className="mr-2" />
          PDF Table Reconstructor
        </h2>
        <p className="text-gray-600">
          Upload a PDF to reconstruct its content into a clean tabular format with proper headers and JSON output.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="mb-4">
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <span className="text-lg font-medium text-gray-700">
              Click to upload or drag and drop a PDF file
            </span>
            <input
              id="pdf-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
        
        {file && (
          <div className="text-sm text-gray-600 mb-4">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <button
          onClick={reconstructTable}
          disabled={!file || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Reconstruct Table
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {/* Metadata Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Eye className="mr-2" />
              Processing Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Rows:</span>
                <div className="font-semibold">{result.metadata.totalRows}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className={`font-semibold ${getConfidenceColor(result.metadata.confidence)}`}>
                  {getConfidenceLabel(result.metadata.confidence)} ({(result.metadata.confidence * 100).toFixed(1)}%)
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Format:</span>
                <div className="font-semibold">{result.metadata.detectedFormat}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ambiguous Rows:</span>
                <div className="font-semibold text-yellow-600">{result.metadata.ambiguousRows.length}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </button>
          </div>

          {/* Table Preview */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Reconstructed Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {result.headers.map((header, index) => (
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
                  {result.rows.slice(0, 20).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {result.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.rows.length > 20 && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                  Showing first 20 rows of {result.rows.length} total rows
                </div>
              )}
            </div>
          </div>

          {/* Ambiguous Rows Section */}
          {result.metadata.ambiguousRows && result.metadata.ambiguousRows.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-yellow-800">
                <AlertTriangle className="mr-2" />
                Ambiguous Rows for Manual Review
              </h3>
              <div className="space-y-2">
                {result.metadata.ambiguousRows.map((ambiguous, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Line {ambiguous.lineNumber}:</div>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                      {ambiguous.content}
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">
                      Issues: {ambiguous.issues.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors Section */}
          {result.metadata.errors && result.metadata.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-red-800">
                <AlertTriangle className="mr-2" />
                Processing Errors
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {result.metadata.errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableReconstructor;

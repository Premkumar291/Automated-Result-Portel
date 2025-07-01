import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, Eye, Loader2 } from 'lucide-react';
import { uploadAndExtractPDF, saveProcessedResult, exportToCSV } from '../../api/processedResult';

const FacultyResultUploader = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [tempId, setTempId] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setExtractedData(null);
      setShowPreview(false);
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
        setShowPreview(false);
      } else {
        setError('Please drop a valid PDF file');
      }
    }
  };

  const uploadAndExtract = async () => {
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
        setExtractedData(data.data);
        setTempId(data.data.tempId);
        setShowConfirmation(true);
      } else {
        setError(data.message || 'Failed to process PDF');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('An error occurred while processing the PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDecision = async (shouldSave) => {
    if (!tempId) return;

    try {
      const data = await saveProcessedResult(tempId, shouldSave ? 'save' : 'discard');

      if (data.success) {
        if (shouldSave) {
          setSuccess('Data saved to database successfully!');
        } else {
          setSuccess('Data discarded successfully');
        }
        setShowConfirmation(false);
        setShowPreview(true);
      } else {
        setError(data.message || 'Failed to process your decision');
      }
    } catch (error) {
      console.error('Error saving decision:', error);
      setError('An error occurred while processing your decision');
    }
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setShowConfirmation(false);
    setShowPreview(false);
    setError('');
    setSuccess('');
    setTempId(null);
  };

  const downloadCSV = () => {
    if (!extractedData) return;

    try {
      const fileName = `extracted_data_${Date.now()}.csv`;
      exportToCSV(extractedData.extractedData, fileName);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError('Failed to download CSV file');
    }
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
          <Upload className="mr-2" />
          Faculty Result Upload
        </h2>
        <p className="text-gray-600">
          Upload PDF files containing result tables. The system will extract the data and ask for confirmation before saving.
        </p>
      </div>

      {/* File Upload Area */}
      {!processing && !showConfirmation && !showPreview && (
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
            onClick={uploadAndExtract}
            disabled={!file}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Process PDF
          </button>
        </div>
      )}

      {/* Processing Spinner */}
      {processing && (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing PDF...</h3>
          <p className="text-gray-600">
            Extracting data from your PDF file. This may take a few moments.
          </p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && extractedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                PDF Processing Complete
              </h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Processing Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Processing Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File:</span>
                  <div className="font-semibold">{extractedData.fileName}</div>
                </div>
                <div>
                  <span className="text-gray-600">Rows Extracted:</span>
                  <div className="font-semibold">{extractedData.preview.totalRows}</div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <div className={`font-semibold ${getConfidenceColor(extractedData.preview.confidence)}`}>
                    {getConfidenceLabel(extractedData.preview.confidence)} ({(extractedData.preview.confidence * 100).toFixed(1)}%)
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Method:</span>
                  <div className="font-semibold">{extractedData.preview.extractionMethod}</div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Data Preview (First 10 rows)</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {extractedData.extractedData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {extractedData.preview.sampleRows.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {extractedData.extractedData.headers.map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {extractedData.preview.totalRows > 10 && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Showing first 10 rows of {extractedData.preview.totalRows} total rows
                </p>
              )}
            </div>

            {/* Confirmation Question */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">Save to Database?</h4>
              </div>
              <p className="text-blue-700 mb-4">
                Do you want to save this extracted data to the database? You can review the preview above before deciding.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleSaveDecision(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Yes, Save to Database
                </button>
                <button
                  onClick={() => handleSaveDecision(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  No, Discard Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section (after decision) */}
      {showPreview && extractedData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Data Preview</h3>
            <div className="flex space-x-4">
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Upload New File
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Eye className="mr-2" />
              Extraction Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Rows:</span>
                <div className="font-semibold">{extractedData.extractedData.metadata.totalRows}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className={`font-semibold ${getConfidenceColor(extractedData.extractedData.metadata.confidence)}`}>
                  {getConfidenceLabel(extractedData.extractedData.metadata.confidence)} ({(extractedData.extractedData.metadata.confidence * 100).toFixed(1)}%)
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Method:</span>
                <div className="font-semibold">{extractedData.extractedData.metadata.extractionMethod}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Pages:</span>
                <div className="font-semibold">{extractedData.extractedData.metadata.pageCount || 1}</div>
              </div>
            </div>
          </div>

          {/* Full Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="font-semibold">Complete Extracted Data</h4>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {extractedData.extractedData.headers.map((header, index) => (
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
                  {extractedData.extractedData.rows.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {extractedData.extractedData.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issues Section */}
          {extractedData.extractedData.metadata.issues && extractedData.extractedData.metadata.issues.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center text-yellow-800">
                <AlertCircle className="mr-2" />
                Processing Notes
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {extractedData.extractedData.metadata.issues.map((issue, index) => (
                  <li key={index} className="text-yellow-700">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyResultUploader;

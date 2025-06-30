// PDF Upload Component
import { useState, useRef } from 'react';
import { uploadPDF, savePDF } from '../../api/pdf';

const PDFUpload = ({ onUploadSuccess, onError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    filename: '',
    description: ''
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        onError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        filename: file.name.replace('.pdf', '')
      }));
      onError(''); // Clear any previous errors
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        onError('Please drop a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        filename: file.name.replace('.pdf', '')
      }));
      onError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file first');
      return;
    }

    if (!uploadForm.filename.trim()) {
      onError('Please enter a filename');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload and process the PDF
      const uploadResponse = await uploadPDF(selectedFile);
      
      // Save PDF with metadata
      const saveResponse = await savePDF({
        filename: uploadForm.filename,
        description: uploadForm.description,
        analysisData: uploadResponse.analysisData
      });

      // Reset form
      setSelectedFile(null);
      setUploadForm({ filename: '', description: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess(saveResponse);
    } catch (error) {
      onError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadForm({ filename: '', description: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload PDF Result</h2>
      
      {/* File Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors"
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">{selectedFile.name}</span>
              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg text-gray-600 mb-2">Drop your PDF file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Choose File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      {selectedFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filename *
            </label>
            <input
              type="text"
              value={uploadForm.filename}
              onChange={(e) => setUploadForm(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter filename"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !uploadForm.filename.trim()}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading & Analyzing...</span>
              </div>
            ) : (
              'Upload & Analyze PDF'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;

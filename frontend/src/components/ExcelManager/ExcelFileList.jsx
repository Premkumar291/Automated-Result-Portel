import { useState } from 'react';
import { downloadExcelFile, deleteExcelFile } from '../../api/pdfAnalysis';

const ExcelFileList = ({ files, onFileDeleted, onError }) => {
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  const handleDownload = async (file) => {
    setDownloadingFiles(prev => new Set(prev).add(file._id));
    
    try {
      await downloadExcelFile(file._id, file.fileName);
    } catch (downloadError) {
      onError?.({ message: `Failed to download ${file.fileName}` });
      console.error('Download error:', downloadError);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file._id);
        return newSet;
      });
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(file._id));
    
    try {
      await deleteExcelFile(file._id);
      onFileDeleted?.(file._id);
    } catch (deleteError) {
      onError?.({ message: `Failed to delete ${file.fileName}` });
      console.error('Delete error:', deleteError);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file._id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 21h6m-6 4h6m-6 4h6m-6 4h6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Excel Files Found</h3>
        <p className="text-gray-500">Upload a PDF file to generate Excel reports by semester.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 21h6m-6 4h6m-6 4h6m-6 4h6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {file.semester}
                    </span>
                    <span>{formatDate(file.createdAt)}</span>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                    <span>Students: {file.studentCount || 0}</span>
                    <span>Subjects: {file.subjectCount || 0}</span>
                    <span>From: {file.originalPdfName}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleDownload(file)}
                disabled={downloadingFiles.has(file._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloadingFiles.has(file._id) ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleDelete(file)}
                disabled={deletingFiles.has(file._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletingFiles.has(file._id) ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExcelFileList;

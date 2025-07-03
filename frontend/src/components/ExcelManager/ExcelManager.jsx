import { useState, useEffect } from 'react';
import { getExcelFiles } from '../../api/pdfAnalysis';
import SemesterDropdown from './SemesterDropdown';
import ExcelFileList from './ExcelFileList';

const ExcelManager = ({ refreshTrigger = 0 }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [selectedSemester, refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExcelFiles(selectedSemester);
      setFiles(response.data || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to fetch Excel files');
      console.error('Fetch files error:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDeleted = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
  };

  const handleError = (errorInfo) => {
    setError(errorInfo.message);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Excel files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Excel File Manager</h2>
          <p className="text-gray-600 mt-1">
            Manage your generated Excel files organized by semester
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <SemesterDropdown 
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 21h6m-6 4h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Files</p>
              <p className="text-2xl font-bold text-blue-600">{files.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Students</p>
              <p className="text-2xl font-bold text-green-600">
                {files.reduce((total, file) => total + (file.studentCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">File Size</p>
              <p className="text-2xl font-bold text-purple-600">
                {(files.reduce((total, file) => total + (file.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-gray-50 rounded-lg p-6">
        <ExcelFileList 
          files={files}
          onFileDeleted={handleFileDeleted}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default ExcelManager;

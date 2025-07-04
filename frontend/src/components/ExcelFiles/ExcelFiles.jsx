import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ExcelFiles = () => {
  const [excelFiles, setExcelFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {fileId, fileName}

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pdf-analysis/excel-files?semester=${selectedSemester}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Excel files');
        }

        const data = await response.json();
        setExcelFiles(data.data || []);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load Excel files');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSemester]);

  const fetchExcelFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pdf-analysis/excel-files?semester=${selectedSemester}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Excel files');
      }

      const data = await response.json();
      setExcelFiles(data.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load Excel files');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcelFile = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/pdf-analysis/download/${fileId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Excel file');
      console.error('Download error:', error);
    }
  };

  const deleteExcelFile = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/pdf-analysis/excel-files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete Excel file');
      }

      toast.success('Excel file deleted successfully');
      
      // Remove the file from the local state
      setExcelFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
      setDeleteConfirm(null); // Close the confirmation modal
    } catch (error) {
      toast.error('Failed to delete Excel file');
      console.error('Delete error:', error);
    }
  };

  const handleDeleteClick = (fileId, fileName) => {
    console.log('Delete button clicked:', fileId, fileName); // Debug log
    setDeleteConfirm({ fileId, fileName });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSemesterOptions = () => {
    const semesters = [...new Set(excelFiles.map(file => file.semester))].sort();
    return semesters;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Excel files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchExcelFiles}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Excel Files</h3>
          <p className="text-sm text-gray-600">Download and manage your generated Excel files</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Semesters</option>
            {getSemesterOptions().map(semester => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchExcelFiles}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {excelFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Excel Files Found</h3>
          <p className="text-gray-600">Upload and analyze a PDF to generate Excel files</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {excelFiles.map(file => (
            <div key={file._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{file.fileName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Semester {file.semester}</span>
                        <span>•</span>
                        <span>{file.studentCount} students</span>
                        <span>•</span>
                        <span>{file.subjectCount} subjects</span>
                        <span>•</span>
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Semester {file.semester}
                  </span>
                  <button
                    onClick={() => downloadExcelFile(file._id, file.fileName)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteClick(file._id, file.fileName)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Excel File</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.fileName}"</span>?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteExcelFile(deleteConfirm.fileId, deleteConfirm.fileName)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info - remove this later */}
      {console.log('deleteConfirm state:', deleteConfirm)}
    </div>
  );
};

export default ExcelFiles;

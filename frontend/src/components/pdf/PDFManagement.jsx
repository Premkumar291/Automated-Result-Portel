import { useState, useEffect } from 'react';
import { 
  getUserPDFs, 
  savePDF, 
  analyzePDF, 
  updatePDFInfo, 
  downloadPDF, 
  deletePDF 
} from '../../api/pdf';

const PDFManagement = ({ onPDFSelect, selectedPDFId }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [analyzing, setAnalyzing] = useState({});

  // Form states
  const [uploadForm, setUploadForm] = useState({
    file: null,
    filename: '',
    description: ''
  });
  const [editForm, setEditForm] = useState({
    filename: '',
    description: ''
  });

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      const response = await getUserPDFs();
      setPdfs(response.pdfs || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setError('Please select a PDF file');
      return;
    }

    try {
      const filename = uploadForm.filename || uploadForm.file.name;
      await savePDF(uploadForm.file, filename, uploadForm.description);
      
      setUploadModalOpen(false);
      setUploadForm({ file: null, filename: '', description: '' });
      loadPDFs();
    } catch (err) {
      setError(err.message || 'Failed to upload PDF');
    }
  };

  const handleAnalyze = async (pdfId) => {
    try {
      setAnalyzing(prev => ({ ...prev, [pdfId]: true }));
      setError('');
      
      const response = await analyzePDF(pdfId);
      
      // Refresh the PDF list to get updated status
      loadPDFs();
      
      // Always trigger the callback when analysis is successful
      if (onPDFSelect && response.gradeAnalysis) {
        onPDFSelect(response.gradeAnalysis);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to analyze PDF');
    } finally {
      setAnalyzing(prev => ({ ...prev, [pdfId]: false }));
    }
  };

  const handleEdit = (pdf) => {
    setSelectedPDF(pdf);
    setEditForm({
      filename: pdf.filename,
      description: pdf.description || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updatePDFInfo(selectedPDF.id, editForm.filename, editForm.description);
      setEditModalOpen(false);
      loadPDFs();
    } catch (err) {
      setError(err.message || 'Failed to update PDF');
    }
  };

  const handleDownload = async (pdf) => {
    try {
      await downloadPDF(pdf.id, pdf.filename);
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    }
  };

  const handleDelete = async (pdfId) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    
    try {
      await deletePDF(pdfId);
      loadPDFs();
    } catch (err) {
      setError(err.message || 'Failed to delete PDF');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return 'text-green-600 bg-green-50';
      case 'analyzing': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading PDFs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PDF Management</h2>
          <p className="text-gray-600 mt-1">Upload, manage, and analyze your result PDFs</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New PDF
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* PDF List */}
      {pdfs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs uploaded yet</h3>
          <p className="text-gray-500 mb-6">Upload your first result PDF to get started with analysis</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Upload Your First PDF
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PDF Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pdfs.map((pdf) => (
                  <tr 
                    key={pdf.id} 
                    className={`hover:bg-gray-50 ${selectedPDFId === pdf.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pdf.filename}</div>
                          <div className="text-sm text-gray-500">{pdf.description || 'No description'}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(pdf.fileSize)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pdf.status)}`}>
                        {pdf.status}
                      </span>
                      {analyzing[pdf.id] && (
                        <div className="mt-1 flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-xs text-blue-600">Analyzing...</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pdf.isAnalyzed ? (
                        <div className="space-y-1">
                          <div>Subjects: {pdf.statistics?.totalSubjects || 0}</div>
                          <div>Students: {pdf.statistics?.totalStudents || 0}</div>
                          <div>Pass Rate: {pdf.statistics?.overallPassRate?.toFixed(1) || 0}%</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not analyzed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pdf.uploadDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!pdf.isAnalyzed && (
                          <button
                            onClick={() => handleAnalyze(pdf.id)}
                            disabled={analyzing[pdf.id]}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="Analyze PDF"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                        )}
                        {pdf.isAnalyzed && (
                          <button
                            onClick={() => onPDFSelect && onPDFSelect(pdf)}
                            className="text-green-600 hover:text-green-800"
                            title="View Analysis"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(pdf)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit PDF Info"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownload(pdf)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Download PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(pdf.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New PDF</h3>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      file: e.target.files[0],
                      filename: prev.filename || e.target.files[0]?.name || ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={uploadForm.filename}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, filename: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter filename"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedPDF && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit PDF Info</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={editForm.filename}
                    onChange={(e) => setEditForm(prev => ({ ...prev, filename: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFManagement;

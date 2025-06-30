// PDF List Component
import { useState } from 'react';
import { downloadPDF, deletePDF, analyzePDF } from '../../api/pdf';

const PDFList = ({ pdfs, onPDFSelect, selectedPDFId, onPDFUpdate, onPDFDelete }) => {
  const [analyzing, setAnalyzing] = useState({});
  const [deleting, setDeleting] = useState({});

  const handleAnalyze = async (pdfId) => {
    try {
      setAnalyzing(prev => ({ ...prev, [pdfId]: true }));
      const response = await analyzePDF(pdfId);
      onPDFUpdate(response.pdf);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(prev => ({ ...prev, [pdfId]: false }));
    }
  };

  const handleDownload = async (pdfId, filename) => {
    try {
      await downloadPDF(pdfId, filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    try {
      setDeleting(prev => ({ ...prev, [pdfId]: true }));
      await deletePDF(pdfId);
      onPDFDelete(pdfId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(prev => ({ ...prev, [pdfId]: false }));
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

  const getAnalysisStatus = (pdf) => {
    if (!pdf.analysisData) return 'pending';
    if (pdf.analysisData.subjects?.length > 0) return 'completed';
    return 'failed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (pdfs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No PDFs uploaded yet</h3>
        <p className="text-gray-500">Upload your first PDF result to get started with analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Your PDF Results</h2>
        <p className="text-sm text-gray-600 mt-1">{pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} uploaded</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pdfs.map((pdf) => {
          const status = getAnalysisStatus(pdf);
          const isSelected = selectedPDFId === pdf._id;
          
          return (
            <div
              key={pdf._id}
              className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onPDFSelect(pdf)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {pdf.filename}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  {pdf.description && (
                    <p className="text-sm text-gray-600 mb-2">{pdf.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Uploaded: {formatDate(pdf.uploadDate)}</span>
                    {pdf.analysisData?.totalSubjects && (
                      <span>{pdf.analysisData.totalSubjects} subjects</span>
                    )}
                    {pdf.analysisData?.cgpa && (
                      <span>CGPA: {pdf.analysisData.cgpa}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyze(pdf._id);
                      }}
                      disabled={analyzing[pdf._id]}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {analyzing[pdf._id] ? 'Analyzing...' : 'Analyze'}
                    </button>
                  )}
                  
                  {status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyze(pdf._id);
                      }}
                      disabled={analyzing[pdf._id]}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
                    >
                      {analyzing[pdf._id] ? 'Re-analyzing...' : 'Re-analyze'}
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(pdf._id, pdf.filename);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Download PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pdf._id);
                    }}
                    disabled={deleting[pdf._id]}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete PDF"
                  >
                    {deleting[pdf._id] ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFList;

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PDFUpload } from '../PDFUpload';
import { ExcelManager } from '../ExcelManager';
import { ResultAnalysis } from '../ResultAnalysis';
import { analyzePDF } from '../../api/pdfAnalysis';

const ResultsManager = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle PDF upload and analysis
  const handlePDFUpload = useCallback(async (file) => {
    setIsLoading(true);
    try {
      const result = await analyzePDF(file);
      
      console.log('Full API response:', result);
      
      // The result should contain semesters, student_info, and analysis_summary
      const analysisData = {
        semesters: result.semesters || {},
        student_info: result.student_info || {},
        analysis_summary: result.analysis_summary || '',
        excelFiles: result.data?.excelFiles || []
      };
      
      console.log('Processed analysis data:', analysisData);
      
      setAnalysisData(analysisData);
      setActiveTab('analysis');
      toast.success('PDF analyzed successfully!');
      
      // Refresh Excel manager to show new files
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast.error(error.message || 'Failed to analyze PDF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Excel file generation success
  const handleExcelGenerated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.success('Excel files generated successfully!');
  }, []);

  const tabs = [
    { id: 'upload', label: 'Upload PDF', icon: '📄' },
    { id: 'analysis', label: 'Result Analysis', icon: '📊' },
    { id: 'excel', label: 'Excel Manager', icon: '📁' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Academic Results Management
        </h1>
        <p className="text-gray-600">
          Upload PDF results, analyze with AI, and manage Excel files by semester
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'upload' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upload PDF Results
              </h2>
              <p className="text-gray-600">
                Upload your academic result PDF to extract and analyze grades using AI
              </p>
            </div>
            <PDFUpload 
              onUpload={handlePDFUpload}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Result Analysis
              </h2>
              <p className="text-gray-600">
                AI-powered analysis of your academic results with detailed insights
              </p>
            </div>
            <ResultAnalysis 
              analysisData={analysisData}
              onExcelGenerated={handleExcelGenerated}
            />
          </div>
        )}

        {activeTab === 'excel' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Excel File Manager
              </h2>
              <p className="text-gray-600">
                Manage, download, and organize your Excel files by semester
              </p>
            </div>
            <ExcelManager 
              key={refreshKey}
              onFileDeleted={() => setRefreshKey(prev => prev + 1)}
            />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Analyzing PDF...</h3>
              <p className="text-gray-600">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManager;

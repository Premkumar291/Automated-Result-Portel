import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../api/auth";
import { getPDFAnalysis } from "../../api/pdf";
import PDFUploadAndViewer from "../pdf/pdf-upload-viewer";
import StatisticsCards from "./StatisticsCards";
import SubjectAnalysis from "./SubjectAnalysis";
import PDFManagement from "./PDFManagement";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [pdfData, setPdfData] = useState(null);
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [gradeAnalysis, setGradeAnalysis] = useState(null);
  const [selectedPDFId, setSelectedPDFId] = useState(null);
  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await checkAuth();
        setUser(response.user);
      } catch {
        navigate("/login");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle PDF upload completion
  const handlePdfUpload = (data) => {
    setPdfData(data);
    setIsPdfUploaded(true);
    
    // Extract grade analysis if available
    if (data && data.gradeAnalysis) {
      setGradeAnalysis(data.gradeAnalysis);
    }
  };

  // Handle PDF selection from management component
  const handlePDFSelection = async (pdfData) => {
    if (pdfData && pdfData.id) {
      // If it's a PDF object with ID, fetch its analysis
      try {
        const response = await getPDFAnalysis(pdfData.id);
        setGradeAnalysis(response.gradeAnalysis);
        setPdfData(response.extractedData);
        setIsPdfUploaded(true);
        setSelectedPDFId(pdfData.id);
        setActiveSection('analysis'); // Auto switch to analysis view
      } catch (error) {
        console.error('Failed to load PDF analysis:', error);
      }
    } else {
      // If it's analysis data directly
      setGradeAnalysis(pdfData);
      setIsPdfUploaded(true);
      setActiveSection('analysis'); // Auto switch to analysis view
    }
  };

  // Handle PDF data clearing
  const handlePdfClear = () => {
    setPdfData(null);
    setIsPdfUploaded(false);
    setGradeAnalysis(null);
    setSelectedPDFId(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header - Full Width */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Result Analysis Portal</h1>
                <p className="text-sm text-gray-500">Student Performance Analysis System</p>
              </div>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'dashboard' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('pdf-extractor')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'pdf-extractor' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Upload & Extract
              </button>
              <button
                onClick={() => setActiveSection('pdf-management')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'pdf-management' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Database PDFs
              </button>
              <button
                onClick={() => setActiveSection('analysis')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'analysis' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Statistical Analysis
              </button>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user ? user.name : 'User'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Full Width */}
      <div className="md:hidden bg-white border-b border-gray-200 w-full">
        <div className="w-full px-6">
          <div className="flex space-x-2 py-3 overflow-x-auto">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeSection === 'dashboard' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('pdf-extractor')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeSection === 'pdf-extractor' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              Upload & Extract
            </button>
            <button
              onClick={() => setActiveSection('pdf-management')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeSection === 'pdf-management' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              Database PDFs
            </button>
            <button
              onClick={() => setActiveSection('analysis')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeSection === 'analysis' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              Statistical Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <main className="w-full px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Content based on active section */}
        {activeSection === 'pdf-extractor' ? (
          <PDFUploadAndViewer 
            onDataExtracted={handlePdfUpload}
            onClearData={handlePdfClear}
          />
        ) : activeSection === 'pdf-management' ? (
          <PDFManagement 
            onPDFSelect={handlePDFSelection}
            selectedPDFId={selectedPDFId}
          />
        ) : activeSection === 'analysis' ? (
          <SubjectAnalysis 
            gradeAnalysis={gradeAnalysis}
            isVisible={isPdfUploaded}
          />
        ) : (
          <>
            {/* Loading State */}
            {userLoading ? (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Welcome Section - Full Width */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden w-full">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-3">
                      Welcome back, {user ? user.name : 'User'}! 👋
                    </h2>
                    <p className="text-gray-300 text-lg mb-6">
                      Upload and process student result files with statistical analysis
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setActiveSection('pdf-extractor')}
                        className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload & Extract
                      </button>
                      <button 
                        onClick={() => setActiveSection('analysis')}
                        className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                      >
                        View Analysis
                      </button>
                    </div>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white bg-opacity-5 rounded-full translate-y-16 translate-x-16"></div>
                </div>

                {/* Statistics Cards - Show after PDF upload */}
                <StatisticsCards 
                  pdfData={pdfData} 
                  isVisible={isPdfUploaded} 
                />

                {/* Bottom Section - Full Width Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                  {/* Upload Center */}
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Result Files</h3>
                      <p className="text-gray-600 mb-6">
                        Drag and drop your result files here, or click to browse.
                      </p>
                      <button
                        onClick={() => setActiveSection('pdf-extractor')}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        Choose Files to Upload
                      </button>
                    </div>
                  </div>

                  {/* Quick Analytics */}
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <span className="font-medium text-gray-700">Files Processed</span>
                        <span className="text-2xl font-bold text-blue-600">{isPdfUploaded ? '1' : '0'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <span className="font-medium text-gray-700">Analysis Ready</span>
                        <span className="text-2xl font-bold text-green-600">{gradeAnalysis ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">
                          {!isPdfUploaded 
                            ? "Upload result files to view detailed statistics" 
                            : "Statistical analysis available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
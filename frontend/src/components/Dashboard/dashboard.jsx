import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { logout, checkAuth } from "../../api/auth";
import PDFUpload from "../PDFUpload/PDFUpload";
import ResultAnalysis from "../ResultAnalysis/ResultAnalysis";
import ExcelFiles from "../ExcelFiles/ExcelFiles";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
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

  const handlePDFUploadSuccess = (result) => {
    console.log("PDF Analysis Result:", result);
    
    // Check if the result contains valid data
    if (result && result.success) {
      setAnalysisData(result);
      setShowAnalysis(true);
      toast.success("PDF analyzed successfully!");
      
      // Show additional info if available
      if (result.analysis_summary) {
        setTimeout(() => {
          toast.success(result.analysis_summary, { duration: 5000 });
        }, 1000);
      }
    } else {
      // Handle case where result exists but indicates failure
      const errorMsg = result?.message || "PDF analysis completed but no valid data was extracted.";
      toast.error(errorMsg);
      setError(errorMsg);
      
      // Still show the result for debugging
      setAnalysisData(result);
      setShowAnalysis(true);
    }
  };

  const handlePDFUploadError = (error) => {
    console.error("PDF Upload Error:", error);
    
    let errorMessage = "Failed to analyze PDF. Please try again.";
    
    // Provide more specific error messages
    if (error.message) {
      if (error.message.includes('extract text')) {
        errorMessage = "Could not extract text from PDF. Please ensure the PDF contains readable text and is not image-based.";
      } else if (error.message.includes('AI analysis')) {
        errorMessage = "AI analysis failed. The PDF format may not be supported. Please try a different PDF.";
      } else if (error.message.includes('No student data')) {
        errorMessage = "No student result data found in the PDF. Please ensure the PDF contains academic results with student names, roll numbers, and grades.";
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage, { duration: 6000 });
    setError(errorMessage);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  College Result Portal
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to College Result Portal
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Your central hub for managing and accessing college results and academic information.
              </p>
            </div>
          </div>

          {/* PDF Upload and Analysis Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Result Analysis</h3>
                <p className="text-gray-600">Upload your academic result PDF and get instant AI analysis with Excel generation</p>
              </div>
              
              <PDFUpload 
                onUploadSuccess={handlePDFUploadSuccess}
                onUploadError={handlePDFUploadError}
              />
            </div>
          </div>

          {/* Analysis Results Display */}
          {showAnalysis && analysisData && (
            <div className="mb-8">
              <ResultAnalysis analysisData={analysisData} />
            </div>
          )}

          {/* Excel Files Display */}
          <div className="mb-8">
            <ExcelFiles />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Advanced AI extraction of student results from PDFs with 99% accuracy across all 8 semesters.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Page Table Support</h3>
              <p className="text-gray-600">Handles complex multi-page tables and accurately extracts data spanning 2-3 pages per semester.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excel Generation</h3>
              <p className="text-gray-600">Creates separate Excel files for each semester with accurate subject codes and grades.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excel Files Manager</h3>
              <p className="text-gray-600">Download and manage all generated Excel files organized by semester with preview capabilities.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Processing</h3>
              <p className="text-gray-600">Intelligently processes complex PDF layouts with enhanced subject code and grade recognition.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All 8 Semesters</h3>
              <p className="text-gray-600">Comprehensive extraction of all 8 semesters with separate Excel files for each semester.</p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user?.name || 'Not available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email || 'Not available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

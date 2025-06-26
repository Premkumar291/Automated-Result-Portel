import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../api/auth";
import PDFUploadAndViewer from "../pdf/pdf-upload-viewer";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await checkAuth();
        setUser(response.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
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
    } catch (error) {
      setError("Logout failed. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">
                College Result Portal
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {userLoading ? (
                    "Loading..."
                  ) : user ? (
                    `Welcome, ${user.name}!`
                  ) : (
                    "Welcome back!"
                  )}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('pdf-extractor')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'pdf-extractor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              PDF Result Extractor
            </button>
          </nav>
        </div>

        {/* Content based on active section */}
        {activeSection === 'pdf-extractor' ? (
          <PDFUploadAndViewer />
        ) : (
          <>
            {/* Loading State */}
            {userLoading ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-8 mb-8">
                  <div className="text-center">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow p-8 mb-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {user ? (
                        `Welcome back, ${user.name}!`
                      ) : (
                        "Welcome to Your Dashboard!"
                      )}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {user && user.department ? (
                        `${user.department} Department - Your gateway to automated result management`
                      ) : (
                        "Your gateway to automated result management and analysis"
                      )}
                    </p>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Card 1 - PDF Extractor */}
                  <div 
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveSection('pdf-extractor')}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Result Extractor</h3>
                    <p className="text-gray-600 text-sm">
                      Upload and extract structured data from PDF result documents
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                    <p className="text-gray-600 text-sm">
                      Generate comprehensive reports and analytics on student performance
                    </p>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-2 inline-block">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

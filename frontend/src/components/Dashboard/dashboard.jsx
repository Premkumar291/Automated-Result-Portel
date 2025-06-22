import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../api/auth";

// SVG icons
const LogoutIcon = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const UserIcon = (
  <svg
    className="w-8 h-8 text-[#ec4899]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5a8.25 8.25 0 0115 0"
    />
  </svg>
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const data = await checkAuth();
        console.log('User data received:', data);
        
        if (data.success) {
          setUser(data.user);
        } else {
          console.log('Auth check failed, redirecting to login...');
          navigate("/login");
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate("/login");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    setError("");
    setIsLoading(true);

    try {
      console.log('Starting logout process...');
      const data = await logout();
      console.log('Logout response received:', data);
      
      if (data.success) {
        console.log('Logout successful, redirecting to login...');
        navigate("/login");
      } else {
        setError(data.message || "Logout failed");
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || "Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#2e1065]">
                College Result Portal
              </h1>
            </div>            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {UserIcon}
                <span className="text-sm font-medium text-[#2e1065]">
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#ec4899] hover:bg-pink-600 text-white hover:shadow-lg active:translate-y-[1px] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    {LogoutIcon}
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {userLoading ? (
          <div className="space-y-6">
            {/* Loading Welcome Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#ec4899]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>            <h2 className="text-3xl font-bold text-[#2e1065] mb-2">
              {userLoading ? (
                "Loading Dashboard... 🎓"
              ) : user ? (
                `Welcome back, ${user.name}! 🎓`
              ) : (
                "Welcome to Your Dashboard! 🎓"
              )}
            </h2>
            <p className="text-gray-600 text-lg">
              {user && user.department ? (
                `${user.department} Department - Your gateway to automated result management and analysis`
              ) : (
                "Your gateway to automated result management and analysis"
              )}
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#2e1065] mb-2">Upload Results</h3>
            <p className="text-gray-600 text-sm">
              Easily upload and process student result files in various formats
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#2e1065] mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              Generate comprehensive reports and analytics on student performance
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#2e1065] mb-2">Manage Students</h3>
            <p className="text-gray-600 text-sm">
              Organize and manage student information and academic records
            </p>
          </div>
        </div>        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-bold text-[#2e1065] mb-2">
            🚀 More Features Coming Soon!
          </h3>
          <p className="text-gray-600">
            We're working hard to bring you advanced features for result management and analytics.
          </p>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
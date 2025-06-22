import { Link } from "react-router-dom";

// SVG icons
const HomeIcon = (
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
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const SearchIcon = (
  <svg
    className="w-16 h-16 text-gray-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ArrowLeftIcon = (
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
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            {SearchIcon}
          </div>
          
          {/* Large 404 Text */}
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2e1065] to-[#ec4899] mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#2e1065] mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500 text-sm">
            Don't worry, it happens to the best of us! Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Go Home Button */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 bg-[#ec4899] hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg active:translate-y-[1px] active:scale-[0.98]"
          >
            {HomeIcon}
            <span>Go to Dashboard</span>
          </Link>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md active:translate-y-[1px] active:scale-[0.98]"
          >
            {ArrowLeftIcon}
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-4">
            Or try one of these helpful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/login"
              className="text-[#ec4899] hover:text-pink-600 hover:underline transition-colors duration-200"
            >
              Login
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/signup"
              className="text-[#ec4899] hover:text-pink-600 hover:underline transition-colors duration-200"
            >
              Sign Up
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/forgot-password"
              className="text-[#ec4899] hover:text-pink-600 hover:underline transition-colors duration-200"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          <span className="font-semibold text-[#2e1065]">College Result Portal</span> - 
          Automate Results. Empower Colleges.
        </p>
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse delay-300"></div>
      <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-100 rounded-full opacity-30 animate-pulse delay-700"></div>
      <div className="absolute bottom-20 right-10 w-12 h-12 bg-pink-100 rounded-full opacity-25 animate-pulse delay-500"></div>
    </div>
  );
};

export default PageNotFound;

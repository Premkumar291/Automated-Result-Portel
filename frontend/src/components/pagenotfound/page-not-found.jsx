"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Home, Search, ArrowLeft } from "lucide-react" // Import Lucide icons

const PageNotFound = () => {
// State for theme, assuming it might be controlled externally or from local storage

  // This useEffect is just to simulate theme changes if needed,
  // or to read a default theme from local storage/context if available.
  // For now, it defaults to false (light mode).
  useEffect(() => {
    // You might want to read the theme from a global context or local storage here
    // For example: const savedTheme = localStorage.getItem('theme');
    // if (savedTheme === 'dark') setIsDarkMode(true);
  }, [])

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .theme-transition {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Enhanced Card Shadows - Light */
        .elevated-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(203, 213, 225, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .elevated-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        /* Dark Theme Cards - Massive Innovation */
        .dark-elevated-card {
          background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 8px 25px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 40px rgba(139, 92, 246, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark-elevated-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.95),
            0 12px 35px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 60px rgba(139, 92, 246, 0.2);
        }
        /* Dark Theme Background */
        .dark-bg {
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%);
        }
        /* Dark Theme Text Colors */
        .dark-text-primary {
          color: #ffffff;
        }
        .dark-text-secondary {
          color: rgba(255, 255, 255, 0.8);
        }
        .dark-text-muted {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-4 theme-transition ${
          isDarkMode ? "dark-bg" : "bg-white"
        }`}
      >
        {/* Main Content Card */}
        <div
          className={`${
            isDarkMode ? "dark-elevated-card" : "elevated-card"
          } rounded-xl p-8 sm:p-12 w-full max-w-2xl text-center`}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div
              className={`mx-auto w-32 h-32 ${
                isDarkMode ? "bg-gray-900 text-gray-500" : "bg-gray-100 text-gray-400"
              } rounded-full flex items-center justify-center mb-6`}
            >
              <Search className="w-16 h-16" />
            </div>
            {/* Large 404 Text */}
            <h1
              className={`text-8xl font-extrabold text-transparent bg-clip-text ${
                isDarkMode
                  ? "bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500"
                  : "bg-gradient-to-r from-purple-700 to-pink-600"
              } mb-4`}
            >
              404
            </h1>
          </div>
          {/* Error Message */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${isDarkMode ? "dark-text-primary" : "text-slate-900"} mb-4`}>
              Oops! Page Not Found
            </h2>
            <p className={`text-lg leading-relaxed mb-2 ${isDarkMode ? "dark-text-secondary" : "text-gray-600"}`}>
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className={`text-sm ${isDarkMode ? "dark-text-muted" : "text-gray-500"}`}>
              Don't worry, it happens to the best of us! Let's get you back on track.
            </p>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Go Home Button */}
            <Link
              to="/login-page"
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg active:translate-y-[1px] active:scale-[0.98]
                ${
                  isDarkMode
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
            >
              <Home className="w-5 h-5" />
              <span>Go to Log in page</span>
            </Link>
            {/* Go Back Button */}
            <button
              onClick={() => window.history.back()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md active:translate-y-[1px] active:scale-[0.98]
                ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
          {/* Helpful Links */}
          <div className={`mt-8 pt-8 border-t ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
            <p className={`text-sm mb-4 ${isDarkMode ? "dark-text-muted" : "text-gray-500"}`}>
              Or try one of these helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/login"
                className={`${
                  isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-pink-500 hover:text-pink-600"
                } hover:underline transition-colors duration-200`}
              >
                Login
              </Link>
              <span className={`${isDarkMode ? "text-gray-600" : "text-gray-300"}`}>•</span>
              <Link
                to="/signup"
                className={`${
                  isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-pink-500 hover:text-pink-600"
                } hover:underline transition-colors duration-200`}
              >
                Sign Up
              </Link>
              <span className={`${isDarkMode ? "text-gray-600" : "text-gray-300"}`}>•</span>
              <Link
                to="/forgot-password"
                className={`${
                  isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-pink-500 hover:text-pink-600"
                } hover:underline transition-colors duration-200`}
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            <span className={`font-semibold ${isDarkMode ? "text-purple-400" : "text-purple-700"}`}>
              College Result Portal
            </span>{" "}
            - Automate Results. Empower Colleges.
          </p>
        </div>
        {/* Floating Elements for Visual Appeal */}
        <div
          className={`absolute top-20 left-10 w-16 h-16 ${
            isDarkMode ? "bg-purple-800" : "bg-purple-200"
          } rounded-full opacity-20 animate-pulse`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-24 h-24 ${
            isDarkMode ? "bg-pink-800" : "bg-pink-200"
          } rounded-full opacity-20 animate-pulse delay-300`}
        ></div>
        <div
          className={`absolute bottom-32 left-20 w-20 h-20 ${
            isDarkMode ? "bg-purple-700" : "bg-purple-100"
          } rounded-full opacity-30 animate-pulse delay-700`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-12 h-12 ${
            isDarkMode ? "bg-pink-700" : "bg-pink-100"
          } rounded-full opacity-25 animate-pulse delay-500`}
        ></div>
      </div>
    </>
  )
}

export default PageNotFound


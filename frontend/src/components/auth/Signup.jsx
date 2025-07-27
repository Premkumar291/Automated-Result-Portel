"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// Icons from reference UI (same as login components)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const Signup = () => {
  // All original state and logic preserved
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // Original handleSubmit logic preserved
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!strongPasswordRegex.test(password)) {
      setError("Password must be strong (uppercase, lowercase, number, special char, min 8 chars)")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError("")
    console.log("Signup Details:", { name, email, password })
    navigate("/manage-results") // ✅ Redirect after signup
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <>
      {/* Global dark theme styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          background-color: #000000 !important;
          color: #ffffff !important;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif !important;
          overflow-x: hidden;
        }
        
        body * {
          scrollbar-width: thin;
          scrollbar-color: #374151 #000000;
        }
        
        body *::-webkit-scrollbar {
          width: 8px;
        }
        
        body *::-webkit-scrollbar-track {
          background: #000000;
        }
        
        body *::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 4px;
        }
        
        body *::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563;
        }

        .heading-sweep {
          background-image: linear-gradient(120deg, #ffffff, #ffffff, #3b82f6 40%, #ffffff, #ffffff);
          background-size: 300% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweepLight 3s linear infinite;
        }
        @keyframes sweepLight {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
          animation: float 6s ease-in-out infinite;
          filter: blur(1px);
        }

        .shape-1 {
          width: 120px;
          height: 120px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 180px;
          height: 180px;
          top: 20%;
          right: 10%;
          animation-delay: 1s;
        }

        .shape-3 {
          width: 90px;
          height: 90px;
          bottom: 30%;
          left: 20%;
          animation-delay: 2s;
        }

        .shape-4 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          right: 20%;
          animation-delay: 3s;
        }

        .shape-5 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 5%;
          animation-delay: 4s;
        }

        .shape-6 {
          width: 130px;
          height: 130px;
          top: 70%;
          right: 5%;
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60px) rotate(180deg) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-30px) rotate(270deg) scale(1.1);
            opacity: 0.6;
          }
        }

        .floating-shapes::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(3px 3px at 30px 40px, rgba(59, 130, 246, 0.4), transparent),
            radial-gradient(3px 3px at 60px 90px, rgba(147, 51, 234, 0.4), transparent),
            radial-gradient(2px 2px at 120px 60px, rgba(59, 130, 246, 0.4), transparent),
            radial-gradient(2px 2px at 180px 120px, rgba(147, 51, 234, 0.4), transparent),
            radial-gradient(3px 3px at 240px 50px, rgba(59, 130, 246, 0.4), transparent);
          background-repeat: repeat;
          background-size: 300px 150px;
          animation: sparkle 25s linear infinite;
        }

        .floating-shapes::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 70%);
        }

        @keyframes sparkle {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-150px) translateX(50px); }
        }
      `}</style>

      <div className="min-h-screen w-full bg-black font-sans flex items-center justify-center px-4 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
            <div className="shape shape-6"></div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
            {/* Left Side - Project Quote */}
            <div className="text-center lg:text-left space-y-10">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight heading-sweep">
                Create Account.
                <br />
                Join the Automation.
              </h1>
              <p className="text-xl lg:text-2xl text-blue-400 font-medium">
                Sign up and let automation handle results.
              </p>
              <p className="text-base lg:text-lg text-gray-300 italic max-w-lg mx-auto lg:mx-0">
                "Empowering faculty to simplify result management, effortlessly."
              </p>
            </div>

            {/* Right Side - Signup Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-2xl">
                {/* Larger Card Design */}
                <div className="relative">
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur-sm opacity-30 animate-pulse"></div>

                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-gray-700/30 rounded-3xl p-24 shadow-2xl backdrop-blur-xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                    <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-lg"></div>

                    {/* Card Header */}
                    <div className="relative text-center mb-16 space-y-4">
                      <div className="inline-flex items-center justify-center w-18 h-18 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-5 shadow-lg shadow-blue-500/25">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
                        Create Account
                      </h2>
                      <p className="text-gray-400 text-xs font-medium">Join our academic platform</p>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-12 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-red-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-red-300 text-sm font-medium">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-12">
                        {/* Name Input */}
                        <div className="space-y-6">
                          <label className="text-xs font-semibold text-gray-200 ml-1 block">Full Name</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                              <UserIcon />
                            </div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full h-12 pl-12 pr-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                              placeholder="Your Full Name"
                            />
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-6">
                          <label className="text-xs font-semibold text-gray-200 ml-1 block">Email Address</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                              <MailIcon />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full h-12 pl-12 pr-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                              placeholder="you@college.edu"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-6">
                          <label className="text-xs font-semibold text-gray-200 ml-1 block">Password</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                              <LockIcon />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full h-12 pl-12 pr-12 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors focus:outline-none"
                            >
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-6">
                          <label className="text-xs font-semibold text-gray-200 ml-1 block">Confirm Password</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                              <LockIcon />
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full h-12 pl-12 pr-12 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={toggleConfirmPasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>

                        {/* Signup Button */}
                        <button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>Create Account</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Sign in link */}
                    <div className="mt-12 text-center">
                      <span className="text-gray-400 text-xs">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                          Sign In
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup


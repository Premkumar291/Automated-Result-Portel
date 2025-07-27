"use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../api/auth"

// Icons from reference UI
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

// Professional SVG eye icons from Heroicons
import { EyeIcon as HeroEyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

// Professional eye icon for password visibility
const EyeIcon = () => (
  <HeroEyeIcon className="w-5 h-5 text-gray-400" />
)

// Professional eye-off icon for password visibility
const EyeOffIcon = () => (
  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
)

// Professional Person/Profile Icon - Full White color
const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const Login = () => {
  // All original state and logic preserved
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Original handleChange logic preserved
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Original handleSubmit logic preserved
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await login(form)
      if (data.success) {
        navigate("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError(err.message || "Network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      {/* Enhanced Global dark theme styles with comet/star animations */}
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

        /* Comet and Star Animation Container */
        .cosmic-background {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Comet Shapes */
        .comet {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(59, 130, 246, 1), rgba(59, 130, 246, 0));
          border-radius: 50%;
          animation: cometFlow linear infinite;
        }

        .comet::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, 
            rgba(59, 130, 246, 0.8) 0%, 
            rgba(59, 130, 246, 0.4) 30%, 
            rgba(59, 130, 246, 0.1) 70%, 
            transparent 100%);
          transform: translate(-100%, -50%);
          border-radius: 1px;
        }

        .comet-1 {
          top: 10%;
          animation-duration: 8s;
          animation-delay: 0s;
        }

        .comet-2 {
          top: 25%;
          animation-duration: 12s;
          animation-delay: 2s;
          filter: hue-rotate(60deg);
        }

        .comet-3 {
          top: 45%;
          animation-duration: 10s;
          animation-delay: 4s;
          filter: hue-rotate(120deg);
        }

        .comet-4 {
          top: 65%;
          animation-duration: 14s;
          animation-delay: 1s;
          filter: hue-rotate(180deg);
        }

        .comet-5 {
          top: 80%;
          animation-duration: 9s;
          animation-delay: 3s;
          filter: hue-rotate(240deg);
        }

        @keyframes cometFlow {
          0% {
            left: -120px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: calc(100vw + 120px);
            opacity: 0;
          }
        }

        /* Star Shapes */
        .star {
          position: absolute;
          animation: starFlow linear infinite;
        }

        .star::before {
          content: '✦';
          font-size: 16px;
          color: rgba(147, 51, 234, 0.8);
          text-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
          animation: starTwinkle 2s ease-in-out infinite alternate;
        }

        .star-1 {
          top: 15%;
          animation-duration: 15s;
          animation-delay: 0s;
        }

        .star-2 {
          top: 35%;
          animation-duration: 18s;
          animation-delay: 5s;
        }

        .star-3 {
          top: 55%;
          animation-duration: 12s;
          animation-delay: 2s;
        }

        .star-4 {
          top: 75%;
          animation-duration: 20s;
          animation-delay: 7s;
        }

        @keyframes starFlow {
          0% {
            right: -50px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            right: calc(100vw + 50px);
            opacity: 0;
          }
        }

        @keyframes starTwinkle {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* Diagonal Shooting Stars */
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          animation: shootingStar linear infinite;
        }

        .shooting-star::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 1px;
          background: linear-gradient(45deg, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(255, 255, 255, 0.4) 30%, 
            rgba(255, 255, 255, 0.1) 70%, 
            transparent 100%);
          transform: translate(-100%, -50%) rotate(-45deg);
        }

        .shooting-star-1 {
          top: 5%;
          left: -100px;
          animation-duration: 6s;
          animation-delay: 1s;
        }

        .shooting-star-2 {
          top: 30%;
          left: -100px;
          animation-duration: 8s;
          animation-delay: 4s;
        }

        .shooting-star-3 {
          top: 60%;
          left: -100px;
          animation-duration: 7s;
          animation-delay: 6s;
        }

        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(200px);
            opacity: 0;
          }
        }

        /* Floating Particles */
        .particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: rgba(59, 130, 246, 0.6);
          border-radius: 50%;
          animation: particleFloat linear infinite;
        }

        .particle-1 { top: 20%; animation-duration: 25s; animation-delay: 0s; }
        .particle-2 { top: 40%; animation-duration: 30s; animation-delay: 5s; }
        .particle-3 { top: 60%; animation-duration: 20s; animation-delay: 10s; }
        .particle-4 { top: 80%; animation-duration: 35s; animation-delay: 15s; }

        @keyframes particleFloat {
          0% {
            left: -10px;
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            left: calc(100vw + 10px);
            opacity: 0;
          }
        }

        /* Enhanced Glow Effects */
        .cosmic-glow {
          position: relative;
        }

        .cosmic-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(59, 130, 246, 0.05),
            transparent,
            rgba(147, 51, 234, 0.05),
            transparent
          );
          animation: cosmicRotate 15s linear infinite;
          z-index: -1;
        }

        @keyframes cosmicRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Subtle Pulse Overlay */
        .cosmic-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.03) 0%, transparent 50%);
          animation: cosmicPulse 6s ease-in-out infinite;
        }

        @keyframes cosmicPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        /* Custom ACADEX Logo Styling */
        .acadex-logo {
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.05em;
          margin-bottom: 1rem;
        }

        @media (min-width: 1024px) {
          .acadex-logo {
            font-size: 4rem;
            justify-content: flex-start;
            margin-bottom: 1.5rem;
          }
        }

        /* Individual Letter Styling */
        .acadex-logo span {
          position: relative;
          transition: all 0.2s ease;
          cursor: default;
          font-weight: 800;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .acadex-logo span:hover {
          transform: translateY(-1px);
        }

        /* Modern Color Scheme */
        .acadex-a1 {
          color: #6366F1; /* Indigo - Knowledge & Wisdom */
        }

        .acadex-c {
          color: #EF4444; /* Red - Energy & Action */
        }

        .acadex-a2 {
          color: #F59E0B; /* Amber - Innovation & Creativity */
        }

        .acadex-d {
          color: #8B5CF6; /* Purple - Excellence & Quality */
        }

        .acadex-e {
          color: #10B981; /* Emerald - Growth & Success */
        }

        .acadex-x {
          color: #F97316; /* Orange - Achievement & Results */
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .acadex-logo {
            font-size: 2.5rem;
            gap: 0.02em;
            margin-bottom: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .acadex-logo {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>

      <div className="min-h-screen w-full bg-black font-sans flex items-center justify-center px-4 relative overflow-hidden cosmic-glow">
        {/* Enhanced Cosmic Background with Darker Theme */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950"></div>
          <div className="cosmic-pulse"></div>
          <div className="cosmic-background">
            {/* Comets flowing left to right */}
            <div className="comet comet-1"></div>
            <div className="comet comet-2"></div>
            <div className="comet comet-3"></div>
            <div className="comet comet-4"></div>
            <div className="comet comet-5"></div>

            {/* Stars flowing right to left */}
            <div className="star star-1"></div>
            <div className="star star-2"></div>
            <div className="star star-3"></div>
            <div className="star star-4"></div>

            {/* Diagonal shooting stars */}
            <div className="shooting-star shooting-star-1"></div>
            <div className="shooting-star shooting-star-2"></div>
            <div className="shooting-star shooting-star-3"></div>

            {/* Floating particles */}
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center min-h-screen py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Side - Project Quote with Custom ACADEX Design */}
            <div className="text-center lg:text-left space-y-6">
              <div className="acadex-logo">
                <span className="acadex-a1">A</span>
                <span className="acadex-c">C</span>
                <span className="acadex-a2">A</span>
                <span className="acadex-d">D</span>
                <span className="acadex-e">E</span>
                <span className="acadex-x">X</span>
              </div>
              <p className="text-lg lg:text-xl text-gray-400 italic max-w-lg mx-auto lg:mx-0">
                Upload once, Let automation take over.
              </p>
              
            </div>

            {/* Right Side - Login Form (No Card) */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Header - Logo without card background */}
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center justify-center mb-6">
                    <PersonIcon />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    Faculty Login
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">Secure access to your dashboard</p>
                </div>
                <br />

                {/* Error message */}
                {error && (
                  <div className="mb-8 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-red-400 flex-shrink-0"
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

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-3 mb-5">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <MailIcon />
                        </div>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          disabled={isLoading}
                          required
                          className={`w-full h-12 pl-16 pr-6 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${ 
                            isLoading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  enter email address"
                        />
                      </div>
                    </div>
                    <br/>

                    {/* Password Input */}
                    <div className="space-y-3 mb-5">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <LockIcon />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          required
                          className={`w-full h-12 pl-16 pr-16 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            isLoading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  enter password"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:ring-offset-1 focus:ring-offset-gray-800 rounded-full disabled:cursor-not-allowed p-1.5 h-9 w-9 flex items-center justify-center"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <br />

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-sm pt-4 pb-4">
                      <label className="flex items-center space-x-2 cursor-pointer"></label>
                      <Link
                        to="/forgot-password"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-semibold text-sm"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <br />

                    {/* Simple Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full h-12 font-medium text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black mt-8 border ${
                        isLoading
                          ? "bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300"
                          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:bg-gray-200"
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg
                            className="animate-spin h-4 w-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <span>Access Dashboard</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Sign up link */}
                <div className="mt-10 text-center">
                  <span className="text-gray-400 text-sm">
                    Need faculty access?{" "}
                    <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                      Request account
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login


import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { forgotPassword, verifyResetToken, resetPassword } from "../../api/auth"

// Icons from reference UI (matching the login/signup style)
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

const CodeIcon = () => (
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
    <polyline points="16,18 22,12 16,6"></polyline>
    <polyline points="8,6 2,12 8,18"></polyline>
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

const CheckIcon = () => (
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
    <path d="M20 6 9 17l-5-5"></path>
  </svg>
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
    <path d="M12 2v20m8-8H4"></path>
  </svg>
)

const ForgotPassword = () => {
  const navigate = useNavigate()
  // All original state and logic preserved
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // All original logic preserved
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const data = await forgotPassword(form.email)
      if (data.success) {
        setSuccess(data.message)
        setStep(2)
      } else {
        setError(data.message || "Failed to send verification code")
      }
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validate code length
    if (form.code.length !== 6) {
      setError("Please enter a 6-digit code")
      setLoading(false)
      return
    }

    try {
      const data = await verifyResetToken(form.email, form.code)
      if (data.success) {
        setSuccess("Code verified successfully!")
        // Clear any previous password data
        setForm((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }))
        // Add a small delay to show the success message before transitioning
        setTimeout(() => {
          setStep(3) // Move to password reset step
        }, 1000)
      } else {
        setError(data.message || "Invalid verification code")
      }
    } catch (err) {
      setError(err.message || "Failed to verify code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      const data = await resetPassword(form.email, form.code, form.newPassword)
      if (data.success) {
        setSuccess("Password reset successful! Redirecting to login...")
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Applied Reference UI Styling with Cosmic Animations */}
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

        /* Custom ACADEX Logo Styling - EXTRACTED FROM REFERENCE */
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

        /* Step Indicator Animation */
        .step-indicator {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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
            {/* Left Side - Enhanced Project Quote with Custom ACADEX Design */}
            <div className="text-center lg:text-left space-y-8">
              <div className="acadex-logo">
                <span className="acadex-a1">A</span>
                <span className="acadex-c">C</span>
                <span className="acadex-a2">A</span>
                <span className="acadex-d">D</span>
                <span className="acadex-e">E</span>
                <span className="acadex-x">X</span>
              </div>
              <p className="text-xl lg:text-2xl text-gray-400 italic max-w-lg mx-auto lg:mx-0">
                {step === 1 && "Reset your password securely"}
                {step === 2 && "Verify your identity"}
                {step === 3 && "Create new password"}
              </p>
              {/* Dynamic Step Indicator */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 step-indicator">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step >= 1 ? "bg-blue-500 border-blue-500 text-white" : "border-gray-600 text-gray-400"
                  }`}
                >
                  {step > 1 ? <CheckIcon /> : "1"}
                </div>
                <div
                  className={`h-1 w-12 rounded-full transition-all duration-300 ${
                    step >= 2 ? "bg-blue-500" : "bg-gray-600"
                  }`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step >= 2 ? "bg-blue-500 border-blue-500 text-white" : "border-gray-600 text-gray-400"
                  }`}
                >
                  {step > 2 ? <CheckIcon /> : "2"}
                </div>
                <div
                  className={`h-1 w-12 rounded-full transition-all duration-300 ${
                    step >= 3 ? "bg-blue-500" : "bg-gray-600"
                  }`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step >= 3 ? "bg-blue-500 border-blue-500 text-white" : "border-gray-600 text-gray-400"
                  }`}
                >
                  {step > 3 ? <CheckIcon /> : "3"}
                </div>
              </div>
            </div>

            {/* Right Side - Dynamic Form Container */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Header - Logo without card background */}
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center justify-center mb-6">
                    <PersonIcon />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    {step === 1 && "Reset Password"}
                    {step === 2 && "Verify Code"}
                    {step === 3 && "New Password"}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">
                    {step === 1 && "Enter your email to receive reset code"}
                    {step === 2 && "Enter the verification code sent to your email"}
                    {step === 3 && "Create a new secure password"}
                  </p>
                </div>
                <br />

                {/* Error/Success messages */}
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

                {success && (
                  <div className="mb-8 p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-green-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-green-300 text-sm font-medium">{success}</p>
                    </div>
                  </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                  <form onSubmit={handleSendCode}>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                            <MailIcon />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className={`w-full h-14 pl-16 pr-6 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                              loading ? "cursor-not-allowed opacity-50" : ""
                            }`}
                            placeholder="  faculty@college.edu"
                          />
                        </div>
                      </div>
                      <br />
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-12 font-medium text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black mt-8 border ${
                          loading
                            ? "bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300"
                            : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:bg-gray-200"
                        }`}
                      >
                        {loading ? (
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
                            <span>Sending Code...</span>
                          </div>
                        ) : (
                          <span>Send Reset Code</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Code */}
                {step === 2 && (
                  <form onSubmit={handleVerifyCode}>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                            <CodeIcon />
                          </div>
                          <input
                            type="text"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className="w-full h-14 pl-16 pr-6 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium text-center tracking-widest"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                          Code sent to <span className="text-blue-400 font-medium">{form.email}</span>
                        </p>
                      </div>
                      <br />
                      <button
                        type="submit"
                        disabled={loading || form.code.length !== 6}
                        className={`w-full h-12 font-medium text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black mt-8 border ${
                          loading || form.code.length !== 6
                            ? "bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300"
                            : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:bg-gray-200"
                        }`}
                      >
                        {loading ? (
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
                            <span>Verifying...</span>
                          </div>
                        ) : form.code.length === 6 ? (
                          <span>Verify Code</span>
                        ) : (
                          "Enter 6-digit code"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                            <LockIcon />
                          </div>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="enter new password"
                            className="w-full h-14 pl-16 pr-16 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                              className="text-gray-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:ring-offset-1 focus:ring-offset-gray-800 rounded-full p-1.5 h-9 w-9 flex items-center justify-center"
                              aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                              {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <br />
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                            <LockIcon />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="confirm new password"
                            className="w-full h-14 pl-16 pr-16 bg-gray-800/60 border border-gray-600/50 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="text-gray-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:ring-offset-1 focus:ring-offset-gray-800 rounded-full p-1.5 h-9 w-9 flex items-center justify-center"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <br />
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-12 font-medium text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black mt-8 border ${
                          loading
                            ? "bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300"
                            : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:bg-gray-200"
                        }`}
                      >
                        {loading ? (
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
                            <span>Resetting Password...</span>
                          </div>
                        ) : (
                          <span>Reset Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-10 text-center">
                  <span className="text-gray-400 text-sm">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                      Back to Login
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

export default ForgotPassword

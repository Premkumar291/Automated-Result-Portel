"use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signup } from "../../api/auth"

// Icons from reference UI (converted to match signup needs)
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

const DeptIcon = () => (
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
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  // Original handleChange logic preserved
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Original handleSubmit logic preserved
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    // Prepare data for API (confirmPassword is not sent)
    const formData = {
      name: form.name,
      email: form.email,
      department: form.department,
      password: form.password,
    }

    try {
      const data = await signup(formData)
      if (data.success === false) {
        setError(data.message || "Signup failed")
      } else {
        setSuccess("Signup successful! Please check your email for verification.")
        setForm({ name: "", email: "", department: "", password: "", confirmPassword: "" })
        // Navigate to verify email page after a short delay
        setTimeout(() => {
          navigate("/verify-email", { state: { email: form.email } })
        }, 2000)
      }
    } catch (err) {
      setError(err.message || "Network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmVisibility = () => {
    setShowConfirm(!showConfirm)
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
            {/* Left Side - Project Quote */}
            <div className="text-center lg:text-left space-y-8">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight heading-sweep">ACADEX</h1>
              <br />
              <p className="text-xl lg:text-2xl text-gray-400 italic max-w-lg mx-auto lg:mx-0">
                Create account and join the automation
              </p>
            </div>

            {/* Right Side - Signup Form (No Card) */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    Faculty Registration
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">Create your account to continue</p>
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

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Full Name Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-200 ml-1 block">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <UserIcon />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className={`w-full h-10 pl-12 pr-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            loading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  Your Full Name"
                        />
                      </div>
                    </div>
                    <br />

                    {/* Email Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-200 ml-1 block">Institutional Email ID</label>
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
                          className={`w-full h-10 pl-12 pr-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            loading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  you@college.edu"
                        />
                      </div>
                    </div>
                    <br />

                    {/* Department Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-200 ml-1 block">Department</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <DeptIcon />
                        </div>
                        <input
                          type="text"
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className={`w-full h-10 pl-12 pr-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            loading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  Department"
                        />
                      </div>
                    </div>
                    <br />

                    {/* Password Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-200 ml-1 block">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <LockIcon />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className={`w-full h-10 pl-12 pr-12 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            loading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  ••••••••"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          disabled={loading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors focus:outline-none disabled:cursor-not-allowed"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                    <br />

                    {/* Confirm Password Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-200 ml-1 block">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                          <LockIcon />
                        </div>
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className={`w-full h-10 pl-12 pr-12 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-medium ${
                            loading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          placeholder="  ••••••••"
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmVisibility}
                          disabled={loading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors focus:outline-none disabled:cursor-not-allowed"
                        >
                          {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                    <br />

                    {/* Signup Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-14 font-bold text-sm rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500/50 mt-8 ${
                        loading
                          ? "bg-gray-600 cursor-not-allowed text-gray-300"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Create Account</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Login link */}
                <div className="mt-10 text-center">
                  <span className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                      Login here
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

export default Signup





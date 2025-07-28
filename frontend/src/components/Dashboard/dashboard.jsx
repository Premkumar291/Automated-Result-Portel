"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { logout, checkAuth } from "../../api/auth"
import PDFProcessingCard from "./PDFProcessingCard"
import { motion } from "framer-motion"

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [accountCardHovered, setAccountCardHovered] = useState(false)
  const gsapRef = useRef(null)
  const navigate = useNavigate()

  // ColourfulText Component (inline)
  const ColourfulText = ({ text, className = "" }) => {
    return (
      <span
        className={`inline-block ${className}`}
        style={{
          fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace",
        }}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            style={{
              display: "inline-block",
              background: "linear-gradient(90deg, #a855f7 0%, #8b5cf6 50%, #ec4899 100%)", // from-purple-500, via-violet-500, to-pink-500
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "0.02em",
              fontWeight: 700,
              margin: char === " " ? "0 0.12em" : "0",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1, // stagger per letter
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.2 },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    )
  }

  // Initialize GSAP animations
  useEffect(() => {
    const loadGSAP = async () => {
      if (!window.gsap) {
        const gsapScript = document.createElement("script")
        gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        document.head.appendChild(gsapScript)
        await new Promise((resolve) => (gsapScript.onload = resolve))
      }
      if (window.gsap && !userLoading) {
        const { gsap } = window
        gsapRef.current = gsap
        // Animate main sections
        gsap.fromTo(
          ".animate-section",
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" },
        )
        gsap.fromTo(".animate-header", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" })
        // Continuous animations
        gsap.to(".pulse-indicator", {
          scale: 1.2,
          opacity: 0.6,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        })
        gsap.to(".float-element", {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          stagger: 0.5,
        })
      }
    }
    loadGSAP()
  }, [userLoading])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await checkAuth()
        setUser(response.user)
      } catch {
        navigate("/login")
      } finally {
        setUserLoading(false)
      }
    }
    fetchUserData()
  }, [navigate])

  const handleLogout = async () => {
    setIsLoading(true)
    setError("")
    try {
      await logout()
      navigate("/login")
    } catch {
      setError("Logout failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (gsapRef.current) {
      gsapRef.current.to(".theme-transition", {
        duration: 0.6,
        ease: "power2.inOut",
      })
    }
  }

  if (userLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-700 ${isDarkMode ? "bg-black" : "bg-white"}`}
      >
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div
              className={`absolute inset-0 border-4 ${isDarkMode ? "border-purple-500" : "border-blue-200"} rounded-full animate-ping opacity-20`}
            ></div>
            <div
              className={`absolute inset-2 border-4 ${isDarkMode ? "border-purple-400" : "border-blue-400"} rounded-full animate-spin`}
            ></div>
            <div
              className={`absolute inset-4 border-4 ${isDarkMode ? "border-purple-600" : "border-blue-600"} rounded-full animate-pulse`}
            ></div>
            <div
              className={`absolute inset-6 ${isDarkMode ? "bg-gradient-to-r from-purple-500 to-pink-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"} rounded-full flex items-center justify-center`}
            >
              <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Initializing ACADEX Portal
          </h2>
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${isDarkMode ? "bg-purple-600" : "bg-blue-600"} animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
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
        
        /* Light Theme Navbar */
        .white-navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        /* Dark Theme Navbar - Next Level Design */
        .dark-navbar {
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #111111 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.8),
            0 1px 3px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
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
        
        /* Account Card Light Theme - NO GLOW */
        .account-card {
          background: linear-gradient(135deg, #fefcf3 0%, #faf8f1 50%, #f7f5ef 100%);
          border: 1px solid rgba(218, 165, 32, 0.2);
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.08), 
            0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .account-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.1), 
            0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        /* Account Card Dark Theme - Raw Black NO GLOW */
        .dark-account-card {
          background: linear-gradient(135deg, #000000 0%, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%, #000000 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.95),
            0 8px 30px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .dark-account-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.98),
            0 12px 40px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        
        /* Dark Theme Glitter Effects */
        .dark-glitter-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(139, 92, 246, 0.9);
          border-radius: 50%;
          animation: darkGlitterSparkle 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
        }
        @keyframes darkGlitterSparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
          }
          50% { 
            opacity: 1; 
            transform: scale(2) rotate(180deg); 
            box-shadow: 0 0 15px rgba(139, 92, 246, 1), 0 0 25px rgba(236, 72, 153, 0.5);
          }
        }
        
        /* Light Theme Glitter */
        .glitter-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(218, 165, 32, 0.8);
          border-radius: 50%;
          animation: glitterSparkle 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(218, 165, 32, 0.6);
        }
        .glitter-particle:nth-child(1) { top: 20%; left: 15%; animation-delay: 0s; }
        .glitter-particle:nth-child(2) { top: 40%; left: 80%; animation-delay: 0.3s; }
        .glitter-particle:nth-child(3) { top: 60%; left: 25%; animation-delay: 0.6s; }
        .glitter-particle:nth-child(4) { top: 30%; left: 60%; animation-delay: 0.9s; }
        .glitter-particle:nth-child(5) { top: 70%; left: 70%; animation-delay: 1.2s; }
        .glitter-particle:nth-child(6) { top: 15%; left: 45%; animation-delay: 1.5s; }
        .glitter-particle:nth-child(7) { top: 80%; left: 35%; animation-delay: 0.2s; }
        .glitter-particle:nth-child(8) { top: 50%; left: 10%; animation-delay: 0.8s; }
        .glitter-particle:nth-child(9) { top: 25%; left: 85%; animation-delay: 1.1s; }
        .glitter-particle:nth-child(10) { top: 75%; left: 55%; animation-delay: 0.5s; }
        .glitter-particle:nth-child(11) { top: 35%; left: 20%; animation-delay: 1.3s; }
        .glitter-particle:nth-child(12) { top: 65%; left: 75%; animation-delay: 0.7s; }
        @keyframes glitterSparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.5) rotate(180deg); 
          }
        }
        
        /* Glittering Effect Overlay */
        .glitter-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.3s ease;
        }
        .glitter-overlay.active {
          opacity: 1;
        }
        
        /* Shimmer Effects */
        .shimmer-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.3), transparent);
          animation: shimmerMove 3s ease-in-out infinite;
        }
        .dark-shimmer-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.3), transparent);
          animation: shimmerMove 3s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Corner Icons */
        .corner-icon {
          position: absolute;
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .corner-icon.top-left { top: -10px; left: -10px; }
        .corner-icon.top-right { top: -10px; right: -10px; }
        .corner-icon.bottom-left { bottom: -10px; left: -10px; }
        .corner-icon.bottom-right { bottom: -10px; right: -10px; }
        
        /* Light Theme Corner Icons */
        .light-corner-icon {
          color: rgba(139, 69, 19, 0.5);
        }
        .account-card:hover .light-corner-icon {
          color: rgba(139, 69, 19, 0.7);
          transform: rotate(90deg) scale(1.1);
        }
        
        /* Dark Theme Corner Icons - Normal White */
        .dark-corner-icon {
          color: rgba(255, 255, 255, 0.6);
        }
        .dark-account-card:hover .dark-corner-icon {
          color: rgba(255, 255, 255, 0.9);
          transform: rotate(90deg) scale(1.2);
        }
        
        /* Content styling */
        .account-content {
          position: relative;
          z-index: 20;
          transition: all 0.3s ease;
        }
        
        /* Light Theme Content */
        .light-content {
          color: #1f2937;
        }
        .light-content .text-slate-600 {
          color: #6b7280 !important;
        }
        .light-content .text-slate-900 {
          color: #1f2937 !important;
        }
        .light-content .text-blue-600 {
          color: #2563eb !important;
        }
        .light-content .text-green-500 {
          color: #10b981 !important;
        }
        .light-content .accent-border {
          border-left-color: rgba(218, 165, 32, 0.6);
        }
        .account-card:hover .light-content .accent-border {
          border-left-color: rgba(218, 165, 32, 0.8);
        }
        
        /* Dark Theme Content - Normal White Colors */
        .dark-content {
          color: #ffffff;
        }
        .dark-content .text-slate-600 {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .dark-content .text-slate-900 {
          color: #ffffff !important;
        }
        .dark-content .text-blue-600 {
          color: #ffffff !important;
        }
        .dark-content .text-green-500 {
          color: #10b981 !important;
        }
        .dark-content .accent-border {
          border-left-color: rgba(255, 255, 255, 0.6);
        }
        .dark-account-card:hover .dark-content .accent-border {
          border-left-color: rgba(255, 255, 255, 0.9);
        }
        
        .section-divider {
          background: linear-gradient(90deg, transparent, rgba(203, 213, 225, 0.4), transparent);
          height: 1px;
        }
        .dark-section-divider {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          height: 1px;
        }
        
        .accent-border {
          border-left: 4px solid rgba(218, 165, 32, 0.6);
          transition: border-left-color 0.3s ease;
        }
        .dark-accent-border {
          border-left: 4px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }
        
        .status-dot {
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: statusPulse 2s infinite;
        }
        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        /* Custom ACADEX Logo Styling */
        .acadex-logo {
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.05em;
          margin-bottom: 0;
        }
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
        .acadex-a1 { color: #6366F1; }
        .acadex-c { color: #EF4444; }
        .acadex-a2 { color: #F59E0B; }
        .acadex-d { color: #8B5CF6; }
        .acadex-e { color: #10B981; }
        .acadex-x { color: #F97316; }
        
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
      <div className={`min-h-screen theme-transition ${isDarkMode ? "dark-bg" : "bg-white"}`}>
        {/* Dynamic Navbar */}
        <header
          className={`animate-header fixed top-0 left-0 right-0 z-50 ${isDarkMode ? "dark-navbar" : "white-navbar"}`}
        >
          <div className="max-w-7.2xl mx-auto px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Brand Section */}
              <div className="flex items-center space-x-6">
                <div>
                  <div className="acadex-logo">
                    <span className="acadex-a1">A</span>
                    <span className="acadex-c">C</span>
                    <span className="acadex-a2">A</span>
                    <span className="acadex-d">D</span>
                    <span className="acadex-e">E</span>
                    <span className="acadex-x">X</span>
                  </div>
                </div>
              </div>
              {/* Controls Section with Proper Gaps */}
              <div className="flex items-center space-x-8">
                {/* Theme Toggle - Proper gap */}
                <button
                  onClick={toggleTheme}
                  className={`${isDarkMode ? "text-white hover:text-purple-300" : "text-black hover:text-gray-700"} transition-all duration-300`}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                {/* User Profile - Proper gap */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full bg-black text-white flex items-center justify-center ${isDarkMode ? "font-black text-base" : "font-bold text-sm"}`}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="status-dot absolute -top-1 -right-1 w-3 h-3 rounded-full"></div>
                  </div>
                  <div className="hidden md:block">
                    <p className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                      {user?.name || "User"}
                    </p>
                    <p className={`text-xs mono font-medium ${isDarkMode ? "text-purple-300" : "text-black"}`}>
                      Administrator
                    </p>
                  </div>
                </div>
                {/* Logout Button - Dark Theme: White bg with Black text */}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`px-4 py-2 ${isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black hover:bg-gray-800 text-white"} font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing out...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
        <br />
        {/* Main Content with Top Padding for Fixed Navbar */}
        <main className="relative z-10">
          {/* Hero Welcome Section with New Font Style - No Background */}
          <div className="animate-section py-20 flex items-center justify-center relative">
            <div className="text-center space-y-6 relative z-20 px-8">
              <motion.h1
                className={`text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center ${isDarkMode ? "text-white" : "text-black"} font-sans tracking-tight`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome back, <ColourfulText text={user?.name?.split(" ")[0] || "User"} />
              </motion.h1>
              <motion.p
                className={`text-lg md:text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto leading-relaxed`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Your advanced document processing environment is ready. Upload, analyze, and extract insights from your
                documents with AI-powered precision.
              </motion.p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 pb-12">
            {/* PDF Processing Section */}
            <div className="animate-section mb-12">
              <div className={`${isDarkMode ? "dark-elevated-card" : "elevated-card"} p-6 hover-lift`}>
                <div className="flex items-center space-x-4 mb-6">
                  <svg
                    className={`w-8 h-8 float-element ${isDarkMode ? "text-white" : "text-purple-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <h3 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      Document Processing Engine
                    </h3>
                    <p className={`text-base ${isDarkMode ? "text-gray-300" : "text-slate-600"} mt-1`}>
                      Advanced AI-powered PDF analysis, extraction, and processing capabilities
                    </p>
                  </div>
                </div>
                <div className={`${isDarkMode ? "dark-section-divider" : "section-divider"} mb-6`}></div>
                {/* PDF Processing Component */}
                <PDFProcessingCard />
              </div>
            </div>
            {/* Account Information Panel with Dynamic Theme - NO GLOW in Dark Mode */}
            <div className="animate-section">
              <div
                className={`${isDarkMode ? "dark-account-card" : "account-card"} p-6`}
                onMouseEnter={() => setAccountCardHovered(true)}
                onMouseLeave={() => setAccountCardHovered(false)}
              >
                {/* Corner Icons - Normal White in Dark Mode */}
                <svg
                  className={`corner-icon top-left ${isDarkMode ? "dark-corner-icon" : "light-corner-icon"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <svg
                  className={`corner-icon top-right ${isDarkMode ? "dark-corner-icon" : "light-corner-icon"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <svg
                  className={`corner-icon bottom-left ${isDarkMode ? "dark-corner-icon" : "light-corner-icon"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <svg
                  className={`corner-icon bottom-right ${isDarkMode ? "dark-corner-icon" : "light-corner-icon"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>

                {/* Dynamic Glittering Effect - REMOVED FROM BOTH THEMES */}

                {/* Content */}
                <div className={`account-content ${isDarkMode ? "dark-content" : "light-content"}`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <svg
                      className={`w-6 h-6 float-element ${isDarkMode ? "text-white" : "text-blue-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Account Information</h3>
                      <p className="text-sm mono text-slate-600">Your profile and system access details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className={`${isDarkMode ? "dark-accent-border" : "accent-border"} pl-4`}>
                        <label className="text-xs font-bold mono uppercase tracking-wider text-slate-600">
                          Full Name
                        </label>
                        <p className="text-lg font-bold mt-1 text-slate-900">{user?.name || "Not available"}</p>
                      </div>
                      <div className={`${isDarkMode ? "dark-accent-border" : "accent-border"} pl-4`}>
                        <label className="text-xs font-bold mono uppercase tracking-wider text-slate-600">
                          Email Address
                        </label>
                        <p className="text-lg font-bold mt-1 break-all text-slate-900">
                          {user?.email || "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className={`${isDarkMode ? "dark-accent-border" : "accent-border"} pl-4`}>
                        <label className="text-xs font-bold mono uppercase tracking-wider text-slate-600">
                          Account Status
                        </label>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="pulse-indicator w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-lg font-bold text-green-500">ACTIVE</span>
                        </div>
                      </div>
                      <div className={`${isDarkMode ? "dark-accent-border" : "accent-border"} pl-4`}>
                        <label className="text-xs font-bold mono uppercase tracking-wider text-slate-600">
                          Last Login
                        </label>
                        <p className="text-lg font-bold mt-1 mono text-slate-900">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Error Notification */}
        {error && (
          <div
            className={`fixed bottom-8 right-8 z-50 ${isDarkMode ? "dark-elevated-card" : "elevated-card"} p-4 max-w-md hover-lift`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>System Error</h4>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-slate-600 hover:text-slate-800"} transition-colors`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard

"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { logout, checkAuth } from "@/api/auth"
import PDFProcessingCard from "./PDFProcessingCard"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, BarChart3, FileText, LogOut, Bell, Search } from "lucide-react"

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true) // Changed to true - sidebar closed by default
  const [activeItem, setActiveItem] = useState("Analysis")
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const gsapRef = useRef(null)
  const navigate = useNavigate()

  // Sidebar navigation items - Updated with your specific options
  const mainNavItems = [
    {
      name: "Analysis",
      icon: BarChart3,
      description: "Data analysis and insights",
    },
    {
      name: "View Results",
      icon: FileText,
      description: "View processing results",
    },
  ]

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

  // Animated ACADEX Logo Component for Sidebar
  const SidebarAcadexLogo = () => {
    return (
      <div className="acadex-logo text-lg">
        <motion.span
          className="acadex-a1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          A
        </motion.span>
        <motion.span
          className="acadex-c"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
        >
          C
        </motion.span>
        <motion.span
          className="acadex-a2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          A
        </motion.span>
        <motion.span
          className="acadex-d"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
        >
          D
        </motion.span>
        <motion.span
          className="acadex-e"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          E
        </motion.span>
        <motion.span
          className="acadex-x"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
        >
          X
        </motion.span>
      </div>
    )
  }

  // Animated "A" Symbol Component for Sidebar
  const AnimatedASymbol = () => {
    return (
      <motion.div
        className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6366F1 0%, #EF4444 25%, #F59E0B 50%, #8B5CF6 75%, #10B981 100%)",
        }}
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{
          scale: 1.1,
          rotate: 10,
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
        }}
      >
        <motion.span
          className="text-white text-sm font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.2 }}
        >
          A
        </motion.span>
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, #6366F1 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, #EF4444 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, #F59E0B 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, #8B5CF6 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, #6366F1 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </motion.div>
    )
  }

  // Logout Confirmation Dialog Component
  const LogoutDialog = () => {
    if (!showLogoutDialog) return null
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <div
          className={`${isDarkMode ? "dark-elevated-card" : "elevated-card"} p-6 max-w-md w-full mx-auto rounded-lg`}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Confirm Logout</h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>
                Are you sure you want to sign out?
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirmLogout}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 ${
                isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black hover:bg-gray-800 text-white"
              } font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing out...</span>
                </div>
              ) : (
                "Yes, Sign Out"
              )}
            </button>
            <button
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 ${
                isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sidebar Navigation Item Component
  const NavItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon
    return (
      <div className="relative group">
        <button
          onClick={() => onClick(item.name)}
          className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${
            isActive
              ? isDarkMode
                ? "bg-gray-900 text-white shadow-sm border border-gray-800"
                : "bg-gray-100 text-gray-900 shadow-sm"
              : isDarkMode
                ? "text-gray-300 hover:bg-gray-900 hover:text-white"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }
          ${isCollapsed ? "justify-center px-2" : "justify-start"}
        `}
        >
          <Icon
            className={`
            w-4 h-4 transition-colors duration-200 flex-shrink-0
            ${
              isActive
                ? isDarkMode
                  ? "text-white"
                  : "text-gray-700"
                : isDarkMode
                  ? "text-gray-500 group-hover:text-white"
                  : "text-gray-500 group-hover:text-gray-700"
            }
          `}
          />
          {!isCollapsed && <span className="text-sm font-medium flex-1 text-left truncate">{item.name}</span>}
        </button>
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div
            className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 ${
              isDarkMode ? "bg-gray-900 text-white border border-gray-800" : "bg-gray-900 text-white"
            } text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}
          >
            {item.name}
            {item.description && <div className="text-gray-400 text-xs">{item.description}</div>}
          </div>
        )}
      </div>
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

  const handleConfirmLogout = async () => {
    setIsLoading(true)
    setError("")
    try {
      await logout()
      navigate("/login")
    } catch {
      setError("Logout failed. Please try again.")
    } finally {
      setIsLoading(false)
      setShowLogoutDialog(false)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
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

  const handleItemClick = (itemName) => {
    setActiveItem(itemName)
    setIsMobileOpen(false)
  }

  // Unified toggle function for both mobile and desktop
  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  if (userLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-700 ${
          isDarkMode ? "bg-black" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div
              className={`absolute inset-0 border-4 ${
                isDarkMode ? "border-purple-500" : "border-blue-200"
              } rounded-full animate-ping opacity-20`}
            ></div>
            <div
              className={`absolute inset-2 border-4 ${
                isDarkMode ? "border-purple-400" : "border-blue-400"
              } rounded-full animate-spin`}
            ></div>
            <div
              className={`absolute inset-4 border-4 ${
                isDarkMode ? "border-purple-600" : "border-blue-600"
              } rounded-full animate-pulse`}
            ></div>
            <div
              className={`absolute inset-6 ${
                isDarkMode
                  ? "bg-gradient-to-r from-purple-500 to-pink-600"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              } rounded-full flex items-center justify-center`}
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
        
        /* Light Theme Navbar */
        .white-navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          min-height: 64px;
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
          min-height: 64px;
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
      <div className={`min-h-screen theme-transition ${isDarkMode ? "dark-bg" : "bg-white"} flex`}>
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleSidebarToggle} />
        )}
        {/* Sidebar */}
        <div
          className={`
    ${isMobileOpen ? "translate-x-0" : isCollapsed ? "-translate-x-full" : "translate-x-0"}
    lg:${isCollapsed ? "-translate-x-full" : "translate-x-0"}
    fixed top-0 left-0 h-full z-50
    ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-200"}
    border-r shadow-lg transition-all duration-300 ease-in-out
    ${isCollapsed ? "w-0 lg:w-0" : "w-72"}
  `}
        >
          {/* Sidebar Header */}
          <div
            className={`
    flex items-center ${isDarkMode ? "border-gray-800 bg-black" : "border-gray-100"} border-b p-4
    ${isCollapsed ? "justify-center" : "justify-between"}
  `}
          >
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <AnimatedASymbol />
                <div>
                  <SidebarAcadexLogo />
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Pro Plan</p>
                </div>
              </div>
            ) : (
              <AnimatedASymbol />
            )}
            {!isCollapsed && (
              <button
                onClick={handleSidebarToggle}
                className={`
      p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors duration-200
    `}
              >
                <ChevronLeft className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            )}
          </div>
          {/* Expand Button for Collapsed State (only visible on desktop when collapsed) */}
          {isCollapsed && (
            <div className="p-2 flex justify-center hidden lg:block">
              {" "}
              {/* Only show on desktop */}
              <button
                onClick={handleSidebarToggle}
                className={`
      p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors duration-200
    `}
              >
                <ChevronRight className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            </div>
          )}
          {/* Search Bar */}
          {!isCollapsed && (
            <div className={`p-4 ${isDarkMode ? "border-gray-800 bg-black" : "border-gray-100"} border-b`}>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2 text-sm ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-900 text-white placeholder-gray-500"
                      : "border-gray-200 bg-white"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          )}
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-3 space-y-1 ${isDarkMode ? "bg-black" : ""}`}>
              {mainNavItems.map((item) => (
                <NavItem key={item.name} item={item} isActive={activeItem === item.name} onClick={handleItemClick} />
              ))}
            </div>
            {/* Separator */}
            <div className={`mx-4 my-4 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}></div>
            {/* Logout Button */}
            <div className={`p-3 ${isDarkMode ? "bg-black" : ""}`}>
              <button
                onClick={handleLogoutClick}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-900 hover:text-red-300"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                } ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
              >
                <LogOut
                  className={`w-4 h-4 transition-colors duration-200 flex-shrink-0 ${
                    isDarkMode ? "text-gray-500 hover:text-red-300" : "text-gray-500 hover:text-red-700"
                  }`}
                />
                {!isCollapsed && <span className="text-sm font-medium flex-1 text-left truncate">Sign Out</span>}
              </button>
            </div>
          </div>
          {/* Account Information Section */}
          {!isCollapsed && (
            <div className={`${isDarkMode ? "border-gray-800 bg-black" : "border-gray-100"} border-t p-4`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${isDarkMode ? "bg-gray-800" : "bg-black"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"} truncate`}>
                      {user?.name || "User"}
                    </p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"} truncate`}>
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <Bell className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                {/* Account Status */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="pulse-indicator w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={`text-xs font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Dynamic Navbar - ACADEX name hides when sidebar opens */}
          <header className={`animate-header ${isDarkMode ? "dark-navbar" : "white-navbar"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left Section - Single Unified Sidebar Toggle */}
                <div className="flex items-center">
                  {/* Single Unified Sidebar Toggle Button */}
                  <button
                    onClick={handleSidebarToggle}
                    className={`flex items-center justify-center p-3 rounded-lg ${
                      isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-100 text-gray-900"
                    } transition-all duration-200 group mr-4`}
                  >
                    {/* Dynamic Icon based on mobile/desktop and collapsed state */}
                    {window.innerWidth < 1024 ? (
                      <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                        <span
                          className={`block h-0.5 w-6 ${isDarkMode ? "bg-white" : "bg-gray-900"} transform transition duration-300 ease-in-out ${isMobileOpen ? "rotate-45 translate-y-1.5" : ""}`}
                        ></span>
                        <span
                          className={`block h-0.5 w-6 ${isDarkMode ? "bg-white" : "bg-gray-900"} transform transition duration-300 ease-in-out mt-1 ${isMobileOpen ? "opacity-0" : ""}`}
                        ></span>
                        <span
                          className={`block h-0.5 w-6 ${isDarkMode ? "bg-white" : "bg-gray-900"} transform transition duration-300 ease-in-out mt-1 ${isMobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                        ></span>
                      </div>
                    ) : isCollapsed ? (
                      <ChevronRight className="w-6 h-6" />
                    ) : (
                      <ChevronLeft className="w-6 h-6" />
                    )}
                  </button>
                  {/* Brand Section - Show ACADEX name only when sidebar is collapsed */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isCollapsed ? 1 : 0,
                      scale: isCollapsed ? 1 : 0.8,
                      x: isCollapsed ? 0 : -20,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center"
                  >
                    {isCollapsed && (
                      <div className="acadex-logo text-2xl">
                        <span className="acadex-a1">A</span>
                        <span className="acadex-c">C</span>
                        <span className="acadex-a2">A</span>
                        <span className="acadex-d">D</span>
                        <span className="acadex-e">E</span>
                        <span className="acadex-x">X</span>
                      </div>
                    )}
                  </motion.div>
                </div>
                {/* Right Section - Controls */}
                <div className="flex items-center space-x-4">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg ${
                      isDarkMode
                        ? "text-white hover:bg-gray-800 hover:text-purple-300"
                        : "text-black hover:bg-gray-100 hover:text-gray-700"
                    } transition-all duration-300`}
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
                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full bg-black text-white flex items-center justify-center ${
                          isDarkMode ? "font-black text-base" : "font-bold text-sm"
                        }`}
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
                        Faculty
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          {/* Main Content with Top Padding for Fixed Navbar */}
          <main className="relative z-10 flex-1">
            {/* Hero Welcome Section with New Font Style - No Background */}
            <div className="animate-section py-20 flex items-center justify-center relative">
              <div className="text-center space-y-6 relative z-20 px-8">
                <motion.h1
                  className={`text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center ${
                    isDarkMode ? "text-white" : "text-black"
                  } font-sans tracking-tight`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Welcome back, <ColourfulText text={user?.name?.split(" ")[0] || "User"} />
                </motion.h1>
                <motion.p
                  className={`text-lg md:text-xl ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } max-w-3xl mx-auto leading-relaxed`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Your advanced document processing environment is ready. Upload, analyze, and extract insights from
                  your documents with AI-powered precision.
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
            </div>
          </main>
        </div>
        {/* Logout Confirmation Dialog */}
        <LogoutDialog />
        {/* Error Notification */}
        {error && (
          <div
            className={`fixed bottom-8 right-8 z-50 ${
              isDarkMode ? "dark-elevated-card" : "elevated-card"
            } p-4 max-w-md hover-lift`}
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
                className={`${
                  isDarkMode ? "text-gray-300 hover:text-white" : "text-slate-600 hover:text-slate-800"
                } transition-colors`}
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



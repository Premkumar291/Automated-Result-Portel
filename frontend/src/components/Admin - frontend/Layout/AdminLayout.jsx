"use client"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { logout, checkAuth } from "@/api/auth"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, LogOut, Bell, Users, UserPlus } from "lucide-react"

const AdminLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode')
    return savedTheme !== null ? JSON.parse(savedTheme) : false
  })
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    return savedState !== null ? JSON.parse(savedState) : true
  })
  const [activeItem, setActiveItem] = useState(() => {
    const savedItem = localStorage.getItem('activeItem')
    return savedItem || "Faculty Creation"
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const navigate = useNavigate()

  // Sidebar navigation items
  const mainNavItems = [
    {
      name: "Faculty Creation",
      icon: Users,
      description: "Create new faculty accounts",
      url: "/admin/createFaculty/create-faculty",
    },
    {
      name: "Add Student",
      icon: UserPlus,
      description: "Enroll new students",
      url: "/admin/createFaculty/add-student",
    },
  ]

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const data = await checkAuth()
        if (data.user) {
          setUser(data.user)
        } else {
          navigate("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        navigate("/login")
      } finally {
        setUserLoading(false)
      }
    }
    checkAuthentication()
  }, [navigate])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  // Save active item to localStorage
  useEffect(() => {
    localStorage.setItem('activeItem', activeItem)
  }, [activeItem])

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      navigate("/login")
    } catch (error) {
      setError("Failed to log out")
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
      setShowLogoutDialog(false)
    }
  }

  if (userLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "5rem" : "16rem",
        }}
        className={`fixed inset-y-0 z-50 flex flex-col justify-between bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${isMobileOpen ? "left-0" : "-left-full md:left-0"}`}
      >
        <div className="flex flex-col flex-grow">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg font-bold text-gray-800 dark:text-white"
              >
                Admin Dashboard
              </motion.h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow px-2 py-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => {
                  setActiveItem(item.name)
                  setIsMobileOpen(false)
                }}
                className={`flex items-center gap-x-2 px-3 py-2 rounded-lg mb-1 transition-colors duration-200 ${
                  activeItem === item.name
                    ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className={`flex items-center gap-x-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 overflow-x-hidden ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        } transition-all duration-300`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout

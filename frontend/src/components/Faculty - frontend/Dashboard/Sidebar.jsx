"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  FileText,
  Code,
  HelpCircle,
  Heart,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react"

const SidebarDemo = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("Dashboard")
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  const mainNavItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      description: "Overview and analytics",
    },
    {
      name: "Profile",
      icon: User,
      badge: null,
      description: "Manage your account",
    },
    {
      name: "Settings",
      icon: Settings,
      badge: notifications,
      description: "App preferences",
    },
    {
      name: "Logout",
      icon: LogOut,
      badge: null,
      description: "Sign out of account",
    },
  ]

  const secondaryNavItems = [
    {
      name: "Documentation",
      icon: FileText,
      badge: null,
      description: "API docs and guides",
    },
    {
      name: "API reference",
      icon: Code,
      badge: "New",
      description: "Technical reference",
    },
    {
      name: "Support",
      icon: HelpCircle,
      badge: null,
      description: "Get help and support",
    },
    {
      name: "Sponsor",
      icon: Heart,
      badge: null,
      description: "Support the project",
    },
  ]

  const handleItemClick = (itemName) => {
    setActiveItem(itemName)
    setIsMobileOpen(false)

    // Simulate notification clearing for Settings
    if (itemName === "Settings" && notifications > 0) {
      setTimeout(() => setNotifications(0), 1000)
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const NavItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon

    return (
      <div className="relative group">
        <button
          onClick={() => onClick(item.name)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
            ${isCollapsed ? "justify-center px-2" : "justify-start"}
          `}
        >
          <div className="relative">
            <Icon
              className={`
                w-4 h-4 transition-colors duration-200 flex-shrink-0
                ${isActive ? "text-gray-700" : "text-gray-500 group-hover:text-gray-700"}
              `}
            />
            {item.badge && typeof item.badge === "number" && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>

          {!isCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left truncate">{item.name}</span>
              {item.badge && (
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                  ${
                    typeof item.badge === "number"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }
                `}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </button>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.name}
            {item.description && <div className="text-gray-300 text-xs">{item.description}</div>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobile} />}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:static top-0 left-0 h-full z-50 bg-white border-r border-gray-200 shadow-lg
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-72"}
      `}
      >
        {/* Header */}
        <div
          className={`
          flex items-center border-b border-gray-100 p-4
          ${isCollapsed ? "justify-center" : "justify-between"}
        `}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Acet Labs</h2>
                <p className="text-xs text-gray-500">Pro Plan</p>
              </div>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className={`
              p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200
              ${isCollapsed ? "mx-auto" : ""}
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.name} item={item} isActive={activeItem === item.name} onClick={handleItemClick} />
            ))}
          </div>

          {/* Separator */}
          <div className="mx-4 my-4 border-t border-gray-200"></div>

          <div className="p-3 space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem key={item.name} item={item} isActive={activeItem === item.name} onClick={handleItemClick} />
            ))}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john@acetlabs.com</p>
              </div>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeItem}</h1>
            <p className="text-gray-600">
              Welcome to the {activeItem.toLowerCase()} section. This is a dynamic sidebar demo.
            </p>
          </div>

          {/* Demo Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-2">Feature {i}</h3>
                <p className="text-gray-600 text-sm">
                  This is a sample card for the {activeItem} section with some demo content.
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-500">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarDemo

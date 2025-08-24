import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

const DashboardLayout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden relative">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
          sidebarVisible ? "translate-x-0" : "-translate-x-full",
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        )}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: darkMode 
            ? "0 0 15px 2px rgba(76, 29, 149, 0.3)" 
            : "0 0 15px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 relative z-10"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Menu Toggle Button */}
        <div className="p-4">
          <motion.button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={cn(
              "text-2xl p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-all",
              darkMode ? "text-white" : "text-gray-800"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MdMenu />
          </motion.button>
        </div>
        
        {/* Page Content */}
        <div className="px-6 pb-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
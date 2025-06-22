import { useEffect, useState } from "react";
import Sidebar from "../../Sidebar";
import { MdMenu } from "react-icons/md";
import LogoutModal from "../components/LogoutModal";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Handle full-page dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={`min-h-screen flex font-[Poppins] ${darkMode ? "bg-[#1f1f2e] text-white" : "bg-[#f9fafb] text-[#2e1065]"}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#2b2b3b] text-[#2e1065] dark:text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ☰ Menu Icon */}
        <button
          className="text-2xl mb-4"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <MdMenu />
        </button>

        <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

        {/* 🌗 Dark Mode Toggle */}
        <div className="rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2b2b3b] mb-6">
          <h2 className="text-lg font-semibold mb-4 text-[#ec4899] dark:text-pink-400">Appearance</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="w-5 h-5"
            />
            <span className="text-sm">Enable Dark Mode</span>
          </label>
        </div>

        {/* 🔐 Session Control Section */}
        <div className="rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2b2b3b]">
          <h2 className="text-lg font-semibold mb-4 text-[#ec4899] dark:text-pink-400">Session Control</h2>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 rounded-lg bg-[#ec4899] text-white hover:bg-pink-600 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* 🪄 Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
};

export default Settings;

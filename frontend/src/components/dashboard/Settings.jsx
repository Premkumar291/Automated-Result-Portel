import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import LogoutModal from "./LogoutModal";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div
      className={`min-h-screen font-[Poppins] flex bg-gradient-to-br ${
        darkMode
          ? "from-[#0f0c29] via-[#302b63] to-[#24243e] text-white"
          : "from-[#f3f4f6] via-[#e5e7eb] to-[#f9fafb] text-[#1f2937]"
      } transition-colors duration-300`}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 dark:bg-white/10 backdrop-blur-md text-white border-r border-white/20 shadow-xl transform transition-transform duration-300 ease-in-out ${
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
        {/* ☰ Menu */}
        <button
          className="text-2xl mb-4 text-white"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <MdMenu />
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-violet-500 text-transparent bg-clip-text">
          ⚙️ Settings
        </h1>

        {/* Appearance Section */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">
            🌗 Appearance
          </h2>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="w-6 h-6 accent-pink-500"
            />
            <span className="text-lg">Enable Dark Mode</span>
          </label>
        </div>

        {/* Logout Section */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">
            🔐 Session Control
          </h2>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* Logout Modal */}
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



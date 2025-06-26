import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUser,
  FaQuestionCircle,
  FaCog,
  FaFileUpload,
} from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";

const Sidebar = ({ onCloseSidebar }) => {
  const location = useLocation();

  const navItems = [
    { path: "/manage-results", label: "Manage Results", icon: <FaFileUpload /> },
    { path: "/analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/students", label: "Student List", icon: <FaUser /> },
    { path: "/profile", label: "Profile", icon: <MdDashboardCustomize /> },
    { path: "/help", label: "Help & Support", icon: <FaQuestionCircle /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div
      className="fixed md:static top-0 left-0 h-full w-64 z-50 font-[Poppins] bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white border-r border-white/10 shadow-xl transition-transform duration-300 ease-in-out"
      style={{ backdropFilter: "blur(15px)" }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 md:justify-center">
        <h2 className="text-xl font-bold text-cyan-300">🎓 Result Portal</h2>
        {/* Close Button (only on mobile view) */}
        <button
          onClick={onCloseSidebar}
          className="md:hidden text-white text-2xl hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            onClick={onCloseSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-300 ${
              location.pathname === item.path
                ? "bg-cyan-500/20 text-cyan-300"
                : "hover:bg-white/10 text-white hover:text-cyan-200"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

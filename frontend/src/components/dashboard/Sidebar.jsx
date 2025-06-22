import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUser,
  FaQuestionCircle,
  FaCog,
  FaTimes,
  FaFileUpload
} from "react-icons/fa";

const Sidebar = ({ onCloseSidebar }) => {
  const location = useLocation();

  const navItems = [
    { path: "/manage-results", label: "Manage Results", icon: <FaFileUpload /> },
    { path: "/analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/students", label: "Student List", icon: <FaUser /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
    { path: "/help", label: "Help & Support", icon: <FaQuestionCircle /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> }
  ];

  return (
    <div className="h-full flex flex-col bg-white shadow-lg font-[Poppins]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#2e1065]">📚 Result Portal</h2>
        <button onClick={onCloseSidebar} className="text-gray-500 text-lg hover:text-pink-600">
          <FaTimes />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-[#ec4899] text-white"
                : "text-gray-700 hover:bg-pink-50 hover:text-[#ec4899]"
            }`}
            onClick={onCloseSidebar}
          >
            <span className="text-md">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

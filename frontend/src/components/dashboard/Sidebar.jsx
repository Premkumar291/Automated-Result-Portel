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
    { path: "/manage-results", label: "Manage Results", icon: <FaFileUpload />, badge: "Active" },
    { path: "/analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/students", label: "Student List", icon: <FaUser /> },
    { path: "/profile", label: "Profile", icon: <MdDashboardCustomize /> },
    { path: "/help", label: "Help & Support", icon: <FaQuestionCircle /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="fixed md:static top-0 left-0 h-full w-64 z-50 font-[Poppins] bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-800 shadow-2xl relative overflow-hidden transition-transform duration-300 ease-in-out">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Sidebar Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 md:justify-center">
        <h2 className="text-xl font-bold text-cyan-300">🎓 Result Portal</h2>
        <button
          onClick={onCloseSidebar}
          className="md:hidden text-white text-2xl hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 p-4 space-y-2">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;

          return (
            <div key={idx} className="relative">
              <Link
                to={item.path}
                onClick={onCloseSidebar}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white shadow-lg border border-blue-400/30 transform scale-[1.03]"
                    : "text-blue-100 hover:text-white hover:bg-white/10 hover:scale-102"
                }`}
              >
                {/* Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl"></div>
                )}
                <span className="relative z-10 text-lg">
                  {item.icon}
                </span>
                <span className="relative z-10 font-medium flex-1 text-sm">
                  {item.label}
                </span>

                {/* Optional Badge */}
                {item.badge && (
                  <span className="relative z-10 text-xs px-2 py-1 rounded-full font-bold bg-green-500/20 text-green-300 border border-green-400/30">
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full"></div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdUploadFile,
  MdListAlt,
  MdPublish,
  MdAnalytics,
  MdGroup,
  MdPerson,
  MdHelpOutline,
  MdSettings,
  MdClose,
} from "react-icons/md";

const Sidebar = ({ onCloseSidebar }) => {
  const navItems = [
    { name: "Dashboard", icon: <MdDashboard />, path: "/dashboard" },
    { name: "Upload Results", icon: <MdUploadFile />, path: "/upload" },
    { name: "My Results", icon: <MdListAlt />, path: "/my-results" },
    { name: "Publish", icon: <MdPublish />, path: "/publish" },
    { name: "Analytics", icon: <MdAnalytics />, path: "/analytics" },
    { name: "Students", icon: <MdGroup />, path: "/students" },
    { name: "Profile", icon: <MdPerson />, path: "/profile" },
    { name: "Help", icon: <MdHelpOutline />, path: "/help" },
    { name: "Settings", icon: <MdSettings />, path: "/settings" }, // ✅ Added new section
  ];

  return (
    <div className="w-64 h-full bg-white shadow-md p-5 font-[Poppins] relative z-40">
      {/* ✖ Close Icon */}
      <button
        onClick={onCloseSidebar}
        className="absolute top-4 right-4 text-xl text-gray-500 hover:text-[#ec4899]"
      >
        <MdClose />
      </button>

      {/* Logo / Brand */}
      <h1 className="text-2xl font-extrabold text-[#2e1065] mb-10">ResultDash</h1>

      {/* Navigation */}
      <nav className="space-y-4 text-sm text-[#2e1065]">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-[#ec4899]/10 text-[#ec4899] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
            onClick={onCloseSidebar}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

import { MdMenu } from "react-icons/md";

const Header = ({ onMenuClick }) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b">
      {/* ☰ Toggle Icon - now always visible */}
      <button onClick={onMenuClick} className="text-2xl text-[#2e1065]">
        <MdMenu />
      </button>

      <h2 className="text-xl font-semibold text-[#2e1065]">Welcome, Faculty 👋</h2>

      <input
        type="text"
        placeholder="Search..."
        className="px-4 py-1 border rounded-lg focus:outline-none text-sm"
      />
    </div>
  );
};

export default Header;

// Sidebar.jsx
import React from 'react';
import { MdClose, MdDashboard } from "react-icons/md"

const Sidebar = ({ onCloseSidebar }) => {
  return (
    <div className="h-full bg-white shadow-xl border-r border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Admin Menu</h2>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onCloseSidebar}
        >
          <MdClose className="text-2xl" />
        </button>
      </div>
      <nav className="space-y-4">
        <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all">
          <MdDashboard /> Dashboard
        </a>
        {/* Add more nav links if needed */}
      </nav>
    </div>
  )
}

export default Sidebar

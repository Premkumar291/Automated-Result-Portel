import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { MdMenu } from "react-icons/md";

const PublishResults = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [examType, setExamType] = useState("");
  const [message, setMessage] = useState("");

  const handlePublish = () => {
    if (!examType) {
      setMessage("⚠️ Please select a result type to publish.");
      return;
    }
    setMessage(`✅ ${examType} results published successfully!`);
    // backend publish call goes here
  };

  return (
    <div className="flex min-h-screen font-[Poppins] bg-[#f9f9fb] overflow-x-hidden">
      {/* 🔧 Sidebar - with transition */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* 📋 Main Publish Page */}
      <motion.div
        className="flex-1 p-8 ml-0"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ☰ Toggle Icon */}
        <div className="mb-6">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-[#2e1065] mb-6">📢 Publish Results</h2>

        <div className="max-w-xl space-y-5 bg-white p-6 rounded-xl shadow border border-[#e2e8f0]">
          <div>
            <label className="block text-sm font-semibold text-[#2e1065] mb-1">Choose Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
            >
              <option value="">-- Select Type --</option>
              <option value="Internal">Internal</option>
              <option value="Model">Model</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <button
            onClick={handlePublish}
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            Publish Now
          </button>

          {message && (
            <p className="text-center text-sm mt-2 font-medium text-[#2e1065]">{message}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PublishResults;

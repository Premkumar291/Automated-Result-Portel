import { useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const Profile = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const facultyInfo = {
    name: "Krish Deepak",
    email: "krish.deepak@college.edu",
    staffId: "FAC12345",
    department: "Computer Science",
    role: "Assistant Professor",
    phone: "+91 98765 43210",
    location: "Tamil Nadu, India",
  };

  return (
    <div className="flex min-h-screen font-[Poppins] bg-[#f9fafb] text-[#2e1065] overflow-x-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Section */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ☰ Sidebar Toggle */}
        <div className="p-4">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        {/* Top Glowing Banner */}
        <div className="relative bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#ec4899] h-64 rounded-b-[40px] shadow-md flex flex-col items-center justify-end pb-14">
          {/* Profile Icon */}
          <div className="absolute top-28 w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-[#9333ea] text-[80px]">
            <FaUserCircle />
          </div>
        </div>

        {/* Bottom White Card */}
        <div className="bg-white mt-20 mx-auto max-w-3xl p-6 rounded-3xl shadow-xl border border-[#e2e8f0] text-center">
          <h2 className="text-2xl font-bold text-[#2e1065]">{facultyInfo.name}</h2>
          <p className="text-sm text-gray-500">{facultyInfo.role}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mt-6">
            <div>
              <span className="font-semibold text-[#2e1065]">Email:</span><br />
              {facultyInfo.email}
            </div>
            <div>
              <span className="font-semibold text-[#2e1065]">Phone:</span><br />
              {facultyInfo.phone}
            </div>
            <div>
              <span className="font-semibold text-[#2e1065]">Department:</span><br />
              {facultyInfo.department}
            </div>
            <div>
              <span className="font-semibold text-[#2e1065]">Staff ID:</span><br />
              {facultyInfo.staffId}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-[#2e1065]">Location:</span><br />
              {facultyInfo.location}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

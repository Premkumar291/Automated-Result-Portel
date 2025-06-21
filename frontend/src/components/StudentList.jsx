import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";

const StudentList = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  const students = [
    { reg: "CSE1001", name: "Krish D", dept: "CSE", year: "II" },
    { reg: "ECE1002", name: "Mithra S", dept: "ECE", year: "I" },
    { reg: "EEE1003", name: "Arjun V", dept: "EEE", year: "III" },
    { reg: "CSE1004", name: "Nivetha R", dept: "CSE", year: "II" },
    { reg: "ECE1005", name: "Sundar M", dept: "ECE", year: "I" },
    { reg: "EEE1006", name: "Keerthi L", dept: "EEE", year: "III" },
    { reg: "CSE1007", name: "Ajith P", dept: "CSE", year: "II" },
    { reg: "ECE1008", name: "Divya N", dept: "ECE", year: "I" },
    { reg: "EEE1009", name: "Vikram A", dept: "EEE", year: "III" },
    { reg: "CSE1010", name: "Sneha K", dept: "CSE", year: "II" },
    { reg: "ECE1011", name: "Mani K", dept: "ECE", year: "I" },
    { reg: "EEE1012", name: "Santhosh G", dept: "EEE", year: "III" },
    { reg: "CSE1013", name: "Priya R", dept: "CSE", year: "II" },
    { reg: "ECE1014", name: "Bharath R", dept: "ECE", year: "I" },
    { reg: "EEE1015", name: "Lavanya T", dept: "EEE", year: "III" },
  ];

  const filteredStudents = students.filter((s) =>
    selectedClass ? `${s.dept} - ${s.year}` === selectedClass : true
  );

  const classOptions = [...new Set(students.map((s) => `${s.dept} - ${s.year}`))];

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

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ☰ Sidebar Icon */}
        <div className="mb-4">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold mb-4">🧑‍🎓 Student List</h2>

        {/* Filter Dropdown */}
        <div className="mb-4">
          <select
            className="px-4 py-2 border border-[#ec4899] rounded-lg focus:outline-none text-sm"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classOptions.map((cls, idx) => (
              <option key={idx} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-md border border-[#e2e8f0] overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#f3f4f6] text-[#ec4899] font-semibold">
              <tr>
                <th className="px-4 py-2">Reg No</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Year</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{s.reg}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.dept}</td>
                    <td className="px-4 py-2">{s.year}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentList;

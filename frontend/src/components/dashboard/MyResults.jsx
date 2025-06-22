import { useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";

const MyResults = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const mockResults = [
    { reg: "CSE101", name: "Krish D", class: "CSE - II", subject: "Maths", exam: "Model", mark: 88, grade: "A+" },
    { reg: "ECE102", name: "Mithra S", class: "ECE - I", subject: "Physics", exam: "Internal", mark: 75, grade: "B+" },
    { reg: "EEE103", name: "Gokul V", class: "EEE - III", subject: "Maths", exam: "Final", mark: 92, grade: "A+" },
    { reg: "CSE104", name: "Anjali R", class: "CSE - II", subject: "DSA", exam: "Model", mark: 81, grade: "A" },
    { reg: "ECE105", name: "Raj M", class: "ECE - I", subject: "Maths", exam: "Internal", mark: 68, grade: "B" },
    { reg: "CSE106", name: "Sneha K", class: "CSE - II", subject: "DSA", exam: "Final", mark: 89, grade: "A+" },
    { reg: "EEE107", name: "Dev S", class: "EEE - III", subject: "Physics", exam: "Model", mark: 79, grade: "B+" },
    { reg: "CSE108", name: "Sahana N", class: "CSE - II", subject: "Maths", exam: "Model", mark: 90, grade: "A+" },
    { reg: "ECE109", name: "Vishal J", class: "ECE - I", subject: "DSA", exam: "Final", mark: 77, grade: "B+" },
  ];

  const filteredResults = mockResults.filter((res) => {
    return (
      (selectedClass ? res.class === selectedClass : true) &&
      (selectedSubject ? res.subject === selectedSubject : true) &&
      (selectedExam ? res.exam === selectedExam : true)
    );
  });

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
        className="flex-1 p-8 ml-0"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ☰ Sidebar Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6">📑 My Results</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#ec4899] focus:outline-none"
          >
            <option value="">All Classes</option>
            <option value="CSE - II">CSE - II</option>
            <option value="ECE - I">ECE - I</option>
            <option value="EEE - III">EEE - III</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#ec4899] focus:outline-none"
          >
            <option value="">All Subjects</option>
            <option value="Maths">Maths</option>
            <option value="Physics">Physics</option>
            <option value="DSA">DSA</option>
          </select>

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#ec4899] focus:outline-none"
          >
            <option value="">All Exams</option>
            <option value="Internal">Internal</option>
            <option value="Model">Model</option>
            <option value="Final">Final</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-[#e2e8f0]">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#f3f4f6] text-[#ec4899] font-semibold">
              <tr>
                <th className="px-4 py-3">Reg No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Mark</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{res.reg}</td>
                    <td className="px-4 py-2">{res.name}</td>
                    <td className="px-4 py-2">{res.class}</td>
                    <td className="px-4 py-2">{res.subject}</td>
                    <td className="px-4 py-2">{res.exam}</td>
                    <td className="px-4 py-2">{res.mark}</td>
                    <td className="px-4 py-2">{res.grade}</td>
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

export default MyResults;

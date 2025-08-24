import { useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 🧠 Mock Data
  const subjectAverages = {
    labels: ["Maths", "Physics", "DSA"],
    datasets: [
      {
        label: "Average Score",
        data: [85, 78, 88],
        backgroundColor: ["#ec4899", "#6366f1", "#10b981"],
        borderRadius: 10,
      },
    ],
  };

  const passFailData = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        data: [78, 22],
        backgroundColor: ["#10b981", "#ef4444"],
        hoverOffset: 10,
      },
    ],
  };

  const topPerformers = [
    { reg: "CSE1021", name: "Krish D", subject: "Maths", mark: 95 },
    { reg: "ECE1043", name: "Mithra S", subject: "DSA", mark: 92 },
    { reg: "EEE1055", name: "Arun K", subject: "Physics", mark: 90 },
  ];

  const classAverages = {
    labels: ["CSE - II", "ECE - I", "EEE - III"],
    datasets: [
      {
        label: "Maths",
        data: [86, 79, 73],
        backgroundColor: "#ec4899",
      },
      {
        label: "DSA",
        data: [91, 84, 80],
        backgroundColor: "#6366f1",
      },
      {
        label: "Physics",
        data: [78, 76, 81],
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div
      className="flex min-h-screen font-[Poppins] text-[#2e1065] overflow-x-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main */}
      <motion.div
        className="flex-1 p-8 ml-0"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ☰ Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-white"
          >
            <MdMenu />
          </button>
        </div>

        <h2 className="text-3xl font-extrabold mb-6 text-white drop-shadow">📊 Analytics</h2>

        {/* Analytics Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 📈 Subject Average */}
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#e2e8f0] backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4">Subject-wise Average Marks</h3>
            <Bar data={subjectAverages} options={{ responsive: true }} />
          </div>

          {/* 🥧 Pass/Fail */}
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#e2e8f0] backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4">Pass vs Fail Ratio</h3>
            <Pie data={passFailData} />
          </div>

          {/* 👑 Top Performers */}
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#e2e8f0] col-span-1 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4">Top Performers</h3>
            <table className="w-full text-sm text-left border">
              <thead className="bg-[#f3f4f6] text-[#ec4899]">
                <tr>
                  <th className="px-3 py-2">Reg No</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Mark</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{item.reg}</td>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.subject}</td>
                    <td className="px-3 py-2 font-medium">{item.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🏫 Class-Wise Avg */}
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#e2e8f0] col-span-1 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4">Class-wise Subject Comparison</h3>
            <Bar data={classAverages} options={{ responsive: true }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;

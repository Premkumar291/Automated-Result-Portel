import { useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import backgroundImage from "../../assets/background1.jpg";


const ManageResults = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = () => {
    if (!file) {
      setMessage("⚠️ Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log("Parsed:", json);
        setResults(json);
        setMessage("✅ File parsed successfully!");
      } catch {
        setMessage("❌ Invalid file format.");
      }
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const chartData = [
    { subject: "Math", pass: 78 },
    { subject: "DSA", pass: 84 },
    { subject: "DBMS", pass: 91 },
  ];

  return (
    <div
      className="min-h-screen font-[Poppins] text-[#121212]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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

      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 shadow bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            className="text-2xl text-white"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <MdMenu />
          </button>
          <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] tracking-wide">
            Result Portal 🎓
          </h1>
        </div>
        <p className="text-sm font-medium text-white">Information Technology</p>
      </div>

      {/* Content */}
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-white font-['Playfair_Display'] drop-shadow-xl"
        >
          Manage Results 📂
        </motion.h2>

        {/* Upload Card */}
        <div className="bg-white h-[450px] md:w-[90%] mx-auto mb-12 rounded-3xl shadow-xl border border-indigo-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl backdrop-blur-sm bg-opacity-90">
          <h3 className="text-3xl font-bold mb-6 text-[#2e1065]">
            Upload New Result
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-4/5">
            <input
              type="file"
              accept=".xlsx,.csv,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="border px-6 py-3 rounded-xl w-full sm:w-1/2 bg-[#f9fafb] text-sm shadow"
            />
            <button
              onClick={handleUpload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Upload
            </button>
          </div>
          {message && (
            <p className="text-sm mt-4 text-[#2e1065] font-medium">{message}</p>
          )}
        </div>

        {/* Spinner */}
        {isLoading && (
          <div className="text-center text-indigo-600 font-semibold mb-4 animate-pulse">
            Uploading & parsing your file...
          </div>
        )}

        {/* Chart Display */}
        <div className="bg-white p-6 rounded-xl shadow border mb-10 backdrop-blur-md bg-opacity-90">
          <h3 className="text-xl font-semibold mb-4 text-[#2e1065]">
            Performance Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pass" fill="#2e1065" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Results Table */}
        <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto animate-fade-in backdrop-blur-lg bg-opacity-90">
          <h3 className="text-xl font-semibold mb-4 text-[#2e1065]">
            Results Management
          </h3>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#f3f4f6] text-[#2e1065] font-semibold">
              <tr>
                <th className="py-2 px-4">Roll No</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Subject</th>
                <th className="py-2 px-4">Marks</th>
                <th className="py-2 px-4">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-100">
                    <td className="py-2 px-4">{row["Roll No"]}</td>
                    <td className="py-2 px-4">{row["Name"]}</td>
                    <td className="py-2 px-4">{row["Subject"]}</td>
                    <td className="py-2 px-4">{row["Marks"]}</td>
                    <td
                      className={`py-2 px-4 font-bold ${
                        row["Marks"] >= 50 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {row["Marks"] >= 50 ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No results uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageResults;

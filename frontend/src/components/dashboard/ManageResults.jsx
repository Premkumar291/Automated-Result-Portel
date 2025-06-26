import { useState, useRef } from "react";
import { MdMenu } from "react-icons/md";
import * as XLSX from "xlsx";
import Sidebar from "./Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ManageResults = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (!file) {
      setMessage("⚠️ Please select a file.");
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-[Inter] relative overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            className="text-2xl text-white"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <MdMenu />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            Result Portal 🎓
          </h1>
        </div>
        <span className="text-sm px-4 py-2 rounded-full border border-pink-400/40 bg-pink-600/20 text-pink-200">
          InfoTech
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent">
          Upload & Manage Results
        </h2>
        <p className="text-center text-gray-300 mb-10">
          Seamlessly upload and track student performance with futuristic analytics and UI.
        </p>

        {/* Upload Section */}
        <div className="bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10 mb-12">
          <h3 className="text-2xl font-bold mb-2 text-white text-center">Upload Result File</h3>
          <p className="text-center text-gray-400 mb-6">Accepts .xlsx or .csv format</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={handlePlusClick}
              className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-500 shadow-md"
            >
              Select File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              onClick={handleUpload}
              className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
            >
              Upload & Process
            </button>
          </div>
          {message && <p className="mt-4 text-center text-emerald-300">{message}</p>}
        </div>

        {/* Loading Message */}
        {isLoading && (
          <div className="text-center text-cyan-300 mb-8 animate-pulse">
            ⏳ Processing your file...
          </div>
        )}

        {/* Chart Section */}
        <div className="bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 mb-12">
          <h3 className="text-xl font-semibold mb-4 text-white">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="subject" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="pass" fill="#f472b6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table Section */}
        <div className="bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4 text-white">Results Management</h3>
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-pink-300 border-b border-white/10">
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
                  <tr
                    key={idx}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="py-2 px-4">{row["Roll No"]}</td>
                    <td className="py-2 px-4">{row["Name"]}</td>
                    <td className="py-2 px-4">{row["Subject"]}</td>
                    <td className="py-2 px-4">{row["Marks"]}</td>
                    <td
                      className={`py-2 px-4 font-bold ${
                        row["Marks"] >= 50 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {row["Marks"] >= 50 ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    No data uploaded yet.
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



import { useState } from "react";
import Sidebar from "../Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

const UploadResults = () => {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleUpload = () => {
    if (!className || !subject || !file) {
      setMessage("⚠️ Please fill all fields and choose a file.");
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === "pdf") {
      setPreviewData([]);
      setMessage("✅ PDF file uploaded successfully!");
    } else if (fileExtension === "csv" || fileExtension === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setPreviewData(json);
        setMessage("✅ File uploaded and parsed successfully!");
      };
      reader.readAsArrayBuffer(file);
    } else {
      setMessage("❌ Unsupported file format. Please upload .csv, .xlsx or .pdf files only.");
      setPreviewData([]);
    }
  };

  return (
    <div className="flex min-h-screen font-[Poppins] bg-[#f9f9fb] overflow-x-hidden">
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
        className="flex-1 p-8 ml-0"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ☰ Menu Icon */}
        <div className="mb-6">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-[#2e1065] mb-6">📤 Upload Results</h2>

        {/* Upload Form */}
        <div className="space-y-4 max-w-xl bg-white shadow p-6 rounded-xl border border-[#e2e8f0]">
          <div>
            <label className="block text-sm font-semibold text-[#2e1065] mb-1">Class</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
            >
              <option value="">-- Select Class --</option>
              <option value="CSE - II Year">CSE - II Year</option>
              <option value="ECE - I Year">ECE - I Year</option>
              <option value="EEE - III Year">EEE - III Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2e1065] mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
            >
              <option value="">-- Select Subject --</option>
              <option value="Maths">Maths</option>
              <option value="Physics">Physics</option>
              <option value="DSA">DSA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2e1065] mb-1">Upload File (.csv, .xlsx, .pdf)</label>
            <input
              type="file"
              accept=".csv,.xlsx,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2 bg-[#f9fafb] file:mr-4 file:px-2 file:py-1 file:border-0 file:bg-[#ec4899] file:text-white hover:file:bg-pink-600"
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            Upload and Preview
          </button>

          {message && (
            <p className="text-center text-sm mt-2 font-medium text-[#2e1065]">{message}</p>
          )}
        </div>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-10 bg-white p-6 rounded-xl shadow border border-[#e2e8f0] overflow-x-auto">
            <h3 className="text-lg font-bold text-[#2e1065] mb-4">🔍 Preview of Uploaded Data</h3>
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#f3f4f6] text-[#2e1065] font-semibold">
                <tr>
                  {Object.keys(previewData[0]).map((key, idx) => (
                    <th key={idx} className="py-2 px-4 border">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-2 px-4 border">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadResults;

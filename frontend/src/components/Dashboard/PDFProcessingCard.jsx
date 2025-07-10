import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function PDFProcessingCard() {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [semesterPDFs, setSemesterPDFs] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setSemesterPDFs([]);
    setSelectedSemester("");
    setUploadId("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await axios.post(`${API_URL}/pdf-split/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("PDF uploaded and split successfully!");
      setUploadId(res.data.uploadName);
      // Fetch semester PDFs
      const listRes = await axios.get(`${API_URL}/pdf-split/${res.data.uploadName}`);
      setSemesterPDFs(listRes.data);
    } catch {
      toast.error("Failed to upload or split PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleDownload = async () => {
    if (!selectedSemester) return;
    try {
      const res = await axios.get(`${API_URL}/pdf-split/${uploadId}/${selectedSemester}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Semester_${selectedSemester}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Department Result PDF Splitter</h3>
      <p className="text-gray-600 mb-4">Upload a department result PDF and split it into 8 semester files.</p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-2 border-2 border-dashed rounded p-4 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        onClick={() => !uploading && fileInputRef.current.click()}
      >
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <span className="text-blue-600">Uploading and splitting...</span>
        ) : (
          <span className="text-gray-600">Drag & drop a PDF here, or click to select</span>
        )}
      </div>
      {semesterPDFs.length > 0 && (
        <div className="mt-4">
          <label className="block mb-1 font-medium">Select Semester PDF:</label>
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className="border rounded px-2 py-1 mb-2"
          >
            <option value="">-- Select Semester --</option>
            {semesterPDFs.map((pdf) => (
              <option key={pdf.semester} value={pdf.semester}>
                Semester {pdf.semester}
              </option>
            ))}
          </select>
          <button
            onClick={handleDownload}
            disabled={!selectedSemester}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}

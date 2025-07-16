import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, Download, TrendingUp } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function PDFProcessingCard() {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [loadingSemesterList, setLoadingSemesterList] = useState(false);
  const [semesterPDFs, setSemesterPDFs] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  // Fixed auto-delete hours to 1
  // Fixed confidence threshold value of 0.8
  const [viewingPdfId, setViewingPdfId] = useState(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setSemesterPDFs([]);
    setSelectedSemester("");
    setUploadId("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      // Always use fixed auto-delete hours of 1
      formData.append("autoDeleteHours", "1");
      // Always use fixed confidence threshold of 0.8
      formData.append("confidenceThreshold", "0.8");
      
      // Delete old PDFs before uploading new one
      if (uploadId) {
        try {
          await axios.delete(`${API_URL}/pdf/${uploadId}`);
          console.log(`Deleted previous PDFs for ${uploadId}`);
        } catch (err) {
          console.error("Failed to delete previous PDFs", err);
        }
      }
      
      // Use the new GridFS-based API endpoint
      const res = await axios.post(`${API_URL}/pdf/split`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("PDF uploaded and split successfully!");
      setUploadId(res.data.uploadName);
      
      // Fetch semester PDFs using the new API
      setLoadingSemesterList(true);
      const listRes = await axios.get(`${API_URL}/pdf/${res.data.uploadName}`);
      setSemesterPDFs(listRes.data);
      
      // Show auto-delete information
      if (res.data.autoDeleteScheduled && res.data.deleteAt) {
        const deleteDate = new Date(res.data.deleteAt);
        toast.success(`PDFs will be auto-deleted at ${deleteDate.toLocaleString()}`);
      }
      
      // Show number of semester PDFs created
      if (listRes.data && listRes.data.length > 0) {
        toast.success(`Created ${listRes.data.length} semester PDF${listRes.data.length !== 1 ? 's' : ''}`);
      }
      setLoadingSemesterList(false);
    } catch (error) {
      // Display the specific error message from the backend if available
      const errorMessage = error.response?.data?.message || "Failed to upload or split PDF";
      toast.error(errorMessage);
      console.error("Upload error:", error);
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

  const handleDownload = async (pdfId) => {
    try {
      // If specific PDF ID is provided, use it
      if (pdfId) {
        setDownloadingPdfId(pdfId);
        window.open(`${API_URL}/pdf/view/${pdfId}?download=true`, '_blank');
        // Reset downloading state after a short delay
        setTimeout(() => setDownloadingPdfId(null), 500);
      } 
      // Otherwise use the selected semester from dropdown
      else if (selectedSemester) {
        const selectedPdf = semesterPDFs.find(pdf => pdf.semester === parseInt(selectedSemester));
        
        if (selectedPdf && selectedPdf.id) {
          // Use the ID-based endpoint
          window.open(`${API_URL}/pdf/view/${selectedPdf.id}?download=true`, '_blank');
        } else {
          // Fallback to the uploadId/semester endpoint
          window.open(`${API_URL}/pdf/${uploadId}/${selectedSemester}?download=true`, '_blank');
        }
      }
    } catch (error) {
      toast.error("Failed to download PDF");
      console.error("Download error:", error);
      setDownloadingPdfId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Department Result PDF Splitter</h3>
      <p className="text-gray-600 mb-4">Upload a department result PDF and split it into 8 semester files.</p>
      
      {/* Files will be automatically deleted after 1 hour */}
      <div className="mb-4 text-xs text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Files will be automatically deleted after 1 hour ({new Date(Date.now() + 60 * 60 * 1000).toLocaleString()})</span>
      </div>
      

      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'} ${uploading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
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
        <div className="flex flex-col items-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          ) : (
            <svg
              className={`w-12 h-12 mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
          )}
          <p className="mb-2 text-sm text-gray-700">
            {uploading ? (
              <span className="font-semibold">Uploading and processing PDF...</span>
            ) : (
              <>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            {uploading ? (
              <span>This may take a moment depending on file size</span>
            ) : (
              <span>PDF only (MAX. 50MB)</span>
            )}
          </p>
          {!uploading && (
            <div className="mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>PDF will be split by semester markers</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-semibold text-gray-800">Semester PDFs</h4>
          {semesterPDFs.length > 0 && !loadingSemesterList && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {semesterPDFs.length} PDF{semesterPDFs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {loadingSemesterList ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading semester PDFs...</p>
            </div>
          </div>
        ) : semesterPDFs.length > 0 ? (
          /* List of semester PDFs with View icon */
          <div className="mt-2 rounded-lg overflow-hidden shadow-lg bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {semesterPDFs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-gray-50 border-b border-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">Semester {pdf.semester}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {pdf.filename}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <a 
                        href={`${API_URL}/pdf/view/${pdf.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1.5 ${viewingPdfId === pdf.id ? 'bg-blue-200' : 'bg-blue-100'} text-blue-700 rounded-md hover:bg-blue-200 mr-2 shadow-sm transition-all duration-200 ${viewingPdfId === pdf.id ? 'cursor-wait' : ''}`}
                        title="View PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Set loading state
                          setViewingPdfId(pdf.id);
                          
                          // If the file fails to load, show a toast
                          const img = new Image();
                          img.onerror = () => {
                            toast.error("Unable to load the PDF file.");
                            setViewingPdfId(null);
                          };
                          img.onload = () => {
                            // Reset loading state after a short delay
                            setTimeout(() => setViewingPdfId(null), 500);
                          };
                          img.src = `${API_URL}/pdf/view/${pdf.id}`;
                        }}
                      >
                        <Eye size={16} className="mr-1" />
                        <span>{viewingPdfId === pdf.id ? 'Opening...' : 'View'}</span>
                      </a>
                      <button
                        onClick={() => handleDownload(pdf.id, pdf.semester)}
                        className={`inline-flex items-center px-3 py-1.5 ${downloadingPdfId === pdf.id ? 'bg-gray-200' : 'bg-gray-100'} text-gray-700 rounded-md hover:bg-gray-200 mr-2 shadow-sm transition-all duration-200 ${downloadingPdfId === pdf.id ? 'cursor-wait' : ''}`}
                        title="Download PDF"
                        disabled={downloadingPdfId === pdf.id}
                      >
                        <Download size={16} className="mr-1" />
                        <span>{downloadingPdfId === pdf.id ? 'Downloading...' : 'Download'}</span>
                      </button>
                      <div className="relative inline-block">
                        <a 
                          href={`/result-analysis?id=${pdf.id}&semester=${pdf.semester}`}
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 shadow-sm transition-all duration-200"
                          title="Analyze this semester's results"
                        >
                          <TrendingUp size={16} className="mr-1" />
                          <span>Analyze</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Processing PDF...</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">No semester PDFs available</p>
                <p className="text-sm text-gray-500">Upload a PDF to split it into semester files</p>
              </div>
            )}
          </div>
        )}
          
        {/* Keep the dropdown for backward compatibility */}
        <div className="mt-4 hidden">
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
            onClick={() => handleDownload()}
            disabled={!selectedSemester}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

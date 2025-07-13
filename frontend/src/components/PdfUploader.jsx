import { useState } from 'react';
import axios from 'axios';

const PdfUploader = () => {
  const [file, setFile] = useState(null);
  const [autoDeleteHours, setAutoDeleteHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [semesterPdfs, setSemesterPdfs] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSemesterPdfs([]);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('autoDeleteHours', autoDeleteHours.toString());

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/pdf-split/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      setResult(response.data);

      // Fetch the list of semester PDFs
      if (response.data.uploadName) {
        const pdfsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/pdf-split/${response.data.uploadName}`,
          { withCredentials: true }
        );
        setSemesterPdfs(pdfsResponse.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to upload and split PDF. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (uploadName, semester) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/pdf-split/${uploadName}/${semester}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Semester_${semester}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download the PDF. It may have been auto-deleted.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload and Split PDF</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Select PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Auto-Delete After (hours)
        </label>
        <input
          type="number"
          min="1"
          max="24"
          value={autoDeleteHours}
          onChange={(e) => setAutoDeleteHours(parseInt(e.target.value) || 1)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <p className="text-sm text-gray-500 mt-1">
          PDFs will be automatically deleted after this many hours
        </p>
      </div>
      
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`w-full py-2 px-4 rounded font-bold ${loading || !file
          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {loading ? 'Processing...' : 'Upload and Split PDF'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <p>PDF successfully split into {semesterPdfs.length} semester PDFs!</p>
          <p className="text-sm">
            Auto-delete scheduled after {autoDeleteHours} hour(s)
          </p>
        </div>
      )}
      
      {semesterPdfs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Semester PDFs</h3>
          <div className="space-y-2">
            {semesterPdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <span>Semester {pdf.semester}</span>
                <button
                  onClick={() => handleDownload(result.uploadName, pdf.semester)}
                  className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
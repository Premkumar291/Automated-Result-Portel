import { useState } from 'react';
import { toast } from 'react-hot-toast';
import pdfReportsApi from '@/api/pdfReports';

// Faculty Report Editor Component
function FacultyReportEditor({ analysisData, semester, academicYear, department }) {
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!facultyName) {
      toast.error('Please enter the faculty name.');
      return;
    }

    setLoading(true);
    try {
      // Generate PDF report
      const response = await pdfReportsApi.generateReport({
        facultyName,
        semester,
        academicYear,
        department,
        analysisData
      });

      toast.success('PDF report generated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h3 className="text-lg font-bold">Faculty Report Editor</h3>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Faculty Name</label>
        <input
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
          placeholder="Enter faculty name"
        />
      </div>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate PDF Report'}
        </button>
      </div>
    </div>
  );
}

export default FacultyReportEditor;


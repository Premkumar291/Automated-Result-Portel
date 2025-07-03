import { useState, useEffect } from 'react';
import { getSemesters } from '../../api/pdfAnalysis';

const SemesterDropdown = ({ selectedSemester, onSemesterChange }) => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await getSemesters();
      setSemesters(response.data || []);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Semester
      </label>
      <select
        value={selectedSemester}
        onChange={(e) => onSemesterChange(e.target.value)}
        disabled={loading}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="all">All Semesters</option>
        {semesters.map((semester) => (
          <option key={semester} value={semester}>
            {semester}
          </option>
        ))}
      </select>
      {loading && (
        <p className="text-xs text-gray-500 mt-1">Loading semesters...</p>
      )}
    </div>
  );
};

export default SemesterDropdown;

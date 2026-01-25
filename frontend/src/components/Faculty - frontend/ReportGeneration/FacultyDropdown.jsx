import React, { useState, useEffect } from 'react';
import { User, AlertCircle, Loader } from 'lucide-react';
import { facultyAPI } from '../../../api/faculty';
import { getCurrentUserCollegeName } from '../../../utils/userUtils';

const FacultyDropdown = ({ subjectCode, value, onChange, error, facultyList = [], loading = false }) => {
  // Remove internal state for list and fetching


  const handleChange = (e) => {
    const selectedFacultyId = e.target.value;

    // If "No Staff" is selected, pass dash symbol for both name and department
    if (selectedFacultyId === 'NO_STAFF') {
      onChange(subjectCode, '-', '-'); // Pass dash for both name and department
      return;
    }

    // If clearing selection
    if (selectedFacultyId === '') {
      onChange(subjectCode, '', ''); // Pass empty strings
      return;
    }

    // Find the selected faculty member
    const selectedFaculty = facultyList.find(faculty => faculty._id === selectedFacultyId);

    if (selectedFaculty) {
      // Pass the faculty name with title, initials, and full name format
      onChange(subjectCode, `${selectedFaculty.title} ${selectedFaculty.initials} ${selectedFaculty.name}`, selectedFaculty.department);
    } else {
      // Clear selection
      onChange(subjectCode, '', '');
    }
  };

  // Find the faculty ID that matches the current value (display name)
  const getSelectedFacultyId = () => {
    // Special case for "No Staff"
    if (value === '-') return 'NO_STAFF';

    // If no value or empty value
    if (!value) return '';

    // Find faculty by matching the display name
    const matchedFaculty = facultyList.find(faculty =>
      `${faculty.title} ${faculty.initials} ${faculty.name}` === value
    );

    return matchedFaculty ? matchedFaculty._id : '';
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center">
          <Loader className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          <select
            disabled
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          >
            <option>Loading faculty...</option>
          </select>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <select
          value={getSelectedFacultyId()}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : 'border-gray-300'
            }`}
        >
          <option value="">Select faculty member...</option>
          <option value="NO_STAFF">No Staff</option>
          {facultyList.map((faculty) => (
            <option key={faculty._id} value={faculty._id}>
              {faculty.title} {faculty.initials} {faculty.name} - {faculty.department}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

    </div>
  );
};

export default FacultyDropdown;
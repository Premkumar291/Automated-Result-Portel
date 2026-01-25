import React from 'react';
import { User, AlertCircle } from 'lucide-react';
import FacultyDropdown from './FacultyDropdown';

const FacultyNameInput = ({ subjectCode, value, onChange, error, facultyList }) => {
  // Always use the dropdown component since we're showing all faculty
  return (
    <FacultyDropdown
      subjectCode={subjectCode}
      value={value}
      onChange={(subjectCode, facultyName, facultyDepartment) => {
        // Call the original onChange with all parameters
        onChange(subjectCode, facultyName, facultyDepartment);
      }}
      error={error}
      facultyList={facultyList}
    />
  );
};

export default FacultyNameInput;
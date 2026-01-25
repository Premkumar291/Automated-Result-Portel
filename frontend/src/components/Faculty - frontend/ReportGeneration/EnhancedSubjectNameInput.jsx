import React, { useState, useEffect } from 'react';
import { Book, AlertCircle, CheckCircle, Minus } from 'lucide-react';
// Removed subjectAPI import as it is no longer used directly
// import { subjectAPI } from '../../../api/subjects';

const EnhancedSubjectNameInput = ({ subjectCode, value, onChange, error, subjectsList = [] }) => {
  const [dbSubjectName, setDbSubjectName] = useState(null);
  const [showInput, setShowInput] = useState(false);

  // Look up subject name from the provided list
  useEffect(() => {
    if (!subjectCode || !subjectsList) return;

    const findSubject = () => {
      // Find exact match in the provided list
      const exactMatch = subjectsList.find(s => s.subjectCode === subjectCode);

      if (exactMatch) {
        setDbSubjectName(exactMatch.subjectName);

        // If no value set yet, or value is the code, or value is dash
        if (!value || value === subjectCode || value === '--') {
          onChange(subjectCode, exactMatch.subjectName);
          setShowInput(false);
        } else if (value === exactMatch.subjectName) {
          // Value matches DB name
          setShowInput(false);
        } else {
          // Value differs from DB name (custom), show input
          setShowInput(true);
        }
      } else {
        // Not found in DB list
        setDbSubjectName(null);
        // If we don't have a valid value yet, default to subject code? Or let user type.
        // If value is empty, we force user to type.
        setShowInput(true);
      }
    };

    findSubject();
  }, [subjectCode, subjectsList, value, onChange]);

  const handleInputChange = (e) => {
    onChange(subjectCode, e.target.value);
  };

  // If we have a database subject name and it matches the current value, show a readonly field
  const shouldShowReadOnly = !showInput && (dbSubjectName || value);

  // Removed isFetching state as lookups are now synchronous via props.
  // We can add a 'loading' prop if the parent is still fetching the initial list.


  if (shouldShowReadOnly) {
    // Show readonly display with either database name or dash icon
    const displayValue = dbSubjectName || value || '--';

    return (
      <div className="relative">
        <div className="flex items-center">
          {dbSubjectName ? (
            <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          ) : (
            <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <div className="w-full pl-10 pr-3 py-2 text-sm border rounded bg-gray-50 text-gray-800">
            {displayValue}
          </div>
          {dbSubjectName && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
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
        <div className="flex items-center">
          <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value || subjectCode || ''}
            onChange={handleInputChange}
            placeholder={dbSubjectName ? `Enter custom name (default: ${dbSubjectName})` : "Enter subject name..."}
            className={`w-full pl-10 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : 'border-gray-300'
              }`}
          />
        </div>
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

export default EnhancedSubjectNameInput;
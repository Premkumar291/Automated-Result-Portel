import React from 'react';
import { Book, AlertCircle } from 'lucide-react';

const SubjectNameInput = ({ subjectCode, value, onChange, error }) => {
  return (
    <div>
      <div className="relative">
        <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(subjectCode, e.target.value)}
          placeholder="Enter subject name..."
          className={`w-full pl-10 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
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


export default SubjectNameInput;

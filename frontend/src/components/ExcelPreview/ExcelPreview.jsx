import React, { useState } from 'react';

const ExcelPreview = ({ fileData, onClose }) => {
  const [activeTab, setActiveTab] = useState('students');

  if (!fileData || !fileData.analysisData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-4">No Data Available</h3>
          <p className="text-gray-600 mb-4">Unable to load Excel file content.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { analysisData, fileName, semester, studentCount, subjectCount, createdAt } = fileData;
  const students = analysisData.students || [];

  // Calculate statistics
  const totalSubjects = students.reduce((total, student) => 
    total + (student.subjects ? student.subjects.length : 0), 0);
  
  const gradeDistribution = {};
  students.forEach(student => {
    if (student.subjects) {
      student.subjects.forEach(subject => {
        if (subject.grade && subject.grade !== 'N/A') {
          gradeDistribution[subject.grade] = (gradeDistribution[subject.grade] || 0) + 1;
        }
      });
    }
  });

  // Get all unique subjects
  const allSubjects = [];
  const subjectMap = new Map();
  students.forEach(student => {
    if (student.subjects) {
      student.subjects.forEach(subject => {
        if (!subjectMap.has(subject.code)) {
          subjectMap.set(subject.code, subject);
          allSubjects.push(subject);
        }
      });
    }
  });

  const renderStudentsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roll Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subjects
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SGPA
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CGPA
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Result
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.name || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.rollNumber || 'N/A'}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {student.subjects ? student.subjects.length : 0} subjects
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.sgpa || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.cgpa || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  student.result === 'PASS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.result || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSubjectsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credits
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Students Enrolled
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allSubjects.map((subject, index) => {
            const enrolledCount = students.filter(student => 
              student.subjects && student.subjects.some(s => s.code === subject.code)
            ).length;
            
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {subject.code || 'N/A'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {subject.name || 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.credits || 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {enrolledCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Basic Statistics</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Students:</span>
            <span className="font-medium">{studentCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Subjects:</span>
            <span className="font-medium">{allSubjects.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Enrollments:</span>
            <span className="font-medium">{totalSubjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average Subjects/Student:</span>
            <span className="font-medium">
              {studentCount > 0 ? (totalSubjects / studentCount).toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Grade Distribution</h4>
        <div className="space-y-2">
          {Object.entries(gradeDistribution)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([grade, count]) => (
              <div key={grade} className="flex justify-between">
                <span className="text-gray-600">{grade}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          {Object.keys(gradeDistribution).length === 0 && (
            <p className="text-gray-500 text-sm">No grade data available</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">📊 Excel File Preview</h3>
            <p className="text-blue-100 text-sm">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* File Info */}
        <div className="p-4 bg-gray-100 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Semester:</span>
              <span className="ml-2 font-medium">{semester}</span>
            </div>
            <div>
              <span className="text-gray-600">Students:</span>
              <span className="ml-2 font-medium">{studentCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Subjects:</span>
              <span className="ml-2 font-medium">{subjectCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-4">
            {[
              { key: 'students', label: 'Students', icon: '👥' },
              { key: 'subjects', label: 'Subjects', icon: '📚' },
              { key: 'statistics', label: 'Statistics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96 p-4">
          {activeTab === 'students' && renderStudentsTable()}
          {activeTab === 'subjects' && renderSubjectsTable()}
          {activeTab === 'statistics' && renderStatistics()}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;

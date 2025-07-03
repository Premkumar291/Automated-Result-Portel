import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ResultAnalysis = ({ analysisData }) => {
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Toggle semester expansion
  const toggleSemester = (semester) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }));
  };

  // Calculate grade statistics
  const calculateGradeStats = (students) => {
    if (!students || !Array.isArray(students)) return { total: 0, passed: 0, failed: 0, gradeDistribution: {} };
    
    const allSubjects = students.flatMap(student => student.subjects || []);
    const grades = allSubjects.map(subject => subject.grade).filter(Boolean);
    const gradeCount = grades.reduce((acc, grade) => {
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const totalSubjects = allSubjects.length;
    const passedSubjects = grades.filter(grade => 
      !['F', 'Fail', 'FAIL'].includes(grade)
    ).length;

    return {
      total: totalSubjects,
      passed: passedSubjects,
      failed: totalSubjects - passedSubjects,
      gradeDistribution: gradeCount
    };
  };

  // Get grade color based on grade value
  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-green-600 bg-green-50',
      'A': 'text-green-600 bg-green-50',
      'B+': 'text-blue-600 bg-blue-50',
      'B': 'text-blue-600 bg-blue-50',
      'C+': 'text-yellow-600 bg-yellow-50',
      'C': 'text-yellow-600 bg-yellow-50',
      'D': 'text-orange-600 bg-orange-50',
      'F': 'text-red-600 bg-red-50',
      'Fail': 'text-red-600 bg-red-50',
      'FAIL': 'text-red-600 bg-red-50'
    };
    return gradeColors[grade] || 'text-gray-600 bg-gray-50';
  };

  if (!analysisData || !analysisData.semesters) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Result Analysis</h3>
        <p className="text-gray-500">No analysis data available. Please upload a PDF first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Result Analysis</h3>
        <div className="text-sm text-gray-500">
          {Object.keys(analysisData.semesters).length} semester(s) found
        </div>
      </div>

      {/* Overall Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Overall Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(analysisData.semesters).length}
            </div>
            <div className="text-sm text-blue-800">Semesters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(analysisData.semesters).reduce((total, sem) => 
                total + (sem.students ? sem.students.reduce((subTotal, student) => 
                  subTotal + (student.subjects ? student.subjects.length : 0), 0) : 0), 0)}
            </div>
            <div className="text-sm text-green-800">Total Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysisData.student_info?.student_name || 'N/A'}
            </div>
            <div className="text-sm text-purple-800">Student Name</div>
          </div>
        </div>
      </div>

      {/* Semester-wise Results */}
      <div className="space-y-4">
        {Object.entries(analysisData.semesters).map(([semester, data]) => {
          const stats = calculateGradeStats(data.students);
          const isExpanded = expandedSemesters[semester];
          const gpaValue = data.students?.[0]?.sgpa || data.students?.[0]?.cgpa || 'N/A';

          return (
            <div key={semester} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSemester(semester)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h4 className="font-medium text-gray-900">{semester}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{stats.total} subjects</span>
                      <span>•</span>
                      <span className="text-green-600">{stats.passed} passed</span>
                      {stats.failed > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{stats.failed} failed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500">
                      GPA: {gpaValue}
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t">
                  {/* Grade Distribution */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Grade Distribution</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                        <span 
                          key={grade}
                          className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(grade)}`}
                        >
                          {grade}: {count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Students and Subjects */}
                  {data.students && data.students.map((student, studentIndex) => (
                    <div key={studentIndex} className="mb-6">
                      <h6 className="font-medium text-gray-800 mb-3">
                        {student.name || 'Unknown Student'} 
                        {student.rollNumber && ` (${student.rollNumber})`}
                      </h6>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credits
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Grade
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Marks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {student.subjects && student.subjects.map((subject, subjectIndex) => (
                              <tr key={subjectIndex} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {subject.name || 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {subject.code || 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {subject.credits || 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(subject.grade)}`}>
                                    {subject.grade || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {subject.marks || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Analysis Summary */}
      {analysisData.analysis_summary && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">AI Analysis Summary</h4>
          <p className="text-sm text-purple-800">
            {analysisData.analysis_summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultAnalysis;

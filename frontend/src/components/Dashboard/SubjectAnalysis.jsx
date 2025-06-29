import { useState } from 'react';

const SubjectAnalysis = ({ gradeAnalysis, isVisible = false }) => {
  const [sortBy, setSortBy] = useState('subjectCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedSubject, setExpandedSubject] = useState(null);

  if (!isVisible || !gradeAnalysis || !gradeAnalysis.success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Subject-wise Analysis</h3>
          <p className="text-gray-500">Upload a PDF to view detailed subject analysis</p>
        </div>
      </div>
    );
  }

  const { subjects, overallStats } = gradeAnalysis;

  // Sort subjects
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getGradeColor = (grade) => {
    const passGrades = ['O', 'A+', 'A', 'B+', 'B', 'C'];
    return passGrades.includes(grade) ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getPassRateColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Grade Analysis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{overallStats.totalSubjects}</div>
            <div className="text-blue-100">Total Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{overallStats.totalStudents}</div>
            <div className="text-blue-100">Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{overallStats.averagePassRate}%</div>
            <div className="text-blue-100">Avg Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{overallStats.totalAttempts}</div>
            <div className="text-blue-100">Total Attempts</div>
          </div>
        </div>
      </div>

      {/* Subject Analysis Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Subject-wise Pass Percentage Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">Click on any subject to view detailed grade distribution</p>
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('subjectCode')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Subject Code</span>
                    {sortBy === 'subjectCode' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalStudents')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Students</span>
                    {sortBy === 'totalStudents' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('passPercentage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Pass Rate</span>
                    {sortBy === 'passPercentage' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSubjects.map((subject) => (
                <>
                  <tr 
                    key={subject.subjectCode} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedSubject(expandedSubject === subject.subjectCode ? null : subject.subjectCode)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-900">{subject.subjectCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {subject.passedStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {subject.failedStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPassRateColor(subject.passPercentage)}`}>
                        {subject.passPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        {expandedSubject === subject.subjectCode ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Grade Distribution */}
                  {expandedSubject === subject.subjectCode && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Grade Distribution for {subject.subjectCode}</h4>
                          
                          {/* Grade Distribution Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                              <div key={grade} className="text-center">
                                <div className={`px-3 py-2 rounded-lg font-medium ${getGradeColor(grade)}`}>
                                  <div className="text-lg font-bold">{count}</div>
                                  <div className="text-xs">{grade}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Pass/Fail Visualization */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Pass/Fail Distribution</span>
                              <span>{subject.passedStudents} passed, {subject.failedStudents} failed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${subject.passPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectAnalysis;

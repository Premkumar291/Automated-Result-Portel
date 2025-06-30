// PDF Viewer Component
import { useState } from 'react';

const PDFViewer = ({ selectedPDF, onEditPDF }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!selectedPDF) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a PDF to view details</h3>
        <p className="text-gray-500">Choose a PDF from the list to see its analysis and details</p>
      </div>
    );
  }

  const analysisData = selectedPDF.analysisData;
  const hasAnalysis = analysisData && analysisData.subjects && analysisData.subjects.length > 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return gradeColors[grade] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedPDF.filename}</h2>
            {selectedPDF.description && (
              <p className="text-gray-600 mt-1">{selectedPDF.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Uploaded on {formatDate(selectedPDF.uploadDate)}
            </p>
          </div>
          <button
            onClick={() => onEditPDF(selectedPDF)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Edit Details
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'subjects', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {hasAnalysis ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">CGPA</h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {analysisData.cgpa || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Total Subjects</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {analysisData.totalSubjects || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Credits</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {analysisData.totalCredits || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-600">Semester</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                      {analysisData.semester || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                {(analysisData.studentInfo || analysisData.institution) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {analysisData.studentInfo?.name && (
                        <div>
                          <span className="font-medium text-gray-600">Name: </span>
                          <span className="text-gray-800">{analysisData.studentInfo.name}</span>
                        </div>
                      )}
                      {analysisData.studentInfo?.rollNumber && (
                        <div>
                          <span className="font-medium text-gray-600">Roll Number: </span>
                          <span className="text-gray-800">{analysisData.studentInfo.rollNumber}</span>
                        </div>
                      )}
                      {analysisData.institution && (
                        <div>
                          <span className="font-medium text-gray-600">Institution: </span>
                          <span className="text-gray-800">{analysisData.institution}</span>
                        </div>
                      )}
                      {analysisData.academicYear && (
                        <div>
                          <span className="font-medium text-gray-600">Academic Year: </span>
                          <span className="text-gray-800">{analysisData.academicYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">This PDF hasn't been analyzed yet or analysis failed.</p>
              </div>
            )}
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div>
            {hasAnalysis && analysisData.subjects?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisData.subjects.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subject.code || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subject.credits || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                            {subject.grade || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subject.points || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Subject Data</h3>
                <p className="text-gray-600">Subject information is not available for this PDF.</p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {hasAnalysis ? (
              <>
                {/* Grade Distribution */}
                {analysisData.gradeDistribution && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analysisData.gradeDistribution).map(([grade, count]) => (
                        <div key={grade} className="text-center">
                          <div className={`inline-flex px-3 py-2 rounded-full text-sm font-semibold ${getGradeColor(grade)}`}>
                            {grade}
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-green-600 mb-2">Average GPA</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {analysisData.averageGPA || analysisData.cgpa || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-blue-600 mb-2">Passed Subjects</h4>
                    <p className="text-2xl font-bold text-blue-900">
                      {analysisData.passedSubjects || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-purple-600 mb-2">Total Credits</h4>
                    <p className="text-2xl font-bold text-purple-900">
                      {analysisData.totalCredits || 'N/A'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Performance Data</h3>
                <p className="text-gray-600">Performance analysis is not available for this PDF.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;

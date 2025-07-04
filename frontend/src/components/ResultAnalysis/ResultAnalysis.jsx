import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ExcelPreview from '../ExcelPreview/ExcelPreview';
import { getExcelPreview } from '../../api/pdfAnalysis';

const ResultAnalysis = ({ analysisData }) => {
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Check if analysis data is valid
  if (!analysisData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">No Analysis Data</h3>
        <p className="text-red-600">No analysis data received from the server.</p>
      </div>
    );
  }

  // Check for parsing errors
  if (analysisData.parsing_error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">PDF Parsing Issue</h3>
        <p className="text-yellow-700 mb-4">{analysisData.error_message}</p>
        {analysisData.instructions && (
          <p className="text-yellow-600 text-sm italic">{analysisData.instructions}</p>
        )}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="mt-3 text-sm text-yellow-700 underline hover:text-yellow-800"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Information
        </button>
        {showDebug && (
          <div className="mt-4 p-3 bg-yellow-100 rounded text-xs text-yellow-800">
            <pre>{JSON.stringify(analysisData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // Check if we have student data
  if (!analysisData.students || !Array.isArray(analysisData.students) || analysisData.students.length === 0) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">No Student Data Found</h3>
        <p className="text-orange-700 mb-4">
          The PDF was processed but no student result data could be extracted. 
          Please ensure your PDF contains clear academic result information.
        </p>
        <div className="text-sm text-orange-600">
          <p><strong>Tips for better extraction:</strong></p>
          <ul className="list-disc ml-5 mt-2">
            <li>Ensure the PDF contains text (not just images)</li>
            <li>Check that student names, roll numbers, and grades are clearly visible</li>
            <li>Make sure the PDF is not corrupted or password-protected</li>
          </ul>
        </div>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="mt-3 text-sm text-orange-700 underline hover:text-orange-800"
        >
          {showDebug ? 'Hide' : 'Show'} Analysis Data
        </button>
        {showDebug && (
          <div className="mt-4 p-3 bg-orange-100 rounded text-xs text-orange-800">
            <pre>{JSON.stringify(analysisData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

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

  // Download Excel file
  const downloadExcelFile = async (fileId, fileName) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pdf-analysis/download/${fileId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // View Excel preview
  const viewExcelPreview = async (fileId) => {
    try {
      setPreviewLoading(true);
      const data = await getExcelPreview(fileId);
      setPreviewData(data);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to load preview. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close preview modal
  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewData(null);
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
        <h3 className="text-lg font-semibold text-gray-900">📊 AI Result Analysis</h3>
        <div className="text-sm text-gray-500">
          {Object.keys(analysisData.semesters).length} semester(s) found
        </div>
      </div>

      {/* Processing Summary */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-900 mb-3 flex items-center">
          <span className="mr-2">✅</span>
          Multi-Page PDF Processing Complete
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {analysisData.totalSections || 'N/A'}
            </div>
            <div className="text-green-800">PDF Sections</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {Object.keys(analysisData.semesters).length}
            </div>
            <div className="text-blue-800">Semesters Found</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {Object.values(analysisData.semesters).reduce((total, sem) => 
                total + (sem.students ? sem.students.length : 0), 0)}
            </div>
            <div className="text-purple-800">Students</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600">
              {Object.values(analysisData.semesters).reduce((total, sem) => 
                total + (sem.students ? sem.students.reduce((subTotal, student) => 
                  subTotal + (student.subjects ? student.subjects.length : 0), 0) : 0), 0)}
            </div>
            <div className="text-indigo-800">Total Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {analysisData.data?.excelFiles?.length || 0}
            </div>
            <div className="text-orange-800">Excel Files</div>
          </div>
        </div>
        
        {/* Processing timestamp */}
        {analysisData.processedAt && (
          <div className="mt-3 text-xs text-green-700">
            Processed: {new Date(analysisData.processedAt).toLocaleString()}
          </div>
        )}
        
        {/* Institution Info */}
        {(analysisData.institution || analysisData.student_info?.institution) && (
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">
              <strong>Institution:</strong> {analysisData.institution || analysisData.student_info?.institution}
            </div>
            {analysisData.academicYear && (
              <div className="text-sm text-gray-600">
                <strong>Academic Year:</strong> {analysisData.academicYear}
              </div>
            )}
            {analysisData.examType && (
              <div className="text-sm text-gray-600">
                <strong>Exam Type:</strong> {analysisData.examType}
              </div>
            )}
          </div>
        )}
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

      {/* Excel Files Display */}
      {analysisData.data?.excelFiles && analysisData.data.excelFiles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Generated Excel Files ({analysisData.data.excelFiles.length})
          </h4>
          <div className="grid gap-3">
            {analysisData.data.excelFiles.map((file, index) => (
              <div key={index} className="bg-white border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-blue-900">{file.fileName}</div>
                  <div className="text-sm text-blue-700">
                    Semester {file.semester} • {file.studentCount} students • {file.subjectCount} subjects
                  </div>
                  <div className="text-xs text-blue-600">
                    Created: {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadExcelFile(file._id, file.fileName)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => viewExcelPreview(file._id)}
                    disabled={previewLoading}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {previewLoading ? '⏳ Loading...' : '👁️ Preview'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-blue-700">
            💡 Tip: Click Download to save Excel files locally, or Preview to view the data online.
          </div>
        </div>
      )}

      {/* AI Analysis Summary */}
      {analysisData.analysis_summary && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">AI Analysis Summary</h4>
          <p className="text-sm text-purple-800">
            {analysisData.analysis_summary}
          </p>
        </div>
      )}

      {/* Excel Preview Modal */}
      {isPreviewOpen && previewData && (
        <ExcelPreview
          fileData={previewData}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default ResultAnalysis;

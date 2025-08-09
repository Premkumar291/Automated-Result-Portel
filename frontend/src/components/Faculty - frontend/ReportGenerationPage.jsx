import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Download, 
  Eye, 
  User,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Loader,
  Users,
  CalendarDays
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pdfReportsApi } from '../../api/pdfReports';

// Report Generation Page
function ReportGenerationPage() {
  const navigate = useNavigate();
  
  // State for storing report data from analysis
  const [reportData, setReportData] = useState(null);
  
  // Department information
  const [departmentInfo, setDepartmentInfo] = useState({
    semester: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    department: 'CSE'
  });
  
  // Faculty assignments per subject
  const [facultyAssignments, setFacultyAssignments] = useState({});
  
  // Loading state and form validation errors
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Report generation state
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Retrieve saved report generation data from session storage
    const data = sessionStorage.getItem('reportGenerationData');
    console.log('ReportGenerationPage: Retrieved data from sessionStorage:', data);
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log('ReportGenerationPage: Parsed data:', parsedData);
        setReportData(parsedData);

        // Initialize department info with data from analysis
        setDepartmentInfo(prev => ({
          ...prev,
          semester: parsedData.semester || ''
        }));

        // Initialize faculty assignments object for all detected subjects
        const initialAssignments = {};
        if (parsedData.analysisData && parsedData.analysisData.subjectCodes) {
          parsedData.analysisData.subjectCodes.forEach(subjectCode => {
            initialAssignments[subjectCode] = '';
          });
        }
        setFacultyAssignments(initialAssignments);
      } catch (error) {
        console.error('ReportGenerationPage: Error parsing sessionStorage data:', error);
        toast.error('Invalid report data. Please go back to analysis page.');
        navigate('/dashboard');
      }
    } else {
      console.error('ReportGenerationPage: No data found in sessionStorage');
      toast.error('No report generation data found. Please go back to analysis page.');
      // Add a small delay to prevent immediate navigation during component mount
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [navigate]);

  const handleDepartmentInfoChange = (field, value) => {
    setDepartmentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFacultyAssignmentChange = (subjectCode, facultyName) => {
    setFacultyAssignments(prev => ({
      ...prev,
      [subjectCode]: facultyName
    }));
    // Clear errors when user starts typing
    if (errors[`faculty_${subjectCode}`]) {
      setErrors(prev => ({
        ...prev,
        [`faculty_${subjectCode}`]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate department info
    if (!departmentInfo.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }
    if (!departmentInfo.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }
    if (!departmentInfo.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Validate faculty assignments - all subjects must have faculty assigned
    if (reportData && reportData.analysisData && reportData.analysisData.subjectCodes) {
      reportData.analysisData.subjectCodes.forEach(subjectCode => {
        if (!facultyAssignments[subjectCode] || !facultyAssignments[subjectCode].trim()) {
          newErrors[`faculty_${subjectCode}`] = 'Faculty name is required for this subject';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goBackToAnalysis = () => {
    if (reportData) {
      navigate(`/result-analysis?id=${reportData.pdfId}&semester=${reportData.semester}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!reportData) {
        toast.error('No report data available');
        return;
      }

      // Validate the form
      if (!validateForm()) {
        toast.error('Please fill all required fields');
        return;
      }

      setLoading(true);

      // Prepare the API request data to match backend expectations
      const reportRequestData = {
        // Required fields that backend validates
        department: departmentInfo.department,
        semester: departmentInfo.semester.trim(),
        academicYear: departmentInfo.academicYear.trim(),
        // Analysis data from the previous analysis
        analysisData: {
          students: reportData.analysisData.students,
          subjectCodes: reportData.analysisData.subjectCodes,
          totalStudents: reportData.resultData.totalStudents,
          totalSubjects: reportData.resultData.totalSubjects,
          overallPassPercentage: reportData.resultData.overallPassPercentage,
          subjectWiseResults: reportData.resultData.subjectWiseResults
        },
        
        // Faculty assignments per subject
        facultyAssignments: facultyAssignments,
        
        // Optional fields with defaults
        facultyId: null, // Will use req.user?.id from backend
        instituteName: 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: 'ERODE - 638 316',
        reportGeneratedAt: new Date().toISOString()
      };

      console.log('Generating report with data:', reportRequestData);

      // Call the API to generate the Excel report (not PDF)
      const response = await pdfReportsApi.generateAndDownloadExcel(reportRequestData);

      if (response.blob && response.reportData) {
        // Trigger the download directly
        pdfReportsApi.triggerDownload(response.blob, response.filename);
        toast.success('Excel report downloaded successfully!');
        
        // Set state for the preview modal with the returned report data
        setGeneratedReport(response.reportData);
        setShowPreview(true);
      } else {
        throw new Error('Failed to generate or download the report.');
      }
    } catch (error) {
      console.error('Error generating institutional report:', error);
      toast.error(error.message || 'Failed to generate institutional report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
          <p className="mt-2 text-gray-600">Loading report generation data...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we prepare the report form...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goBackToAnalysis}
            className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Analysis
          </button>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Institutional Report</h1>
              <p className="text-gray-600">Create a comprehensive semester report with faculty assignments for semester {reportData.semester}</p>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-blue-50 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.totalStudents}</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Subjects</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.totalSubjects}</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-purple-50 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Overall Pass %</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.overallPassPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Report Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Institutional Report Details
          </h2>
          
          {/* Department Information Section */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-blue-600" />
              Department Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.semester ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 6"
                  value={departmentInfo.semester}
                  onChange={(e) => handleDepartmentInfoChange('semester', e.target.value)}
                />
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.semester}
                  </p>
                )}
              </div>
              
              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.academicYear ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2024-2025"
                  value={departmentInfo.academicYear}
                  onChange={(e) => handleDepartmentInfoChange('academicYear', e.target.value)}
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.academicYear}
                  </p>
                )}
              </div>
              
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.department ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={departmentInfo.department}
                  onChange={(e) => handleDepartmentInfoChange('department', e.target.value)}
                >
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication Engineering</option>
                  <option value="EEE">Electrical & Electronics Engineering</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="others">Others</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.department}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Faculty Assignment Section */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2 text-green-600" />
              Faculty Assignments per Subject
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please assign a faculty member for each subject detected in the analysis. This information will be included in the institutional report.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty Name *
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.analysisData.subjectCodes.map((subjectCode, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
                          {subjectCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`faculty_${subjectCode}`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter faculty name"
                          value={facultyAssignments[subjectCode] || ''}
                          onChange={(e) => handleFacultyAssignmentChange(subjectCode, e.target.value)}
                        />
                        {errors[`faculty_${subjectCode}`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors[`faculty_${subjectCode}`]}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Faculty Assignment Guidelines:
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                    <li>Each subject must have a faculty member assigned</li>
                    <li>Faculty names will appear in the institutional report header</li>
                    <li>Use full names for professional presentation</li>
                    <li>Double-check spelling before generating the report</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Results Preview */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-4 w-4 mr-2 text-purple-600" />
              Subject-wise Results Preview
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This is the analysis summary that will be included in the institutional report:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.resultData.subjectWiseResults.map((subject, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
                    {subject.subject}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Total Students: <span className="font-medium">{subject.totalStudents}</span></p>
                    <p>Passed: <span className="font-medium text-green-600">{subject.passedStudents}</span></p>
                    <p>Pass Rate: <span className="font-medium">{subject.passPercentage.toFixed(1)}%</span></p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        subject.passPercentage >= 90 ? 'bg-green-500' :
                        subject.passPercentage >= 75 ? 'bg-yellow-500' :
                        subject.passPercentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${subject.passPercentage}%` }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Please ensure all fields are filled before generating the report
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={goBackToAnalysis}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analysis
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className={`px-6 py-3 rounded-md font-medium flex items-center transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                } transform hover:scale-105`}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Institutional Report
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Report Generated Success Modal */}
        {showPreview && generatedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Report Generated Successfully!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Your institutional report has been generated successfully. You can now preview it or download it directly.
                </p>
                
                {/* Report Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Department:</span>
                      <p className="text-gray-900">{generatedReport.department}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Semester:</span>
                      <p className="text-gray-900">{generatedReport.semester}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Academic Year:</span>
                      <p className="text-gray-900">{generatedReport.academicYear}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Generated:</span>
                      <p className="text-gray-900">{new Date(generatedReport.generatedAt).toLocaleDateString()}</p>
                    </div>
                    {generatedReport.totalStudents > 0 && (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">Students:</span>
                          <p className="text-gray-900">{generatedReport.totalStudents}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Pass Rate:</span>
                          <p className="text-gray-900">{generatedReport.overallPassPercentage?.toFixed(1)}%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Open preview in new tab - use env API URL
                      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                      const correctedPreviewUrl = `${apiBaseUrl}/reports/preview/${generatedReport.reportId}`;
                      window.open(correctedPreviewUrl, '_blank');
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        // Download the Excel report
                        const blob = await pdfReportsApi.downloadReport(generatedReport.reportId);
                        pdfReportsApi.triggerDownload(blob, generatedReport.filename);
                        toast.success('Excel report downloaded successfully!');
                      } catch (error) {
                        console.error('Error downloading Excel report:', error);
                        toast.error('Failed to download Excel report. Please try again.');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="mt-4 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ReportGenerationPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  Users, 
  BookOpen, 
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Loader2
} from 'lucide-react';
import FacultyNameInput from './FacultyNameInput';
import { pdfReportsApi } from '../../../api/pdfReports';
import { subjectAPI } from '../../../api/subjects';

const EnhancedReportGenerator = ({ analysisData, isDarkMode }) => {
  const [reportData, setReportData] = useState({
    semester: '',
    academicYear: '',
    department: '',
    instituteName: 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
    instituteLocation: 'ERODE - 638 316',
    classAdvisorName: '',
    monthsAndYear: ''
  });

  const [facultyAssignments, setFacultyAssignments] = useState({});
  const [showFacultySection, setShowFacultySection] = useState(false);
  const [subjectCodes, setSubjectCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [reportType, setReportType] = useState('institutional'); // 'institutional' or 'standard'

  // Extract subject codes from analysis data or fetch from API
  useEffect(() => {
    console.log('Analysis data received:', analysisData);
    
    // Try to extract subject codes from different possible structures
    let extractedSubjectCodes = [];
    
    if (analysisData?.subjectCodes) {
      extractedSubjectCodes = analysisData.subjectCodes;
    } else if (analysisData?.resultData?.subjectWiseResults) {
      extractedSubjectCodes = analysisData.resultData.subjectWiseResults.map(result => result.subjectCode);
    } else if (analysisData?.subjectWiseResults) {
      extractedSubjectCodes = analysisData.subjectWiseResults.map(result => result.subjectCode);
    } else if (analysisData?.subjects) {
      extractedSubjectCodes = analysisData.subjects;
    }
    
    if (extractedSubjectCodes.length > 0) {
      console.log('Subject codes extracted:', extractedSubjectCodes);
      setSubjectCodes(extractedSubjectCodes);
      // Auto-show faculty section when analysis data is available
      setShowFacultySection(true);
    } else if (reportData.department) {
      fetchSubjectsForDepartment();
    } else {
      console.log('No subject codes found in analysis data or department not selected');
    }
  }, [analysisData, reportData.department]);

  const fetchSubjectsForDepartment = async () => {
    try {
      const response = await subjectAPI.getSubjectsByDepartment(reportData.department);
      const subjects = response.data || [];
      setAvailableSubjects(subjects);
      
      // If no analysis data, use subjects from department
      if (!analysisData?.subjectCodes) {
        setSubjectCodes(subjects.map(subject => subject.subjectCode));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setAvailableSubjects([]);
    }
  };

  const handleInputChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFacultyAssignmentSave = (assignments) => {
    setFacultyAssignments(assignments);
    toast.success(`Faculty assigned to ${Object.keys(assignments).length} subjects`);
  };

  const validateReportData = () => {
    const errors = [];

    if (!reportData.semester) errors.push('Semester is required');
    if (!reportData.academicYear) errors.push('Academic Year is required');
    if (!reportData.department) errors.push('Department is required');
    if (subjectCodes.length === 0) errors.push('No subjects found for report generation');
    
    // Check if all subjects have faculty assignments
    const unassignedSubjects = subjectCodes.filter(code => !facultyAssignments[code]);
    if (unassignedSubjects.length > 0) {
      errors.push(`${unassignedSubjects.length} subjects need faculty assignments`);
    }

    if (reportType === 'institutional') {
      if (!reportData.classAdvisorName) errors.push('Class Advisor Name is required for institutional reports');
      if (!reportData.monthsAndYear) errors.push('Months and Year is required for institutional reports');
    }

    return errors;
  };

  const generateReport = async (downloadType = 'excel') => {
    const errors = validateReportData();
    if (errors.length > 0) {
      toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    setLoading(true);
    try {
      const reportPayload = {
        ...reportData,
        analysisData: analysisData || {
          students: [],
          subjectCodes: subjectCodes,
          subjectResults: subjectCodes.map(code => ({
            subjectCode: code,
            subjectName: availableSubjects.find(s => s.subjectCode === code)?.subjectName || code,
            totalStudents: 0,
            passedStudents: 0,
            passPercentage: 0
          }))
        },
        facultyAssignments: facultyAssignments,
        reportType: reportType
      };

      if (downloadType === 'excel') {
        if (reportType === 'institutional') {
          await pdfReportsApi.generateInstitutionalExcel(reportPayload);
          toast.success('Institutional Excel report generated and downloaded successfully!');
        } else {
          await pdfReportsApi.generateSemesterExcel(reportPayload);
          toast.success('Standard Excel report generated and downloaded successfully!');
        }
      } else {
        // PDF generation (if available)
        const response = await pdfReportsApi.generateInstitutionalReport(reportPayload);
        toast.success('PDF report generated successfully!');
        
        // Optionally open preview
        if (response.data?.previewUrl) {
          window.open(response.data.previewUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = () => {
    const total = subjectCodes.length;
    const assigned = Object.keys(facultyAssignments).length;
    return { total, assigned, percentage: total > 0 ? Math.round((assigned / total) * 100) : 0 };
  };

  const assignmentStatus = getAssignmentStatus();

  return (
    <div className={`${isDarkMode ? 'dark-elevated-card' : 'elevated-card'} p-6 hover-lift`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div
            className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Enhanced Report Generator
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>
              Generate comprehensive academic reports with faculty assignments
            </p>
          </div>
        </div>

        {/* Report Type Toggle */}
        <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setReportType('institutional')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              reportType === 'institutional'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Institutional
          </button>
          <button
            onClick={() => setReportType('standard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              reportType === 'standard'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Standard
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Semester *
            </label>
            <select
              value={reportData.semester}
              onChange={(e) => handleInputChange('semester', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              required
            >
              <option value="">Select Semester</option>
              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Academic Year *
            </label>
            <input
              type="text"
              value={reportData.academicYear}
              onChange={(e) => handleInputChange('academicYear', e.target.value)}
              placeholder="2024-2025"
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <Building2 className="w-4 h-4 inline mr-1" />
              Department *
            </label>
            <select
              value={reportData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              required
            >
              <option value="">Select Department</option>
              <option value="IT">Information Technology</option>
              <option value="CSE">Computer Science Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="EEE">Electrical & Electronics</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="AIDS">AI & Data Science</option>
              <option value="AIML">AI & Machine Learning</option>
            </select>
          </div>
        </div>

        {/* Institute Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Institute Name
            </label>
            <input
              type="text"
              value={reportData.instituteName}
              onChange={(e) => handleInputChange('instituteName', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Institute Location
            </label>
            <input
              type="text"
              value={reportData.instituteLocation}
              onChange={(e) => handleInputChange('instituteLocation', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
            />
          </div>
        </div>

        {/* Institutional Report Fields */}
        {reportType === 'institutional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <Users className="w-4 h-4 inline mr-1" />
                Class Advisor Name *
              </label>
              <input
                type="text"
                value={reportData.classAdvisorName}
                onChange={(e) => handleInputChange('classAdvisorName', e.target.value)}
                placeholder="Enter class advisor name"
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Months and Year *
              </label>
              <input
                type="text"
                value={reportData.monthsAndYear}
                onChange={(e) => handleInputChange('monthsAndYear', e.target.value)}
                placeholder="e.g., NOV 2024"
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                required
              />
            </div>
          </div>
        )}

        {/* No Subjects Message */}
        {!analysisData && subjectCodes.length === 0 && (
          <div className={`p-6 rounded-lg border-2 border-dashed ${
            isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
          } text-center`}>
            <BookOpen className={`w-12 h-12 mx-auto mb-3 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No Analysis Data Available
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Please analyze a result file first to generate reports with faculty assignments.
              <br />The subject codes will be automatically loaded from your analysis.
            </p>
          </div>
        )}

        {/* Faculty Assignment Toggle Section */}
        {subjectCodes.length > 0 && (
          <div className={`p-4 rounded-lg border ${
            assignmentStatus.assigned === assignmentStatus.total && assignmentStatus.total > 0
              ? isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
              : assignmentStatus.assigned > 0
              ? isDarkMode ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50'
              : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className={`w-5 h-5 ${
                  assignmentStatus.assigned === assignmentStatus.total && assignmentStatus.total > 0
                    ? 'text-green-500'
                    : assignmentStatus.assigned > 0 
                    ? 'text-yellow-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Faculty Assignments
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Assign faculty members to subjects ({assignmentStatus.assigned}/{assignmentStatus.total} completed)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {assignmentStatus.assigned === assignmentStatus.total && assignmentStatus.total > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : assignmentStatus.total > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                ) : null}
                
                <button
                  onClick={() => setShowFacultySection(prev => !prev)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } hover:shadow-lg transform hover:-translate-y-0.5`}
                >
                  <Settings className="w-4 h-4" />
                  <span>
                    {showFacultySection ? 'Hide Faculty Assignment' : (assignmentStatus.assigned > 0 ? 'Modify Assignments' : 'Assign Faculty')}
                  </span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {assignmentStatus.total > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Progress
                  </span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {assignmentStatus.percentage}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${assignmentStatus.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Subject List Preview */}
            <div className="mt-4">
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Subjects from Analysis ({subjectCodes.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {subjectCodes.slice(0, 8).map((code) => (
                  <span
                    key={code}
                    className={`px-2 py-1 text-xs rounded-md ${
                      facultyAssignments[code]
                        ? isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {code}
                    {facultyAssignments[code] && (
                      <CheckCircle className="w-3 h-3 inline ml-1" />
                    )}
                  </span>
                ))}
                {subjectCodes.length > 8 && (
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    +{subjectCodes.length - 8} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Faculty Assignment Input Section */}
        {showFacultySection && subjectCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
          >
            <FacultyNameInput
              subjectCodes={subjectCodes}
              currentAssignments={facultyAssignments}
              onSave={setFacultyAssignments}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}

        {/* Generation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={() => generateReport('excel')}
            disabled={loading || validateReportData().length > 0}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
              loading || validateReportData().length > 0
                ? isDarkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
            } hover:shadow-lg transform hover:-translate-y-0.5`}
            whileHover={loading || validateReportData().length > 0 ? {} : { scale: 1.02 }}
            whileTap={loading || validateReportData().length > 0 ? {} : { scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Excel Report...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Excel Report</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => generateReport('pdf')}
            disabled={loading || validateReportData().length > 0}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
              loading || validateReportData().length > 0
                ? isDarkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            } hover:shadow-lg transform hover:-translate-y-0.5`}
            whileHover={loading || validateReportData().length > 0 ? {} : { scale: 1.02 }}
            whileTap={loading || validateReportData().length > 0 ? {} : { scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF Report...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Generate PDF Report</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Validation Errors */}
        {validateReportData().length > 0 && (
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h4 className={`font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                Please fix the following issues:
              </h4>
            </div>
            <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              {validateReportData().map((error, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-current rounded-full" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

export default EnhancedReportGenerator;

import React, { useEffect, useReducer, useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { facultyAPI } from '../../api/faculty';
import { subjectAPI } from '../../api/subjects';
import { getCurrentUserCollegeName } from '../../utils/userUtils';
import EnhancedSubjectNameInput from './ReportGeneration/EnhancedSubjectNameInput';
import FacultyNameInput from './ReportGeneration/FacultyNameInput'; // This seems to be the old name? Wait.
// Actually, in the file it imports 'FacultyNameInput' from './ReportGeneration/FacultyNameInput'
// But I was editing 'FacultyDropdown.jsx'.
// Let's check if FacultyNameInput is using FacultyDropdown.
import ClassAdvisorDropdown from './ReportGeneration/ClassAdvisorDropdown';
import GlobalLoading from "@/components/common/GlobalLoading";

// Initial state for the form
const initialFormState = {
  reportData: null,
  departmentInfo: {
    semester: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    department: 'IT',
    classAdvisorName: '',
    monthsAndYear: ''
  },
  facultyAssignments: {},
  facultyDepartments: {}, // New state to store faculty departments
  subjectNames: {},
  errors: {},
  ui: {
    loading: false,
    showPreview: false,
    generatedReport: null
  }
};

// Reducer for managing form state
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_REPORT_DATA':
      return { ...state, reportData: action.payload };

    case 'UPDATE_DEPARTMENT_INFO':
      return {
        ...state,
        departmentInfo: { ...state.departmentInfo, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' }
      };

    case 'UPDATE_FACULTY_ASSIGNMENT':
      return {
        ...state,
        facultyAssignments: { ...state.facultyAssignments, [action.subjectCode]: action.value },
        errors: { ...state.errors, [`faculty_${action.subjectCode}`]: '' }
      };

    case 'UPDATE_FACULTY_DEPARTMENT':
      return {
        ...state,
        facultyDepartments: { ...state.facultyDepartments, [action.subjectCode]: action.value },
        errors: { ...state.errors, [`faculty_${action.subjectCode}`]: '' }
      };

    case 'UPDATE_SUBJECT_NAME':
      return {
        ...state,
        subjectNames: { ...state.subjectNames, [action.subjectCode]: action.value },
        errors: { ...state.errors, [`subject_${action.subjectCode}`]: '' }
      };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: '' } };

    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } };

    case 'SET_PREVIEW':
      return { ...state, ui: { ...state.ui, showPreview: action.payload } };

    case 'SET_GENERATED_REPORT':
      return { ...state, ui: { ...state.ui, generatedReport: action.payload } };

    case 'INITIALIZE_SUBJECTS':
      // Merge with existing state to preserve any already fetched subject names
      return {
        ...state,
        facultyAssignments: { ...state.facultyAssignments, ...action.facultyAssignments },
        facultyDepartments: { ...state.facultyDepartments, ...action.facultyDepartments },
        subjectNames: { ...state.subjectNames, ...action.subjectNames },
        departmentInfo: { ...state.departmentInfo, semester: action.semester }
      };

    default:
      return state;
  }
}

// Report Generation Page
function ReportGenerationPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const { reportData, departmentInfo, facultyAssignments, facultyDepartments, subjectNames, errors, ui } = state;
  const { loading, showPreview, generatedReport } = ui;

  // Effect to initialize subject names when reportData is loaded
  useEffect(() => {
    if (reportData && reportData.analysisData && reportData.analysisData.subjectCodes) {
      // Initialize faculty assignments and subject names
      const initialAssignments = {};
      const initialDepartments = {};
      const initialSubjectNames = {};

      reportData.analysisData.subjectCodes.forEach(subjectCode => {
        initialAssignments[subjectCode] = '';
        initialDepartments[subjectCode] = '';
        initialSubjectNames[subjectCode] = ''; // Use empty string as default name
      });

      // Dispatch initialization action
      dispatch({
        type: 'INITIALIZE_SUBJECTS',
        facultyAssignments: initialAssignments,
        facultyDepartments: initialDepartments,
        subjectNames: initialSubjectNames,
        semester: reportData.semester || ''
      });
    }
  }, [reportData]);

  useEffect(() => {
    // Retrieve saved report generation data from session storage
    const data = sessionStorage.getItem('reportGenerationData');

    if (data) {
      try {
        const parsedData = JSON.parse(data);
        dispatch({ type: 'SET_REPORT_DATA', payload: parsedData });

        // Initialize faculty assignments and subject names
        const initialAssignments = {};
        const initialDepartments = {};
        const initialSubjectNames = {};

        if (parsedData.analysisData && parsedData.analysisData.subjectCodes) {
          parsedData.analysisData.subjectCodes.forEach(subjectCode => {
            initialAssignments[subjectCode] = '';
            initialDepartments[subjectCode] = '';
            // Initialize with empty string as default, will be updated by EnhancedSubjectNameInput
            initialSubjectNames[subjectCode] = '';
          });
        }

        dispatch({
          type: 'INITIALIZE_SUBJECTS',
          facultyAssignments: initialAssignments,
          facultyDepartments: initialDepartments,
          subjectNames: initialSubjectNames,
          semester: parsedData.semester || ''
        });
      } catch {
        toast.error('Invalid report data. Please go back to analysis page.');
        navigate('faculty-dashboard');
      }
    } else {
      toast.error('No report generation data found. Please go back to analysis page.');
      // Add a small delay to prevent immediate navigation during component mount
      setTimeout(() => {
        navigate('faculty-dashboard');
      }, 1000);
    }
  }, [navigate]);

  // Resource state
  const [facultyList, setFacultyList] = useState([]);
  const [departmentSubjects, setDepartmentSubjects] = useState([]);
  const { department } = departmentInfo;

  // Fetch faculty list once
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        await getCurrentUserCollegeName(); // Ensure auth check
        const response = await facultyAPI.getFaculty();
        if (response.success && response.data) {
          setFacultyList(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch faculty list:', err);
      }
    };
    fetchFaculty();
  }, []);

  // Fetch subjects when department changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!department) return;

      try {
        const response = await subjectAPI.getSubjectsByDepartment(department);
        if (response.success && response.data) {
          setDepartmentSubjects(response.data);
        } else {
          // If department fetch fails or returns empty (e.g. 'others'), 
          // maybe we want to fetch nothing or everything? 
          // For now, empty list is safer than spamming global search.
          setDepartmentSubjects([]);
        }
      } catch (err) {
        console.error(`Failed to fetch subjects for department ${department}:`, err);
        setDepartmentSubjects([]);
      }
    };

    // Debounce slightly if needed, but dependency on department string is fine
    fetchSubjects();
  }, [department]);

  const handleSubjectNameChange = useCallback((subjectCode, subjectName) => {
    dispatch({
      type: 'UPDATE_SUBJECT_NAME',
      subjectCode,
      value: subjectName
    });
  }, []);

  const handleFacultyAssignmentChange = useCallback((subjectCode, facultyName, facultyDepartment) => {
    dispatch({
      type: 'UPDATE_FACULTY_ASSIGNMENT',
      subjectCode,
      value: facultyName
    });

    // Store faculty department
    dispatch({
      type: 'UPDATE_FACULTY_DEPARTMENT',
      subjectCode,
      value: facultyDepartment || ''
    });

    // If facultyDepartment is provided, you can use it as needed
    // For example, you might want to store it in state or use it for other purposes

  }, []);

  const handleDepartmentInfoChange = useCallback((field, value) => {
    // Special handling for class advisor name to maintain consistency
    if (field === 'classAdvisorName') {
      // For now, we'll just store the name part and handle department separately if needed
      dispatch({
        type: 'UPDATE_DEPARTMENT_INFO',
        field,
        value
      });
    } else {
      dispatch({
        type: 'UPDATE_DEPARTMENT_INFO',
        field,
        value
      });
    }
  }, []);

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
    if (!departmentInfo.classAdvisorName.trim()) {
      newErrors.classAdvisorName = 'Class Advisor Name is required';
    }
    if (!departmentInfo.monthsAndYear.trim()) {
      newErrors.monthsAndYear = 'Months/Year is required';
    }

    // Validate faculty assignments (subject names are optional now)
    if (reportData && reportData.analysisData && reportData.analysisData.subjectCodes) {
      reportData.analysisData.subjectCodes.forEach(subjectCode => {
        if (!facultyAssignments[subjectCode] || !facultyAssignments[subjectCode].trim()) {
          newErrors[`faculty_${subjectCode}`] = 'Faculty name is required';
        }
        // Subject names are now optional - they will be populated automatically if available in DB
      });
    }

    dispatch({ type: 'SET_ERRORS', payload: newErrors });
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

      dispatch({ type: 'SET_LOADING', payload: true });

      // Prepare the API request data to match backend expectations
      const reportRequestData = {
        // Required fields that backend validates
        department: departmentInfo.department || 'CSE',
        semester: departmentInfo.semester?.toString().trim() || '',
        academicYear: departmentInfo.academicYear?.toString().trim() || '',
        classAdvisorName: departmentInfo.classAdvisorName?.toString().trim() || '',
        monthsAndYear: departmentInfo.monthsAndYear?.toString().trim() || '',

        // Analysis data from the previous analysis - backend expects only students and subjectCodes
        analysisData: {
          students: reportData?.analysisData?.students || [],
          subjectCodes: reportData?.analysisData?.subjectCodes || []
        },

        // Faculty assignments and subject names - ensure objects exist
        facultyAssignments: facultyAssignments || {},
        facultyDepartments: facultyDepartments || {}, // Include faculty departments
        subjectNames: subjectNames || {}, // This will now contain either DB names or dash icons

        // Optional fields with defaults
        facultyId: null, // Will use req.user?.id from backend
        instituteName: 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: 'ERODE - 638 316',
        reportGeneratedAt: new Date().toISOString()
      };


      // Call the API to generate and download the Excel report directly
      await pdfReportsApi.generateInstitutionalExcel(reportRequestData);

      // Since the file is downloaded directly, we can show success and a preview modal
      // using the data we already have on the client.
      toast.success('Excel report generated and downloaded successfully!');

      // Use the request data to populate the preview modal

      // Mimic structure of old response for preview component
      const generatedReportData = {
        ...reportRequestData,
        generatedAt: reportRequestData.reportGeneratedAt,
        totalStudents: reportData?.resultData?.totalStudents || 0,
        overallPassPercentage: reportData?.resultData?.overallPassPercentage || 0,
        filename: `institutional_report_${reportRequestData.semester}.xlsx` // Approximate filename
      };

      dispatch({ type: 'SET_GENERATED_REPORT', payload: generatedReportData });
      dispatch({ type: 'SET_PREVIEW', payload: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Report generation error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }

      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate report. Please check your connection and try again.';
      toast.error(`Report Generation Failed: ${errorMessage}`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };



  if (!reportData) {
    return <GlobalLoading message="Loading report generation data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <Link
              to="/faculty-dashboard"
              className="text-gray-600 hover:text-blue-800 flex items-center transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <button
              onClick={goBackToAnalysis}
              className="text-blue-600 hover:text-blue-800 flex items-center transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Analysis
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Institutional Report</h1>
              <p className="text-gray-600">Create a comprehensive semester report with faculty assignments for semester {reportData.semester}</p>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-primary-700 mr-2" />
                <div>
                  <p className="text-sm text-primary-700 font-medium">Total Subjects</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.totalSubjects}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-primary-700 mr-2" />
                <div>
                  <p className="text-sm text-primary-700 font-medium">Overall Pass %</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.overallPassPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-primary-200">
          <h2 className="text-lg font-semibold text-primary-900 mb-6 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary-700" />
            Institutional Report Details
          </h2>

          {/* Department Information Section */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-primary-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary-700" />
              Department Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Semester *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${errors.semester ? 'border-red-300' : 'border-primary-200'
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
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${errors.academicYear ? 'border-red-300' : 'border-primary-200'
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
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Department *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${errors.department ? 'border-red-300' : 'border-primary-200'
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

              {/* Class Advisor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Advisor Name *
                </label>
                <ClassAdvisorDropdown
                  value={departmentInfo.classAdvisorName}
                  onChange={(field, value, department) => {
                    // Handle the class advisor name update
                    handleDepartmentInfoChange(field, value);

                    // If department is provided, you might want to store it

                  }}
                  error={errors.classAdvisorName}
                  facultyList={facultyList}
                />
                {errors.classAdvisorName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.classAdvisorName}
                  </p>
                )}
              </div>

              {/* Months/Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Months/Year *
                </label>
                <div className="flex space-x-2">
                  <select
                    className={`w-3/5 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.monthsAndYear ? 'border-red-300' : 'border-gray-300'
                      }`}
                    value={departmentInfo.monthsAndYear ? departmentInfo.monthsAndYear.split(' ')[0] : ''}
                    onChange={(e) => {
                      const currentParts = departmentInfo.monthsAndYear ? departmentInfo.monthsAndYear.split(' ') : [];
                      const year = currentParts[1] || new Date().getFullYear();
                      handleDepartmentInfoChange('monthsAndYear', `${e.target.value} ${year}`);
                    }}
                  >
                    <option value="">Select Month</option>
                    <option value="APRIL/MAY">April/May</option>
                    <option value="NOV/DEC">Nov/Dec</option>
                  </select>

                  <select
                    className={`w-2/5 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.monthsAndYear ? 'border-red-300' : 'border-gray-300'
                      }`}
                    value={departmentInfo.monthsAndYear ? departmentInfo.monthsAndYear.split(' ')[1] : ''}
                    onChange={(e) => {
                      const currentParts = departmentInfo.monthsAndYear ? departmentInfo.monthsAndYear.split(' ') : [];
                      const month = currentParts[0] || '';
                      handleDepartmentInfoChange('monthsAndYear', `${month} ${e.target.value}`);
                    }}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.monthsAndYear && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.monthsAndYear}
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

            {/* Info notice for filtered subjects */}
            {reportData.analysisData.subjectCodes.length < reportData.resultData.totalSubjects && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Note: Subjects with 0 students have been automatically excluded
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Only subjects with enrolled students are shown below for report generation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Name *
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
                        <EnhancedSubjectNameInput
                          subjectCode={subjectCode}
                          value={subjectNames[subjectCode] || ''}
                          onChange={handleSubjectNameChange}
                          error={errors[`subject_${subjectCode}`]}
                          subjectsList={departmentSubjects}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <FacultyNameInput
                          subjectCode={subjectCode}
                          value={facultyAssignments[subjectCode] || ''}
                          onChange={handleFacultyAssignmentChange}
                          error={errors[`faculty_${subjectCode}`]}
                          facultyList={facultyList}
                        />
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
            {/* Show notice if subjects were filtered */}
            {reportData.resultData.subjectWiseResults.filter(subject => subject.totalStudents === 0).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> {reportData.resultData.subjectWiseResults.filter(subject => subject.totalStudents === 0).length} subject(s) with 0 students are hidden from this preview.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.resultData.subjectWiseResults
                .filter(subject => subject.totalStudents > 0)
                .map((subject, index) => (
                  <div
                    key={index}
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
                        className={`h-2 rounded-full transition-all duration-500 ${subject.passPercentage >= 90 ? 'bg-green-500' :
                          subject.passPercentage >= 75 ? 'bg-yellow-500' :
                            subject.passPercentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${subject.passPercentage}%` }}
                      ></div>
                    </div>
                  </div>
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
              <Link
                to="/faculty-dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <button
                onClick={goBackToAnalysis}
                className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analysis
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className={`px-6 py-3 rounded-md font-medium flex items-center transition-all ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-800 hover:bg-primary-900 text-white shadow-lg hover:shadow-xl'
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
        </div>

        {/* Report Generated Success Modal */}
        {showPreview && generatedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-primary-200">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary-700" />
                </div>

                <h3 className="text-lg font-semibold text-primary-950 mb-2">
                  Report Generated Successfully!
                </h3>

                <p className="text-primary-700 mb-6">
                  Your institutional report has been generated successfully. You can now preview it or download it directly.
                </p>

                {/* Report Details */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6 text-left border border-primary-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-primary-900">Department:</span>
                      <p className="text-primary-900">{generatedReport.department}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-900">Semester:</span>
                      <p className="text-primary-900">{generatedReport.semester}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-900">Academic Year:</span>
                      <p className="text-primary-900">{generatedReport.academicYear}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-900">Generated:</span>
                      <p className="text-primary-900">{new Date(generatedReport.generatedAt).toLocaleDateString()}</p>
                    </div>
                    {generatedReport.totalStudents > 0 && (
                      <>
                        <div>
                          <span className="font-medium text-primary-900">Students:</span>
                          <p className="text-primary-900">{generatedReport.totalStudents}</p>
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
                    onClick={async () => {
                      try {
                        // Download the Excel report
                        await pdfReportsApi.generateInstitutionalExcel(generatedReport);
                        toast.success('Excel report downloaded successfully!');
                      } catch {
                        toast.error('Failed to download Excel report. Please try again.');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => dispatch({ type: 'SET_PREVIEW', payload: false })}
                  className="mt-4 text-primary-600 hover:text-primary-800 text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerationPage;
// External dependencies
import { Users, BookOpen, TrendingUp, Award, ArrowLeft, Zap, RefreshCw, UserRound, BookText, PercentSquare } from "lucide-react"
import { useEffect, useState, Fragment } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-hot-toast"

// Internal dependencies
import { analyzePDFWithPdfCo } from "../../api/analyzePdfCo"
import StudentSelectionModal from './StudentSelectionModal';





/**
 * ResultAnalysis Component
 * 
 * A comprehensive dashboard for analyzing academic performance data extracted from PDF result documents.
 * This component provides visualizations and metrics for understanding student performance across subjects.
 * 
 * Features:
 * - Key metrics display (total students, subjects, pass rates)
 * - Subject-wise performance breakdown with progress bars
 * - Interactive pie charts for visualizing pass percentages
 * - Performance summary statistics by category
 * - Student selection functionality for analyzing specific subsets
 * 
 * The component handles:
 * - Loading states during data fetching
 * - Error handling with user-friendly messages
 * - Data processing and calculation of performance metrics
 * - Conditional rendering based on data availability
 * 
 * @returns {JSX.Element} A complete result analysis dashboard with visualizations and metrics
 */
export default function ResultAnalysis() {
  /**
   * SubjectPerformanceItem Component
   * Displays performance metrics for an individual subject with a progress bar
   * 
   * @param {Object} props - Component props
   * @param {Object} props.subject - The subject data object
   * @param {string} props.subject.subject - The subject code or name
   * @param {number} props.subject.passPercentage - The percentage of students who passed
   * @param {number} props.subject.passedStudents - Number of students who passed
   * @param {number} props.subject.totalStudents - Total number of students
   * @returns {JSX.Element} A styled row showing subject performance metrics
   */







































































































































































































  const SubjectPerformanceItem = ({ subject }) => (
    <div className="flex flex-col p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{subject.subject}</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{subject.passedStudents}</span>/<span>{subject.totalStudents}</span> students passed
            {subject.emptyGrades > 0 && (
              <span className="ml-2 text-amber-600">
                ({subject.emptyGrades} students with empty grades)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-3 rounded-full ${getPassPercentageColor(subject.passPercentage)}`}
              style={{ width: `${subject.passPercentage}%`, transition: 'width 1s ease-in-out' }}
            ></div>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getPassPercentageColor(subject.passPercentage)} text-white shadow-sm`}>
            {subject.passPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Students with grades section */}
      {subject.studentsWithGrades && subject.studentsWithGrades.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Students with grades:</p>
          <div className="max-h-40 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subject.studentsWithGrades.map((student, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{student.regNo}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{student.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${student.grade === 'U' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {student.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
  
  /**
   * SummaryStatItem Component
   * Displays a single statistic in a styled card format
   * Used for key metrics in the performance summary section
   * 
   * @param {Object} props - Component props
   * @param {string|number} props.count - The statistic value to display
   * @param {string} props.label - The label describing the statistic
   * @param {string} props.bgColor - CSS class for the background color
   * @param {string} props.textColor - CSS class for the count text color
   * @param {string} props.labelColor - CSS class for the label text color
   * @returns {JSX.Element} A styled card displaying a statistic with its label
   */
  const SummaryStatItem = ({ count, label, bgColor, textColor, labelColor }) => (
    <div className={`text-center p-5 ${bgColor} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>
        {count}
      </div>
      <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
    </div>
  );

  // React Router hooks for navigation and URL parameter access
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  /**
   * Component state variables
   */
  // Loading state to track data fetching progress
  const [loading, setLoading] = useState(true);
  
  // Stores the complete analysis data returned from the API
  const [analysisData, setAnalysisData] = useState(null);
  
  // List of all students from the PDF
  const [students, setStudents] = useState([]);
  
  // List of all subject codes found in the PDF
  const [subjectCodes, setSubjectCodes] = useState([]);
  
  // Controls visibility of the student selection modal
  const [showModal, setShowModal] = useState(false);
  
  // Tracks the selected starting student index for analysis
  const [selectedStartIndex, setSelectedStartIndex] = useState(null);
  
  // Processed result data for the selected student range
  const [resultData, setResultData] = useState(null);
  
  // PDF ID extracted from URL parameters
  const [pdfId] = useState(searchParams.get('id'));
  
  // Semester information extracted from URL parameters
  const [semester] = useState(searchParams.get('semester'));
  
  // Tracks if PDF.co analysis is in progress
  const [pdfCoLoading, setPdfCoLoading] = useState(false);

  /**
   * Fetches and processes PDF analysis data when the component mounts
   * 
   * This effect:
   * 1. Validates required URL parameters (pdfId and semester)
   * 2. Retrieves the optional page parameter if present
   * 3. Calls the analyzePDF API with appropriate parameters
   * 4. Validates the returned data contains student information
   * 5. Updates component state with the fetched data
   * 6. Shows the student selection modal
   * 7. Handles errors by displaying toast notifications and redirecting
   * 
   * Dependencies: pdfId, semester, navigate, searchParams
   * The effect re-runs if any of these dependencies change
   */
  /**
   * Refreshes the analysis using the PDF.co enhanced analysis
   * Fetches new data when requested
   */
  const refreshAnalysis = async () => {
    try {
      // Reset states and show loading
      setResultData(null);
      setPdfCoLoading(true);
      
      // Get the page parameter from the URL if it exists
      const page = searchParams.get('page');
      
      // Use PDF.co analysis method
      const data = await analyzePDFWithPdfCo(pdfId, page);
      
      // Check if we have students data
      if (!data.students || data.students.length === 0) {
        toast.error('No student data found in this PDF. Please try another PDF or page.');
        setPdfCoLoading(false);
        return;
      }
      
      // Update component state with fetched data
      setAnalysisData(data);
      setStudents(data.students);
      setSubjectCodes(data.subjectCodes);
      
      // If we already had a selected index, reprocess with the new data
      if (selectedStartIndex !== null) {
        handleSelectStudent(selectedStartIndex);
      } else {
        setShowModal(true);
      }
      
      // Show success message
      toast.success('Analysis refreshed with enhanced PDF.co processing');
      
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      toast.error(`Failed to refresh analysis. Please try again.`);
    } finally {
      setPdfCoLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        // Validate required parameters
        if (!pdfId || !semester) {
          toast.error("Missing PDF information. Please select a valid PDF to analyze.");
          navigate('/dashboard');
          return;
        }
        
        // Get the page parameter from the URL if it exists
        const page = searchParams.get('page');
        
        // Use PDF.co enhanced analysis
        const data = await analyzePDFWithPdfCo(pdfId, page);
        
        // Check if we have students data
        if (!data.students || data.students.length === 0) {
          toast.error('No student data found in this PDF. Please try another PDF or page.');
          navigate('/dashboard');
          return;
        }
        
        // Update component state with fetched data
        setAnalysisData(data);
        setStudents(data.students);
        setSubjectCodes(data.subjectCodes);
        setShowModal(true);
        setLoading(false);
      } catch (error) {
        // Handle errors
        console.error('Error fetching analysis data:', error);
        toast.error('Failed to analyze PDF. Please try again.');
        setLoading(false);
        navigate('/dashboard');
      }
    };

    // Execute the fetch function
    fetchData();
  }, [pdfId, semester, navigate, searchParams]); // Re-run if these dependencies change
  
  /**
   * Processes student data starting from the selected index and calculates performance metrics
   * 
   * This function:
   * 1. Validates the provided student index
   * 2. Updates component state with the selected starting index
   * 3. Extracts the subset of students to analyze (from selected index to end)
   * 4. Calculates overall pass percentage (students who passed all subjects)
   * 5. Calculates subject-wise performance metrics (pass rates per subject)
   * 6. Updates the resultData state with all calculated metrics
   * 
   * @param {number} startIndex - The index of the first student to include in analysis
   * @returns {void}
   */
  const handleSelectStudent = (startIndex) => {
    console.log('handleSelectStudent called with startIndex:', startIndex);
    console.log('Current students array:', students);
    
    // Input validation to prevent processing with invalid indices
    if (startIndex === undefined || startIndex === null || startIndex < 0 || startIndex >= students.length) {
      console.error('Invalid startIndex:', startIndex);
      toast.error('Invalid student selection. Please try again.');
      return;
    }
    
    // Update state and close the selection modal
    setSelectedStartIndex(startIndex);
    setShowModal(false);
    
    // Get the subset of students starting from the selected index
    const selectedStudents = students.slice(startIndex);
    
    // Calculate overall pass percentage (students who passed all subjects)
    const total = selectedStudents.length;
    const passed = selectedStudents.filter(s => 
      Object.values(s.grades).every(g => g !== "U") // "U" represents a failing grade
    ).length;
    const overallPass = (passed / total) * 100;
    
    // Find students with complete grade records (no empty grades for any subject)
    const studentsWithCompleteGrades = selectedStudents.filter(student => {
      return subjectCodes.every(code => student.grades[code]);
    });
    
    // Calculate subject-wise pass percentages and track empty grades
    const subjectWiseResults = subjectCodes.map(code => {
      // Count students who have a grade for this subject (not empty)
      const appeared = selectedStudents.filter(s => s.grades[code]).length;
      
      // Count students who passed this subject (grade is not "U")
      const passed = selectedStudents.filter(s => s.grades[code] && s.grades[code] !== "U").length;
      
      // Count students with empty grades for this subject
      const emptyGrades = selectedStudents.filter(s => !s.grades[code]).length;
      
      // Get list of students with grades for this subject
      const studentsWithGrades = selectedStudents
        .filter(s => s.grades[code])
        .map(s => ({
          regNo: s.regNo,
          name: s.name,
          grade: s.grades[code]
        }));
      
      // Calculate pass percentage, handling division by zero
      const passPercentage = appeared > 0 ? (passed / appeared) * 100 : 0;
      
      // Return structured data for this subject
      return {
        subject: code,
        passPercentage,
        totalStudents: appeared,
        passedStudents: passed,
        emptyGrades,
        studentsWithGrades
      };
    });
    
    // Update the result data state with all calculated metrics
    setResultData({
      totalStudents: total,
      totalSubjects: subjectCodes.length,
      overallPassPercentage: overallPass,
      studentsWithCompleteGrades: studentsWithCompleteGrades.map(s => ({
        regNo: s.regNo,
        name: s.name,
        grades: s.grades
      })),
      subjectWiseResults
    });
  };

  /**
   * Handles the closing of the student selection modal
   * 
   * This function:
   * 1. Checks if a student has been selected (selectedStartIndex is not null)
   * 2. If no student was selected, defaults to selecting the first student (index 0)
   * 3. If a student was already selected, simply closes the modal
   * 
   * @returns {void}
   */
  const handleCloseModal = () => {
    console.log('handleCloseModal called, selectedStartIndex:', selectedStartIndex);
    if (selectedStartIndex === null) {
      // If no student was selected, default to the first student
      console.log('No student selected, defaulting to first student');
      handleSelectStudent(0);
    } else {
      console.log('Student already selected, just closing modal');
      setShowModal(false);
    }
  };

  /**
   * Mapping of performance categories to their visual styles
   * Used for consistent color coding across the dashboard
   * 
   * @type {Object.<string, {color: string, badge: string}>}
   * @property {Object} excellent - Styles for 90% and above (green)
   * @property {Object} good - Styles for 75-89% (blue)
   * @property {Object} average - Styles for 60-74% (yellow)
   * @property {Object} poor - Styles for below 60% (red)
   * @property {string} *.color - The background color CSS class
   * @property {string} *.badge - The badge variant name
   */
  const performanceStyles = {
    excellent: { color: "bg-green-500", badge: "default" },
    good: { color: "bg-blue-500", badge: "secondary" },
    average: { color: "bg-yellow-500", badge: "outline" },
    poor: { color: "bg-red-500", badge: "destructive" }
  };

  /**
   * Determines the performance category based on the pass percentage
   * 
   * @param {number} percentage - The pass percentage to categorize
   * @returns {string} The performance category (excellent, good, average, or poor)
   */
  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    if (percentage >= 60) return "average";
    return "poor";
  };

  /**
   * Gets the appropriate CSS background color class based on the pass percentage
   * Uses the performanceStyles mapping and getPerformanceCategory function
   * 
   * @param {number} percentage - The pass percentage to determine the color for
   * @returns {string} CSS class for the appropriate background color
   */
  const getPassPercentageColor = (percentage) => {
    return performanceStyles[getPerformanceCategory(percentage)].color;
  };

  /**
   * LoadingSpinner Component
   * Displays a centered loading spinner with a customizable message
   * Used during data fetching and processing operations
   * 
   * @param {Object} props - Component props
   * @param {string} [props.message="Loading analysis data..."] - The message to display below the spinner
   * @returns {JSX.Element} A full-screen loading indicator with spinner and message
   */
  const LoadingSpinner = ({ message = "Loading analysis data..." }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  /**
   * Main component render method
   * Renders the entire Result Analysis Dashboard with all its sections
   */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Navigation and controls */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <button
          onClick={refreshAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
          disabled={pdfCoLoading}
        >
          {pdfCoLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="ml-2">Processing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Analysis
            </>
          )}
        </button>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Result Analysis</h1>
        <p className="text-gray-600 mt-2">
          Analyzing semester {semester} results from PDF ID: {pdfId}
        </p>
      </div>

      {/* Student selection modal */}
      <StudentSelectionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        students={students}
        onSelectStudent={handleSelectStudent}
      />

      {/* Main content */}
      {pdfCoLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Analyzing PDF results...</p>
        </div>
      ) : !resultData ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Select a starting student to view analysis
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Select Student
          </button>
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-blue-50 shadow-sm rounded-lg p-6 flex items-center">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <UserRound className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 truncate">Total Students</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{resultData.totalStudents}</p>
              </div>
            </div>

            {/* Total Subjects */}
            <div className="bg-purple-50 shadow-sm rounded-lg p-6 flex items-center">
              <div className="bg-purple-500 p-3 rounded-full mr-4">
                <BookText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 truncate">Total Subjects</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{resultData.totalSubjects}</p>
              </div>
            </div>

            {/* Overall Pass Percentage */}
            <div className="bg-green-50 shadow-sm rounded-lg p-6 flex items-center">
              <div className="bg-green-500 p-3 rounded-full mr-4">
                <PercentSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 truncate">Overall Pass Percentage</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {resultData.overallPassPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-indigo-600">
              <h2 className="text-lg font-semibold text-white">Subject-wise Performance</h2>
              <p className="text-indigo-100 text-sm">
                Pass percentage for each subject
              </p>
            </div>

            <div className="p-6">
              {/* Subject Performance Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Subject Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resultData.subjectWiseResults.map((subject, index) => (
                    <SubjectPerformanceItem key={index} subject={subject} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display students with complete grade records */}
          {resultData && resultData.studentsWithCompleteGrades && resultData.studentsWithCompleteGrades.length > 0 && (
            <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-indigo-600">
                <h3 className="text-lg font-semibold text-white">Students With Complete Grade Records</h3>
                <p className="text-indigo-100 text-sm">
                  {resultData.studentsWithCompleteGrades.length} students have grades for all subjects
                </p>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      {subjectCodes.map(code => (
                        <th key={code} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{code}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultData.studentsWithCompleteGrades.map((student, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.regNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                        {subjectCodes.map(code => (
                          <td key={code} className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.grades[code] === 'U' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {student.grades[code]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analysisData && (
            <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Raw Analysis Data</h3>
                    <p className="text-sm text-gray-500">Showing data from selected starting point onwards</p>
                  </div>
                  <button
                    onClick={() => {
                      // Create a filtered version of the data
                      const filteredData = {
                        ...analysisData,
                        students: analysisData.students.slice(selectedStartIndex)
                      };
                      const jsonStr = JSON.stringify(filteredData, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analysis_${semester}_from_${analysisData.students[selectedStartIndex]?.regNo}_${new Date().toISOString()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Download JSON
                  </button>
                </div>
                <div className="mt-4">
                  <pre 
                    className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre overflow-y-auto max-h-[500px]"
                    style={{
                      tabSize: 2,
                      WebkitTextSizeAdjust: "100%",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    }}
                  >
                    {JSON.stringify(
                      {
                        ...analysisData,
                        students: analysisData.students.slice(selectedStartIndex)
                      }, 
                      null, 
                      2
                    )
                      .split('\n')
                      .map((line, i) => (
                        <div key={i} className="hover:bg-gray-100 py-0.5">
                          {line}
                        </div>
                      ))
                    }
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Performance Summary Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Performance Summary</h3>
              <p className="text-sm text-gray-500">Key insights from the result analysis</p>
            </div>
            
            {/* Summary statistics cards */}
            <div className="p-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Excellent performance category (90%+) */}
                <SummaryStatItem 
                  count={resultData.subjectWiseResults.filter((s) => s.passPercentage >= 90).length}
                  label="Subjects with 90%+ pass rate"
                  bgColor="bg-green-50"
                  textColor="text-green-600"
                  labelColor="text-green-700"
                />
                
                {/* Good performance category (75-89%) */}
                <SummaryStatItem 
                  count={resultData.subjectWiseResults.filter((s) => s.passPercentage >= 75 && s.passPercentage < 90).length}
                  label="Subjects with 75-89% pass rate"
                  bgColor="bg-yellow-50"
                  textColor="text-yellow-600"
                  labelColor="text-yellow-700"
                />
                
                {/* Needs improvement category (<75%) */}
                <SummaryStatItem 
                  count={resultData.subjectWiseResults.filter((s) => s.passPercentage < 75).length}
                  label="Subjects needing improvement"
                  bgColor="bg-red-50"
                  textColor="text-red-600"
                  labelColor="text-red-700"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


import { Users, BookOpen, TrendingUp, Award, ArrowLeft, Zap, RefreshCw, UserRound, BookText, PercentSquare, FileText, Download } from "lucide-react"
import { useEffect, useState, Fragment } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"

// Internal dependencies
import { analyzePDFWithPdfCo } from "@/api/analyzePdfCo"
import StudentSelectionModal from './StudentSelectionModal';


export default function ResultAnalysis() {

  // Helper function to check if a grade is an arrear grade
  const isArrearGrade = (grade) => {
    const arrearGrades = ['U', 'F', 'RA', 'UA', 'R', 'WH'];
    return arrearGrades.includes(grade);
  };

  const SubjectPerformanceItem = ({ subject }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-primary-200 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-primary-950 text-lg flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-primary-600" />
            {subject.subject}
          </h3>
          <p className="text-sm text-primary-700">
            <span className="font-semibold text-green-600">{subject.passedStudents}</span>/<span className="text-primary-800">{subject.totalStudents}</span> students passed
            {subject.emptyGrades > 0 && (
              <span className="ml-2 text-primary-600">
                ({subject.emptyGrades} students with empty grades)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-32 bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subject.passPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2.5 rounded-full ${getPassPercentageColor(subject.passPercentage)}`}
            />
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${getPassPercentageColor(subject.passPercentage)} text-white shadow-lg`}>
            {subject.passPercentage.toFixed(1)}%
          </span>
        </div>
      </div>


      {/* Students with grades section */}
      {subject.studentsWithGrades && subject.studentsWithGrades.length > 0 && (
        <div className="mt-3 pt-3 border-t border-primary-200">
          <p className="text-sm font-semibold text-primary-900 mb-2">Students with grades:</p>
          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-primary-900 uppercase tracking-wider">Reg No</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-primary-900 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-primary-900 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {subject.studentsWithGrades.map((student, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'} >
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-primary-900 font-mono">{student.regNo}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-primary-800">{student.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${isArrearGrade(student.grade) ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
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
    </motion.div>
  );

  const SummaryStatItem = ({ count, label, bgColor, textColor, labelColor }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`text-center p-6 ${bgColor} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-500 hover:-translate-y-1`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`text-4xl font-black ${textColor} mb-2`}
      >
        {count}
      </motion.div>
      <p className={`text-sm font-semibold ${labelColor} uppercase tracking-wide`}>{label}</p>
    </motion.div>
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

    } catch {
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
      } catch {
        // Handle errors
        toast.error('Failed to analyze PDF. Please try again.');
        setLoading(false);
        navigate('/dashboard');
      }
    };


    // Execute the fetch function
    fetchData();
  }, [pdfId, semester, navigate, searchParams]); // Re-run if these dependencies change

  const handleSelectStudent = (startIndex) => {

    // Input validation to prevent processing with invalid indices
    if (startIndex === undefined || startIndex === null || startIndex < 0 || startIndex >= students.length) {
      toast.error('Invalid student selection. Please try again.');
      return;
    }

    // Update state and close the selection modal
    setSelectedStartIndex(startIndex);
    setShowModal(false);

    // Get the subset of students starting from the selected index
    const selectedStudents = students.slice(startIndex);

    // Show a toast notification to make it clear what's happening
    const selectedStudent = students[startIndex];
    toast.success(
      <div>
        <strong>Analysis starting from:</strong> {selectedStudent.name} ({selectedStudent.regNo})<br />
        <span className="text-sm">Analyzing {selectedStudents.length} of {students.length} students</span>
      </div>,
      { duration: 5000 }
    );

    // Calculate overall pass percentage (students who passed all subjects)
    const total = selectedStudents.length;
    const passed = selectedStudents.filter(s =>
      Object.values(s.grades).every(g => !isArrearGrade(g)) // Check if all grades are not arrear grades
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

      // Count students who passed this subject (grade is not an arrear grade)
      const passed = selectedStudents.filter(s => s.grades[code] && !isArrearGrade(s.grades[code])).length;

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


  const handleCloseModal = () => {
    if (selectedStartIndex === null) {
      // If no student was selected, default to the first student
      handleSelectStudent(0);
    } else {
      setShowModal(false);
    }
  };


  const performanceStyles = {
    excellent: { color: "bg-green-500", badge: "default" },
    good: { color: "bg-blue-500", badge: "secondary" },
    average: { color: "bg-yellow-500", badge: "outline" },
    poor: { color: "bg-red-500", badge: "destructive" }
  };


  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    if (percentage >= 60) return "average";
    return "poor";
  };


  const getPassPercentageColor = (percentage) => {
    return performanceStyles[getPerformanceCategory(percentage)].color;
  };


  const LoadingSpinner = ({ message = "Loading analysis data..." }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-200 border-t-primary-700 rounded-full mx-auto"
        />
        <p className="mt-4 text-primary-700 font-semibold">{message}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation and controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <Link to="/faculty-dashboard" className="text-primary-700 hover:text-primary-800 flex items-center group transition-all">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex gap-3">
            {/* Generate Report Button - only show when we have result data */}
            {resultData && (
              <Link
                to="/generate-report"
                onClick={() => {
                  // Filter out subjects with 0 students before saving
                  const subjectsWithStudents = resultData.subjectWiseResults
                    .filter(subject => subject.totalStudents > 0)
                    .map(subject => subject.subject);

                  // Filter subject-wise results to include only subjects with students
                  const filteredSubjectWiseResults = resultData.subjectWiseResults
                    .filter(subject => subject.totalStudents > 0);

                  // Save the required data to session storage before navigating
                  const reportData = {
                    pdfId,
                    semester,
                    selectedStartIndex,
                    analysisData: {
                      ...analysisData,
                      students: students.slice(selectedStartIndex),
                      subjectCodes: subjectsWithStudents // Only include subjects with students
                    },
                    resultData: {
                      ...resultData,
                      totalSubjects: subjectsWithStudents.length, // Update total subjects count
                      subjectWiseResults: filteredSubjectWiseResults // Only include subjects with students
                    }
                  };

                  sessionStorage.setItem('reportGenerationData', JSON.stringify(reportData));
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Link>
            )}
            <button
              onClick={refreshAnalysis}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-lg hover:from-primary-800 hover:to-primary-900 transition-all flex items-center shadow-lg hover:shadow-xl font-semibold"
              disabled={pdfCoLoading}
            >
              {pdfCoLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </>
              )}
            </button>
          </div>
        </motion.div>


        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-950">Result Analysis</h1>
          <p className="text-primary-700 mt-2">
            Analyzing semester {semester} results from PDF ID: {pdfId}
          </p>
          {selectedStartIndex !== null && students.length > 0 && (
            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md">
              <p className="text-sm text-primary-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong>Analysis Range:</strong> Starting from student {selectedStartIndex + 1} of {students.length} -
                  <strong>{students[selectedStartIndex]?.name}</strong> ({students[selectedStartIndex]?.regNo})
                </span>
              </p>
              <p className="text-xs text-primary-700 mt-1 ml-7">
                Analyzing {students.length - selectedStartIndex} of {students.length} total students in the PDF
              </p>
            </div>
          )}
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
            <p className="mt-4 text-primary-700">Analyzing PDF results...</p>
          </div>
        ) : !resultData ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-primary-700">
              Select a starting student to view analysis
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Select Starting Student
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
              <div className="px-6 py-4 bg-primary-700">
                <h2 className="text-lg font-semibold text-white">Subject-wise Performance</h2>
                <p className="text-primary-100 text-sm">
                  Pass percentage for each subject
                </p>
              </div>

              {/* Info notice for subjects with 0 students */}
              {resultData.subjectWiseResults.some(subject => subject.totalStudents === 0) && (
                <div className="mx-6 mt-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-700 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-primary-900 font-medium">
                        Report Generation Notice
                      </p>
                      <p className="text-xs text-primary-800 mt-1">
                        Subjects with 0 students will be automatically excluded from the generated report. Only subjects with enrolled students will appear in the final Excel file.
                      </p>
                    </div>
                  </div>
                </div>
              )}


              <div className="p-6">
                {/* Subject Performance Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary-950">Detailed Subject Performance</h3>
                  {/* Show count of filtered subjects if any */}
                  {resultData.subjectWiseResults.filter(subject => subject.totalStudents === 0).length > 0 && (
                    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
                      <p className="text-sm text-primary-800">
                        <strong>Note:</strong> {resultData.subjectWiseResults.filter(subject => subject.totalStudents === 0).length} subject(s) with 0 students are hidden from this view.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resultData.subjectWiseResults
                      .filter(subject => subject.totalStudents > 0)
                      .map((subject, index) => (
                        <SubjectPerformanceItem key={index} subject={subject} />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* New Card: All Students From Selected Starting Index */}
            <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-primary-700">
                <h3 className="text-lg font-semibold text-white">All Students From Selected Start</h3>
                <p className="text-primary-100 text-sm">
                  Showing {students.slice(selectedStartIndex).length} students starting from {students[selectedStartIndex]?.name} ({students[selectedStartIndex]?.regNo})
                </p>
              </div>
              <div className="relative overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-primary-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Reg No</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Name</th>
                        {/* Only show subjects with students */}
                        {subjectCodes.filter(code => {
                          const subjectResult = resultData.subjectWiseResults.find(s => s.subject === code);
                          return subjectResult && subjectResult.totalStudents > 0;
                        }).map(code => (
                          <th key={code} scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">{code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-primary-200">
                      {students.slice(selectedStartIndex).map((student, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-950">{student.regNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-950">{student.name}</td>
                          {/* Only show subjects with students */}
                          {subjectCodes.filter(code => {
                            const subjectResult = resultData.subjectWiseResults.find(s => s.subject === code);
                            return subjectResult && subjectResult.totalStudents > 0;
                          }).map(code => (
                            <td key={code} className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!student.grades[code] ? 'bg-gray-100 text-gray-800' :
                                isArrearGrade(student.grades[code]) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {student.grades[code] || '-'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Display students with complete grade records */}
            {resultData && resultData.studentsWithCompleteGrades && resultData.studentsWithCompleteGrades.length > 0 && (
              <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-primary-700">
                  <h3 className="text-lg font-semibold text-white">Students With Complete Grade Records</h3>
                  <p className="text-primary-100 text-sm">
                    {resultData.studentsWithCompleteGrades.length} students have grades for all subjects
                  </p>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-primary-200">
                    <thead className="bg-primary-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Reg No</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Name</th>
                        {/* Only show subjects with students */}
                        {subjectCodes.filter(code => {
                          const subjectResult = resultData.subjectWiseResults.find(s => s.subject === code);
                          return subjectResult && subjectResult.totalStudents > 0;
                        }).map(code => (
                          <th key={code} scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">{code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-primary-200">
                      {resultData.studentsWithCompleteGrades.map((student, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-950">{student.regNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-950">{student.name}</td>
                          {/* Only show subjects with students */}
                          {subjectCodes.filter(code => {
                            const subjectResult = resultData.subjectWiseResults.find(s => s.subject === code);
                            return subjectResult && subjectResult.totalStudents > 0;
                          }).map(code => (
                            <td key={code} className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isArrearGrade(student.grades[code]) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
                      <h3 className="text-xl font-semibold text-primary-950">Raw Analysis Data</h3>
                      <p className="text-sm text-primary-700">
                        Showing data from selected starting point onwards
                        <span className="ml-2 text-blue-600 font-medium">
                          (Starting from student {selectedStartIndex + 1} of {analysisData.students.length})
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
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
                    <div className="bg-primary-50 p-3 mb-3 rounded-md border border-primary-200">
                      <p className="text-sm text-primary-800">
                        <strong>Note:</strong> This view shows only the students starting from your selected student (index {selectedStartIndex}).
                        The analysis results above are calculated using only these students, not the entire PDF.
                      </p>
                    </div>
                    <pre
                      className="text-xs font-mono bg-primary-50 p-4 rounded-lg overflow-x-auto whitespace-pre overflow-y-auto max-h-[500px]"
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
                          <div key={i} className="hover:bg-primary-100 py-0.5">
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
                <h3 className="text-xl font-semibold text-primary-950">Performance Summary</h3>
                <p className="text-sm text-primary-700">Key insights from the result analysis</p>
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
    </div>
  );
}

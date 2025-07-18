// External dependencies
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { Users, BookOpen, TrendingUp, Award, ArrowLeft } from "lucide-react"
import { useEffect, useState, Fragment } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

// Internal dependencies
import { analyzePDF } from "../../api/analyze"
import StudentSelectionModal from './StudentSelectionModal';

/**
 * Color palette for the pie chart segments
 * Using a consistent color scheme across the application
 * These colors are designed to be visually distinct and accessible
 */
const COLORS = [
  '#3366CC', // Rich Blue
  '#00A278', // Teal
  '#FFB900', // Amber
  '#F25022', // Red Orange
  '#7B61FF', // Purple
  '#00B294', // Mint
  '#E74856', // Red
  '#00BCF2', // Sky Blue
  '#FF8C00', // Dark Orange
  '#525CE5', // Indigo
  '#16C60C', // Green
  '#B4009E'  // Magenta
];

/**
 * Transforms the raw result data into a format suitable for the subject-wise pie chart
 * 
 * @param {Object} resultData - The processed result data containing subject performance metrics
 * @param {Array<Object>} resultData.subjectWiseResults - Array of subject performance objects
 * @param {string} resultData.subjectWiseResults[].subject - Subject code or name
 * @param {number} resultData.subjectWiseResults[].passPercentage - Percentage of students who passed
 * @param {number} resultData.subjectWiseResults[].passedStudents - Number of students who passed
 * @param {number} resultData.subjectWiseResults[].totalStudents - Total number of students
 * @returns {Array<Object>} Formatted data array for the pie chart with name, value, count and total properties
 */
const createSubjectPieData = (resultData) => {
  // Return empty array if resultData is missing or has no subjectWiseResults
  if (!resultData || !resultData.subjectWiseResults) {
    return [];
  }
  
  // Transform each subject result into the format expected by the pie chart
  return resultData.subjectWiseResults.map(subject => ({
    name: subject.subject,         // Subject code/name for the chart label
    value: subject.passPercentage, // Pass percentage for the chart segment size
    count: subject.passedStudents, // Number of passed students for tooltip/legend
    total: subject.totalStudents   // Total students for tooltip/legend
  }));
};

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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">{subject.subject}</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{subject.passedStudents}</span>/<span>{subject.totalStudents}</span> students passed
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
        
        // Pass the page parameter to the analyzePDF function
        const data = await analyzePDF(pdfId, page);
        
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
    
    // Calculate subject-wise pass percentages
    const subjectWiseResults = subjectCodes.map(code => {
      // Count students who have a grade for this subject
      const appeared = selectedStudents.filter(s => s.grades[code]).length;
      // Count students who passed this subject (grade is not "U")
      const passed = selectedStudents.filter(s => s.grades[code] && s.grades[code] !== "U").length;
      // Calculate pass percentage, handling division by zero
      const passPercentage = appeared > 0 ? (passed / appeared) * 100 : 0;
      
      // Return structured data for this subject
      return {
        subject: code,
        passPercentage,
        totalStudents: appeared,
        passedStudents: passed
      };
    });
    
    // Update the result data state with all calculated metrics
    setResultData({
      totalStudents: total,
      totalSubjects: subjectCodes.length,
      overallPassPercentage: overallPass,
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

  // Create pie data from result data
  const subjectPieData = resultData ? createSubjectPieData(resultData) : [];

  /**
   * Main component render method
   * Renders the entire Result Analysis Dashboard with all its sections
   */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full space-y-4">
        {/* Navigation - Back Button */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </button>

        {/* Page Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Result Analysis Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of Semester {semester} academic performance</p>
        </div>

        {/* Student Selection Modal - Conditionally rendered based on showModal state */}
        <StudentSelectionModal 
          isOpen={showModal} 
          onClose={handleCloseModal} 
          students={students} 
          onSelectStudent={handleSelectStudent} 
        />

        {/* Conditional Rendering based on loading and data state */}
        {loading ? (
          <LoadingSpinner />
        ) : resultData ? (
          <>
            {/* Key Metrics Section - Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Students Card */}
              <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500 overflow-hidden">
                <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
                  <Users className="h-5 w-5 text-blue-500" /> {/* Icon from lucide-react */}
                </div>
                <div className="px-4 pb-4">
                  <div className="text-3xl font-bold text-gray-900">{resultData.totalStudents}</div>
                  <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
                </div>
              </div>

              {/* Total Subjects Card */}
              <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-green-500 overflow-hidden">
                <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Subjects</h3>
                  <BookOpen className="h-5 w-5 text-green-500" /> {/* Icon from lucide-react */}
                </div>
                <div className="px-4 pb-4">
                  <div className="text-3xl font-bold text-gray-900">{resultData.totalSubjects}</div>
                  <p className="text-xs text-gray-500 mt-1">Academic subjects</p>
                </div>
              </div>

              {/* Overall Pass Percentage Card */}
              <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 overflow-hidden">
                <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-gray-600">Overall Pass Rate</h3>
                  <TrendingUp className="h-5 w-5 text-purple-500" /> {/* Icon from lucide-react */}
                </div>
                <div className="px-4 pb-4">
                  <div className="text-3xl font-bold text-gray-900">{resultData.overallPassPercentage}%</div>
                  <p className="text-xs text-gray-500 mt-1">Average across all subjects</p>
                </div>
              </div>

              {/* Top Performing Subject Card */}
              <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-orange-500 overflow-hidden">
                <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-gray-600">Top Subject</h3>
                  <Award className="h-5 w-5 text-orange-500" /> {/* Icon from lucide-react */}
                </div>
                <div className="px-4 pb-4">
                  {/* Find the subject with the highest pass percentage using reduce */}
                  <div className="text-lg font-bold text-gray-900">
                    {
                      resultData.subjectWiseResults.reduce((prev, current) =>
                        prev.passPercentage > current.passPercentage ? prev : current,
                      ).subject
                    }
                  </div>
                  {/* Display the highest pass percentage */}
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.max(...resultData.subjectWiseResults.map((s) => s.passPercentage))}% pass rate
                  </p>
                </div>
              </div>
            </div>

            {/* Subject-wise Analysis */}
            <div className="grid grid-cols-1 gap-4">
              {/* Subject-wise Pass Percentage Pie Chart - Full Width */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Chart header section */}
                <div className="p-6 pb-2">
                  <h3 className="text-xl font-semibold">Subject-wise Pass Percentage</h3>
                  <p className="text-sm text-gray-500">Visual representation of pass rates by subject</p>
                </div>
                
                {/* Chart container */}
                <div className="p-6 pt-2">
                  {/* Responsive container with full width */}
                  <div className="mx-auto w-full" style={{ height: '500px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* 
                          Main Pie Chart Component
                          - data: Array of objects with subject data
                          - dataKey: Property to determine segment size (pass percentage)
                          - nameKey: Property to use for segment labels (subject code)
                          - cx/cy: Center position of the pie (50% centers it in the container)
                          - outerRadius: Size of the pie chart
                          - innerRadius: Creates the donut effect (empty center)
                        */}
                        <Pie
                          data={subjectPieData}
                          dataKey="value" 
                          nameKey="name" 
                          cx="40%"
                          cy="50%"
                          outerRadius="35%"
                          innerRadius="20%" 
                          fill="#8884d8"
                          paddingAngle={3} 
                          // Custom label function that shows subject code and pass percentage
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                          labelLine={{ stroke: '#ccc', strokeWidth: 1, strokeDasharray: '3 3' }}
                        >
                          {/* 
                            Cell components define the color for each segment
                            Uses the COLORS array and cycles through it if there are more segments than colors
                          */}
                          {subjectPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        
                        {/* 
                          Legend Component
                          - formatter: Customizes the text shown in the legend
                          - layout: Arranges legend items vertically
                          - align/verticalAlign: Positions the legend on the right side, middle
                        */}
                        <Legend 
                          formatter={(value, entry) => 
                            // Format: "Subject: 85.5% (17/20)" - shows subject, pass rate, and passed/total
                            `${value}: ${entry.payload.value.toFixed(1)}% (${entry.payload.count}/${entry.payload.total})`
                          } 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{ paddingLeft: 30, right: 20, width: '30%', maxHeight: '80%', overflowY: 'auto' }}
                          iconSize={10}
                          iconType="circle"
                        />
                        
                        {/* 
                          Tooltip Component
                          - Appears when hovering over a segment
                          - formatter: Customizes the value display in the tooltip
                          - labelFormatter: Customizes the label display in the tooltip
                        */}
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value.toFixed(1)}%`, 
                            'Pass Rate'
                          ]} 
                          labelFormatter={(name) => `Subject: ${name}`}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '10px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Subject-wise Performance Table Section */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="p-6 pb-2">
                  <h3 className="text-xl font-semibold">Subject-wise Performance</h3>
                  <p className="text-sm text-gray-500">Detailed breakdown of pass percentages by subject</p>
                </div>
                
                {/* List of subject performance items */}
                <div className="p-6 pt-2">
                  <div className="space-y-4">
                    {/* Map through each subject and render a performance item */}
                    {resultData.subjectWiseResults.map((subject, index) => (
                      <SubjectPerformanceItem 
                        key={index} 
                        subject={subject} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw JSON Data Section */}
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
        ) : (
          /* Fallback message when no analysis data is available */
          <div className="text-center py-12">
            <p className="text-gray-500">No analysis data available. Please select a student to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  )
}

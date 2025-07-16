// Using standard HTML elements instead of UI component library
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { Users, BookOpen, TrendingUp, Award, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"


// Sample data - replace with your actual data
const resultData = {
  totalStudents: 450,
  totalSubjects: 8,
  overallPassPercentage: 78.5,
  subjectWiseResults: [
    { subject: "Mathematics", passPercentage: 85, totalStudents: 450, passedStudents: 383 },
    { subject: "Physics", passPercentage: 72, totalStudents: 450, passedStudents: 324 },
    { subject: "Chemistry", passPercentage: 68, totalStudents: 450, passedStudents: 306 },
    { subject: "Biology", passPercentage: 91, totalStudents: 450, passedStudents: 410 },
    { subject: "English", passPercentage: 88, totalStudents: 450, passedStudents: 396 },
    { subject: "History", passPercentage: 75, totalStudents: 450, passedStudents: 338 },
    { subject: "Geography", passPercentage: 82, totalStudents: 450, passedStudents: 369 },
    { subject: "Computer Science", passPercentage: 94, totalStudents: 450, passedStudents: 423 },
  ],
}

// Define colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

// Create performance categories for pie chart
const performanceCategories = [
  { name: 'Excellent (90%+)', range: (p) => p >= 90 },
  { name: 'Good (75-89%)', range: (p) => p >= 75 && p < 90 },
  { name: 'Average (60-74%)', range: (p) => p >= 60 && p < 75 },
  { name: 'Poor (<60%)', range: (p) => p < 60 }
];

// Create pie data by counting subjects in each performance category
const pieData = performanceCategories.map(category => {
  const count = resultData.subjectWiseResults.filter(s => category.range(s.passPercentage)).length;
  return { name: category.name, value: count, count: count };
});

export default function ResultAnalysis() {
  // SubjectPerformanceItem component for better organization
  const SubjectPerformanceItem = ({ subject }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{subject.subject}</h3>
        <p className="text-sm text-gray-500">
          {subject.passedStudents}/{subject.totalStudents} students passed
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getPassPercentageColor(subject.passPercentage)}`}
            style={{ width: `${subject.passPercentage}%` }}
          ></div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPassPercentageColor(subject.passPercentage)} text-white`}>
          {subject.passPercentage}%
        </span>
      </div>
    </div>
  );
  
  // SummaryStatItem component for better organization
  const SummaryStatItem = ({ count, label, bgColor, textColor, labelColor }) => (
    <div className={`text-center p-4 ${bgColor} rounded-lg`}>
      <div className={`text-2xl font-bold ${textColor}`}>
        {count}
      </div>
      <p className={`text-sm ${labelColor}`}>{label}</p>
    </div>
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pdfId] = useState(searchParams.get('id'));
  const [semester] = useState(searchParams.get('semester'));

  useEffect(() => {
    // Here you would fetch the actual result data using the pdfId and semester
    // For now, we'll just simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      // If no ID or semester was provided, show an error
      if (!pdfId || !semester) {
        toast.error("Missing PDF information. Please select a valid PDF to analyze.");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pdfId, semester]);

  // Map performance categories to colors and badge variants
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

  const getPassPercentageBadgeVariant = (percentage) => {
    return performanceStyles[getPerformanceCategory(percentage)].badge;
  }

  // Loading spinner component for better organization
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full space-y-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Result Analysis Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of Semester {semester} academic performance</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500 overflow-hidden">
            <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="px-4 pb-4">
              <div className="text-3xl font-bold text-gray-900">{resultData.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
            </div>
          </div>

          {/* Total Subjects */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-green-500 overflow-hidden">
            <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Subjects</h3>
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
            <div className="px-4 pb-4">
              <div className="text-3xl font-bold text-gray-900">{resultData.totalSubjects}</div>
              <p className="text-xs text-gray-500 mt-1">Academic subjects</p>
            </div>
          </div>

          {/* Overall Pass Percentage */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 overflow-hidden">
            <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Overall Pass Rate</h3>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="px-4 pb-4">
              <div className="text-3xl font-bold text-gray-900">{resultData.overallPassPercentage}%</div>
              <p className="text-xs text-gray-500 mt-1">Average across all subjects</p>
            </div>
          </div>

          {/* Top Performing Subject */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-orange-500 overflow-hidden">
            <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Top Subject</h3>
              <Award className="h-5 w-5 text-orange-500" />
            </div>
            <div className="px-4 pb-4">
              <div className="text-lg font-bold text-gray-900">
                {
                  resultData.subjectWiseResults.reduce((prev, current) =>
                    prev.passPercentage > current.passPercentage ? prev : current,
                  ).subject
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.max(...resultData.subjectWiseResults.map((s) => s.passPercentage))}% pass rate
              </p>
            </div>
          </div>
        </div>

        {/* Subject-wise Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Subject-wise Pass Percentage Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Subject-wise Performance</h3>
              <p className="text-sm text-gray-500">Detailed breakdown of pass percentages by subject</p>
            </div>
            <div className="p-6 pt-2">
              <div className="space-y-4">
                {resultData.subjectWiseResults.map((subject, index) => (
                  <SubjectPerformanceItem key={index} subject={subject} />
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Pass Percentage Distribution</h3>
              <p className="text-sm text-gray-500">Visual representation of subject-wise performance</p>
            </div>
            <div className="p-6 pt-2">
              <div className="mx-auto aspect-square max-h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      innerRadius={70}
                      fill="#8884d8"
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-xl font-semibold">Performance Summary</h3>
            <p className="text-sm text-gray-500">Key insights from the result analysis</p>
          </div>
          <div className="p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryStatItem 
                count={resultData.subjectWiseResults.filter((s) => s.passPercentage >= 90).length}
                label="Subjects with 90%+ pass rate"
                bgColor="bg-green-50"
                textColor="text-green-600"
                labelColor="text-green-700"
              />
              <SummaryStatItem 
                count={resultData.subjectWiseResults.filter((s) => s.passPercentage >= 75 && s.passPercentage < 90).length}
                label="Subjects with 75-89% pass rate"
                bgColor="bg-yellow-50"
                textColor="text-yellow-600"
                labelColor="text-yellow-700"
              />
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
      </div>
    </div>
  )
}

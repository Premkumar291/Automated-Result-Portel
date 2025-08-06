import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Users, BookOpen, CalendarDays, Settings, Edit3 } from 'lucide-react';
import pdfReportsApi from '@/api/pdfReports';

// Report Generation Page
function ReportGenerationPage() {
  const [reportData, setReportData] = useState(null);
  const [formData, setFormData] = useState({
    facultyName: '',
    semester: '',
    academicYear: '',
    department: 'CSE',
    subjectCode: '',
    subjectName: '',
    reportType: 'standard' // 'standard' or 'enhanced'
  });
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve saved report generation data
    const data = sessionStorage.getItem('reportGenerationData');
    if (data) {
      const parsedData = JSON.parse(data);
      setReportData(parsedData);

      // Initialize form data with data from analysis
      setFormData({
        facultyName: '',
        semester: parsedData.semester || '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        department: 'CSE'
      });
    } else {
      toast.error('Failed to load report generation data.');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePDF = async () => {
    try {
      if (!reportData) return;

      // Validate required fields
      if (!formData.facultyName.trim()) {
        toast.error('Please enter faculty name');
        return;
      }
      if (!formData.semester.trim()) {
        toast.error('Please enter semester');
        return;
      }
      if (!formData.academicYear.trim()) {
        toast.error('Please enter academic year');
        return;
      }
      if (!formData.department.trim()) {
        toast.error('Please select department');
        return;
      }

      setLoading(true);

      // Prepare the API request data in the format expected by the backend
      const apiRequestData = {
        facultyName: formData.facultyName.trim(),
        semester: formData.semester.trim(),
        academicYear: formData.academicYear.trim(),
        department: formData.department,
        analysisData: {
          students: reportData.analysisData.students,
          subjectCodes: reportData.analysisData.subjectCodes
        },
        reportType: selectedTemplate
      };

      // Add enhanced fields if enhanced template is selected
      if (selectedTemplate === 'enhanced') {
        apiRequestData.subjectCode = formData.subjectCode.trim();
        apiRequestData.subjectName = formData.subjectName.trim();
      }

      console.log('Sending API request with data:', apiRequestData);

      // Generate PDF report via appropriate API endpoint
      const response = selectedTemplate === 'enhanced' 
        ? await pdfReportsApi.generateEnhancedReport(apiRequestData)
        : await pdfReportsApi.generateReport(apiRequestData);
      
      if (response.success) {
        toast.success('PDF report generated successfully!');
        
        // Trigger download
        if (response.data.downloadUrl) {
          const downloadBlob = await pdfReportsApi.downloadReport(response.data.reportId);
          const filename = `${formData.department}_Semester_${formData.semester}_${formData.academicYear}_Report.pdf`;
          pdfReportsApi.triggerDownload(downloadBlob, filename);
        }
        
        // Navigate back to analysis page
        setTimeout(() => {
          navigate('/result-analysis?id=' + reportData.pdfId + '&semester=' + reportData.semester);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error.message || 'Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            to={`/result-analysis?id=${reportData.pdfId}&semester=${reportData.semester}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Analysis
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Semester Report</h1>
              <p className="text-gray-600">Create a comprehensive PDF report for semester {reportData.semester}</p>
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
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Subjects</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.totalSubjects}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CalendarDays className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Overall Pass %</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.resultData.overallPassPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Details</h2>
          
          {/* Template Selection */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Select Report Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Standard Template */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === 'standard' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate('standard')}
              >
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Standard Report</h4>
                </div>
                <p className="text-sm text-gray-600">Basic semester result analysis with student grades and subject-wise statistics.</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Quick Generate
                  </span>
                </div>
              </div>
              
              {/* Enhanced Template */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === 'enhanced' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate('enhanced')}
              >
                <div className="flex items-center mb-2">
                  <Edit3 className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Enhanced Report</h4>
                </div>
                <p className="text-sm text-gray-600">Detailed course outcome-based report with editable fields and comprehensive analysis.</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Professional Format
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Template Fields */}
          {selectedTemplate === 'enhanced' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-4 w-4 mr-2 text-green-600" />
                Enhanced Report Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., CS301"
                    value={formData.subjectCode}
                    onChange={(e) => handleInputChange('subjectCode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Data Structures and Algorithms"
                    value={formData.subjectName}
                    onChange={(e) => handleInputChange('subjectName', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <p className="text-sm text-gray-600">
                  <strong>Enhanced Report Features:</strong>
                </p>
                <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                  <li>Course outcome-based analysis</li>
                  <li>Detailed faculty information section</li>
                  <li>Before/after remedial action tracking</li>
                  <li>Professional signature sections</li>
                  <li>Comprehensive result evaluation</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Faculty Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter faculty name handling the report"
                value={formData.facultyName}
                onChange={(e) => handleInputChange('facultyName', e.target.value)}
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 6"
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2024-2025"
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              >
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">Electronics & Communication Engineering</option>
                <option value="EEE">Electrical & Electronics Engineering</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="IT">Information Technology</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          {/* Subject-wise Results Preview */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Subject-wise Results Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.resultData.subjectWiseResults.map((subject, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">{subject.subject}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Total Students: <span className="font-medium">{subject.totalStudents}</span></p>
                    <p>Passed: <span className="font-medium text-green-600">{subject.passedStudents}</span></p>
                    <p>Pass Rate: <span className="font-medium">{subject.passPercentage.toFixed(1)}%</span></p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subject.passPercentage >= 90 ? 'bg-green-500' :
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

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGeneratePDF}
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium flex items-center ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportGenerationPage;


import React, { useState, useEffect } from 'react';
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
          semester: parsedData.semester || '',
          department: parsedData.department || 'CSE' // Pre-fill department from analysis if available
        }));

      } catch (error) {
        console.error('ReportGenerationPage: Error parsing sessionStorage data:', error);
        toast.error('Invalid report data. Please go back to analysis page.');
        navigate('/result-analysis');
      }
    } else {
      console.error('ReportGenerationPage: No data found in sessionStorage');
      toast.error('No report generation data found. Please go back to analysis page.');
      navigate('/result-analysis');
    }
  }, [navigate]);

  const handleDepartmentInfoChange = (field, value) => {
    setDepartmentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    navigate('/result-analysis');
    toast('Returned to analysis page.');
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const reportPayload = {
        department: departmentInfo.department,
        semester: departmentInfo.semester.trim(),
        academicYear: departmentInfo.academicYear.trim(),
        // Analysis data from the previous analysis
        analysisData: {
          fileName: reportData.fileName,
          totalStudents: reportData.resultData.totalStudents,
          overallPassPercentage: reportData.resultData.overallPassPercentage,
          subjectWiseResults: reportData.resultData.subjectWiseResults
        },
        facultyId: null, // Will use req.user?.id from backend
        instituteName: 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
        instituteLocation: 'ERODE - 638 316',
        reportGeneratedAt: new Date().toISOString()
      };

      console.log('Generating institutional report with data:', reportRequestData);

      // Call the new API to generate and download the Excel report directly
      await pdfReportsApi.generateInstitutionalExcel(reportRequestData);

      // Since the file is downloaded directly, we can show success and a preview modal
      // using the data we already have on the client.
      toast.success('Excel report downloaded successfully!');

      // Use the request data to populate the preview modal
      setGeneratedReport({
        ...reportRequestData,
        // Mimic structure of old response for preview component
        generatedAt: reportRequestData.reportGeneratedAt,
        totalStudents: reportRequestData.analysisData.totalStudents,
        overallPassPercentage: reportRequestData.analysisData.overallPassPercentage,
        filename: `institutional_report_${reportRequestData.semester}.xlsx` // Approximate filename
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-700">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              Generate Institutional Report
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Finalize details for the report based on analysis of <span className="font-semibold">{reportData.fileName}</span>.
            </p>
          </div>
          <button 
            onClick={goBackToAnalysis}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </button>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Institutional Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input type="text" readOnly value={departmentInfo.department} className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-100 rounded focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <input type="text" readOnly value={departmentInfo.semester} className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-100 rounded focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                <input type="text" className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.academicYear ? 'border-red-300' : 'border-gray-300'}`} placeholder="e.g., 2023-2024" value={departmentInfo.academicYear} onChange={(e) => handleDepartmentInfoChange('academicYear', e.target.value)} />
                {errors.academicYear && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.academicYear}</p>}
              </div>
            </div>
          </div>

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
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-bold text-gray-800">{subject.subjectCode}</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Appeared:</span> {subject.appeared}</p>
                    <p><span className="font-medium">Passed:</span> {subject.passed}</p>
                    <p><span className="font-medium">Pass %:</span> {subject.passPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button onClick={handleGenerateReport} disabled={loading} className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all">
              {loading ? (
                <><Loader className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Generate Institutional Report</>
              )}
            </button>
          </div>
        </div>

        {showPreview && generatedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Report Ready!</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">Your institutional report has been successfully generated.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Department:</span><p className="text-gray-900">{generatedReport.department}</p></div>
                    <div><span className="font-medium text-gray-700">Semester:</span><p className="text-gray-900">{generatedReport.semester}</p></div>
                    <div><span className="font-medium text-gray-700">Academic Year:</span><p className="text-gray-900">{generatedReport.academicYear}</p></div>
                    <div><span className="font-medium text-gray-700">Generated:</span><p className="text-gray-900">{new Date(generatedReport.generatedAt).toLocaleDateString()}</p></div>
                    {generatedReport.totalStudents > 0 && (
                      <>
                        <div><span className="font-medium text-gray-700">Students:</span><p className="text-gray-900">{generatedReport.totalStudents}</p></div>
                        <div><span className="font-medium text-gray-700">Pass Rate:</span><p className="text-gray-900">{generatedReport.overallPassPercentage?.toFixed(1)}%</p></div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'; const correctedPreviewUrl = `${apiBaseUrl}/reports/preview/${generatedReport.reportId}`; window.open(correctedPreviewUrl, '_blank'); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
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
                <button onClick={() => setShowPreview(false)} className="mt-4 text-gray-500 hover:text-gray-700 text-sm transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerationPage;

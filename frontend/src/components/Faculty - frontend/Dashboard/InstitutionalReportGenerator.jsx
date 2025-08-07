import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, AlertCircle, CheckCircle, Building2, Calendar, BookOpen } from 'lucide-react';
import { pdfReportsApi } from '../../../api/pdfReports';

const InstitutionalReportGenerator = ({ isDarkMode }) => {
  const [formData, setFormData] = useState({
    department: 'IT',
    semester: 'I',
    academicYear: '2024-2025',
    instituteName: 'INSTITUTE OF ROAD AND TRANSPORT TECHNOLOGY',
    instituteLocation: 'ERODE - 638 316'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async () => {
    if (!formData.department || !formData.semester || !formData.academicYear) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const reportData = {
        department: formData.department,
        semester: formData.semester,
        academicYear: formData.academicYear,
        instituteName: formData.instituteName,
        instituteLocation: formData.instituteLocation,
        // Empty analysis data for template generation
        analysisData: null
      };

      const response = await pdfReportsApi.generateInstitutionalReport(reportData);
      setGeneratedReport(response.data);
      setSuccess('Institutional report generated successfully!');
    } catch (error) {
      console.error('Error generating institutional report:', error);
      setError(error.message || 'Failed to generate institutional report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!generatedReport?.reportId) return;

    try {
      const blob = await pdfReportsApi.downloadReport(generatedReport.reportId);
      const filename = generatedReport.filename || 'institutional_report.pdf';
      pdfReportsApi.triggerDownload(blob, filename);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report. Please try again.');
    }
  };

  const handlePreviewReport = () => {
    if (!generatedReport?.reportId) return;

    const previewUrl = pdfReportsApi.getPreviewUrl(generatedReport.reportId);
    window.open(previewUrl, '_blank');
  };

  return (
    <div className={`${isDarkMode ? 'dark-elevated-card' : 'elevated-card'} p-6 hover-lift`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <motion.div
          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Building2 className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </motion.div>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Institutional Result Analysis Report
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>
            Generate official institutional format reports matching your institute's template
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Institute Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Institute Name
            </label>
            <input
              type="text"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter institute name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Institute Location
            </label>
            <input
              type="text"
              name="instituteLocation"
              value={formData.instituteLocation}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter institute location"
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Department *
            </label>
            <div className="relative">
              <BookOpen className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                required
              >
                <option value="IT">Information Technology</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="EEE">Electrical & Electronics</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Semester *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              required
            >
              <option value="I">Semester I</option>
              <option value="II">Semester II</option>
              <option value="III">Semester III</option>
              <option value="IV">Semester IV</option>
              <option value="V">Semester V</option>
              <option value="VI">Semester VI</option>
              <option value="VII">Semester VII</option>
              <option value="VIII">Semester VIII</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Academic Year *
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder="e.g., 2024-2025"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <motion.button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            whileHover={!isGenerating ? { scale: 1.02 } : {}}
            whileTap={!isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Institutional Report</span>
              </>
            )}
          </motion.button>

          {generatedReport && (
            <>
              <motion.button
                onClick={handlePreviewReport}
                className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } hover:shadow-lg transform hover:-translate-y-0.5`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </motion.button>

              <motion.button
                onClick={handleDownloadReport}
                className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } hover:shadow-lg transform hover:-translate-y-0.5`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </motion.button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </motion.div>
        )}

        {/* Generated Report Info */}
        {generatedReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Report Generated Successfully
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Department:</span> {generatedReport.department}
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Semester:</span> {generatedReport.semester}
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Academic Year:</span> {generatedReport.academicYear}
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Generated:</span> {new Date(generatedReport.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Information Note */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0`} />
            <div>
              <h4 className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-1`}>
                Institutional Report Template
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                This generates a blank institutional format report template matching your institute's official layout. 
                The template includes proper headers, table structure, and signature sections as shown in the provided format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalReportGenerator;

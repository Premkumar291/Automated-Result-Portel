import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import pdfReportsApi from '@/api/pdfReports';
import InstitutionalReportGenerator from './InstitutionalReportGenerator';
import { FileText, Building2, GraduationCap } from 'lucide-react';

// Faculty Report Editor Component
function FacultyReportEditor({ analysisData, semester, academicYear, department, isDarkMode }) {
  const [facultyName, setFaculyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('standard');

  const handleGenerateReport = async () => {
    if (!facultyName) {
      toast.error('Please enter the faculty name.');
      return;
    }

    setLoading(true);
    try {
      // Generate PDF report
      const response = await pdfReportsApi.generateReport({
        facultyName,
        semester,
        academicYear,
        department,
        analysisData
      });

      toast.success('PDF report generated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'standard', label: 'Standard Report', icon: FileText },
    { id: 'institutional', label: 'Institutional Format', icon: Building2 },
    { id: 'enhanced', label: 'Enhanced Report', icon: GraduationCap }
  ];

  return (
    <div className={`${isDarkMode ? 'dark-elevated-card' : 'elevated-card'} p-6 hover-lift`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <motion.div
          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileText className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        </motion.div>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Report Generation Center
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>
            Generate various types of academic reports with different formats and templates
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'standard' && (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Faculty Name
              </label>
              <input
                type="text"
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                value={facultyName}
                onChange={(e) => setFaculyName(e.target.value)}
                placeholder="Enter faculty name"
              />
            </div>
            <motion.button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Standard PDF Report</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {activeTab === 'institutional' && (
          <InstitutionalReportGenerator isDarkMode={isDarkMode} />
        )}

        {activeTab === 'enhanced' && (
          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <GraduationCap className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Enhanced Report Coming Soon
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Advanced reporting features with detailed analytics and customizable templates will be available soon.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FacultyReportEditor;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Check, X, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FacultyNameInput = ({ 
  subjectCodes = [], 
  currentAssignments = {}, 
  onSave,
  isDarkMode,
  className = '' 
}) => {
  const [facultyAssignments, setFacultyAssignments] = useState(currentAssignments);
  const [errors, setErrors] = useState({});

  // Update assignments when currentAssignments prop changes
  // But only if the currentAssignments object actually changed (by reference)
  useEffect(() => {
    // Only update if the reference has changed to prevent loop issues
    if (currentAssignments !== facultyAssignments) {
      setFacultyAssignments(currentAssignments);
    }
  }, [currentAssignments, facultyAssignments]);

const handleFacultyNameChange = (subjectCode, facultyName) => {
    // Don't trim the name as user types - only trim for validation and saving
    // This keeps the typing experience natural
    setFacultyAssignments(prev => ({
      ...prev,
      [subjectCode]: facultyName ? {
        name: facultyName, // Store exactly what user typed
        displayName: facultyName,
        isManual: true
      } : undefined
    }));

    // Clear error for this subject if name is provided
    if (facultyName && errors[subjectCode]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[subjectCode];
        return newErrors;
      });
    }

  // Auto-save on change, but use setTimeout to debounce and avoid too many updates
    if (onSave) {
      // Use the facultyName as-is in the update function to keep state consistent
      const updatedAssignments = {
        ...facultyAssignments,
        [subjectCode]: facultyName ? {
          name: facultyName,
          displayName: facultyName,
          isManual: true
        } : undefined
      };
      
      // Filter out undefined values
      const cleanAssignments = Object.fromEntries(
        Object.entries(updatedAssignments).filter(([_, value]) => value !== undefined)
      );
      
      // Add a slight delay before saving to debounce rapid typing
      setTimeout(() => {
        onSave(cleanAssignments);
      }, 300);
    }
  };

  const validateAssignments = () => {
    const newErrors = {};
    let hasErrors = false;

    subjectCodes.forEach(subjectCode => {
      const assignment = facultyAssignments[subjectCode];
      if (!assignment || !assignment.name || !assignment.name.trim()) {
        newErrors[subjectCode] = 'Faculty name is required';
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const clearAllAssignments = () => {
    setFacultyAssignments({});
    setErrors({});
    if (onSave) {
      onSave({});
    }
    toast.success('All faculty assignments cleared');
  };

  const getCompletionStats = () => {
    const total = subjectCodes.length;
    const assigned = Object.keys(facultyAssignments).filter(
      key => facultyAssignments[key]?.name?.trim()
    ).length;
    const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0;
    return { total, assigned, percentage };
  };

  const stats = getCompletionStats();

  if (subjectCodes.length === 0) {
    return (
      <div className={`${className} p-8 text-center ${
        isDarkMode ? 'text-gray-500' : 'text-gray-500'
      }`}>
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No subjects available for faculty assignment</p>
        <p className="text-xs mt-1">Please select a department and semester first</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            stats.assigned === stats.total && stats.total > 0
              ? isDarkMode ? 'bg-green-900' : 'bg-green-100'
              : stats.assigned > 0
              ? isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
              : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <Users className={`w-5 h-5 ${
              stats.assigned === stats.total && stats.total > 0
                ? 'text-green-500'
                : stats.assigned > 0
                ? 'text-yellow-500'
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Faculty Assignment
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter faculty names for each subject ({stats.assigned}/{stats.total} completed)
            </p>
          </div>
        </div>

        {stats.assigned > 0 && (
          <button
            onClick={clearAllAssignments}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-red-800/30 text-red-400 hover:bg-red-800/50' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Progress
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.percentage}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <motion.div
              className="h-2 rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Subject Input Grid */}
      <div className="space-y-4">
        {subjectCodes.map((subjectCode, index) => {
          const assignment = facultyAssignments[subjectCode];
          const hasError = errors[subjectCode];
          const isAssigned = assignment?.name?.trim();

          return (
            <motion.div
              key={`faculty-input-${subjectCode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                hasError
                  ? isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50'
                  : isAssigned
                  ? isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
                  : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="space-y-3">
              {/* Subject Code Label - Make it more prominent */}
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-t-lg border-b border-blue-200">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-lg text-blue-800">
                      {subjectCode}
                    </span>
                  </div>
                  {isAssigned && (
                    <div className="flex items-center space-x-1 text-green-500">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">Assigned</span>
                    </div>
                  )}
                </div>

                {/* Faculty Name Input */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Faculty Name for <span className="font-bold">{subjectCode}</span>:
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={assignment?.name || ''}
                      onChange={(e) => handleFacultyNameChange(subjectCode, e.target.value)}
                      placeholder={`Enter faculty name for ${subjectCode}...`}
                      data-subject-code={subjectCode} /* Add data attribute to help with debugging */
                      className={`w-full pl-10 pr-3 py-3 rounded-lg border text-sm transition-all duration-200 ${
                        hasError
                          ? isDarkMode 
                            ? 'border-red-600 bg-red-900/10 text-red-200 placeholder-red-400' 
                            : 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
                          : isAssigned
                          ? isDarkMode 
                            ? 'border-green-600 bg-green-900/10 text-green-200 placeholder-green-400' 
                            : 'border-green-300 bg-green-50 text-green-900 placeholder-green-400'
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                  
                  {/* Error message */}
                  {hasError && (
                    <motion.div 
                      key={`error-${subjectCode}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-1 mt-1 text-red-500"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">{hasError}</span>
                    </motion.div>
                  )}
                  
                  {/* Success indicator */}
                  {isAssigned && !hasError && (
                    <motion.div 
                      key={`success-${subjectCode}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                    >
                      ✓ Faculty assigned: {assignment.name}
                    </motion.div>
                  )}
                </div>

                {/* Clear individual assignment */}
                {isAssigned && (
                  <button
                    onClick={() => handleFacultyNameChange(subjectCode, '')}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    title="Clear faculty assignment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          key="validation-summary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-lg border ${
            isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className={`font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
              {Object.keys(errors).length} subject{Object.keys(errors).length !== 1 ? 's' : ''} need{Object.keys(errors).length === 1 ? 's' : ''} faculty assignment
            </h4>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
            Please enter faculty names for all subjects to proceed with report generation.
          </p>
        </motion.div>
      )}

      {/* Completion Summary */}
      {stats.assigned === stats.total && stats.total > 0 && (
        <motion.div
          key="completion-summary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-lg border ${
            isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-500" />
            <h4 className={`font-medium ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
              All faculty assignments completed!
            </h4>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
            You can now generate reports with complete faculty information.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FacultyNameInput;

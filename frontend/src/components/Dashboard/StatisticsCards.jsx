import { useState, useEffect } from 'react';

const StatisticsCards = ({ pdfData, isVisible = false }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    totalSubjects: 0,
    studentGrowth: 0,
    scoreGrowth: 0,
    passGrowth: 0,
    subjectGrowth: 0
  });

  // Process PDF data to extract statistics
  useEffect(() => {
    if (pdfData && pdfData.gradeAnalysis && pdfData.gradeAnalysis.success) {
      // Use the grade analysis data directly from backend
      const gradeAnalysis = pdfData.gradeAnalysis;
      const overallStats = gradeAnalysis.overallStats;
      
      setStats({
        totalStudents: overallStats.totalStudents || 0,
        averageScore: overallStats.averagePassRate || 0,
        passRate: overallStats.overallPassRate || 0,
        totalSubjects: overallStats.totalSubjects || 0,
        studentGrowth: 0,
        scoreGrowth: 0,
        passGrowth: 0,
        subjectGrowth: 0
      });
    } else if (pdfData && Array.isArray(pdfData) && pdfData.length > 0) {
      // Fallback to old extraction method if grade analysis is not available
      extractStatisticsFromPDF(pdfData);
    } else {
      // Reset stats when no data
      setStats({
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        totalSubjects: 0,
        studentGrowth: 0,
        scoreGrowth: 0,
        passGrowth: 0,
        subjectGrowth: 0
      });
    }
  }, [pdfData]);

  const extractStatisticsFromPDF = (data) => {
    try {
      let totalStudents = 0;
      let totalScore = 0;
      let passedStudents = 0;
      let subjects = new Set();
      let studentsProcessed = new Set();
      
      data.forEach(record => {
        // Count unique students using ID, name, or combination
        const studentKey = record.studentId || record.name || `${record.tableIndex}_${record.rowIndex}`;
        
        if (!studentsProcessed.has(studentKey)) {
          studentsProcessed.add(studentKey);
          totalStudents++;
        }
        
        // Extract scores (handle different formats)
        let score = 0;
        if (record.marks !== undefined && record.marks !== null) {
          score = parseFloat(record.marks);
        } else if (record.score !== undefined) {
          score = parseFloat(record.score);
        } else if (record.percentage !== undefined) {
          score = parseFloat(record.percentage);
        }
        
        if (!isNaN(score) && score >= 0 && score <= 100) {
          totalScore += score;
          if (score >= 50) { // Assuming 50% is pass criteria
            passedStudents++;
          }
        }
        
        // Extract subjects
        if (record.subject && record.subject !== 'General') {
          subjects.add(record.subject);
        }
      });

      const averageScore = totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : 0;
      const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0;

      setStats({
        totalStudents,
        averageScore: parseFloat(averageScore),
        passRate: parseFloat(passRate),
        totalSubjects: subjects.size,
        studentGrowth: 0,
        scoreGrowth: 0,
        passGrowth: 0,
        subjectGrowth: 0
      });
    } catch (error) {
      console.error('Error processing PDF data:', error);
    }
  };

  // Enhanced Statistics Card Component
  const StatCard = ({ icon, title, value, growth, color, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        {growth > 0 && (
          <div className={`text-sm font-bold ${color} bg-green-50 px-2 py-1 rounded-full`}>
            +{growth}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // Placeholder card when no data is available
  const PlaceholderCard = ({ icon, title, bgColor }) => (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-6 border border-gray-200 opacity-60">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center shadow-sm opacity-50`}>
          {icon}
        </div>
        <div className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          --
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-400">--</p>
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-400">Upload PDF to view data</p>
      </div>
    </div>
  );

  if (!isVisible) {
    // Show placeholder cards when no PDF is uploaded
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <PlaceholderCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="Total Students"
          bgColor="bg-blue-300"
        />
        
        <PlaceholderCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="Average Score"
          bgColor="bg-green-300"
        />
        
        <PlaceholderCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          title="Pass Rate"
          bgColor="bg-purple-300"
        />
        
        <PlaceholderCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="Total Subjects"
          bgColor="bg-orange-300"
        />
      </div>
    );
  }

  // Show actual data cards when PDF is uploaded
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <StatCard
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="Total Students"
        value={stats.totalStudents.toLocaleString()}
        growth={stats.studentGrowth}
        color="text-green-500"
        bgColor="bg-blue-500"
      />
      
      <StatCard
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        title="Average Score"
        value={`${stats.averageScore}%`}
        growth={stats.scoreGrowth}
        color="text-green-500"
        bgColor="bg-green-500"
      />
      
      <StatCard
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
        title="Pass Rate"
        value={`${stats.passRate}%`}
        growth={stats.passGrowth}
        color="text-green-500"
        bgColor="bg-purple-500"
      />
      
      <StatCard
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        title="Total Subjects"
        value={stats.totalSubjects}
        growth={stats.subjectGrowth}
        color="text-green-500"
        bgColor="bg-orange-500"
      />
    </div>
  );
};

export default StatisticsCards;

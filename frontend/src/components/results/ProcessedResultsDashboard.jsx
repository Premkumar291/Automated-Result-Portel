import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, Clock } from 'lucide-react';
import { getProcessedResults } from '../../api/processedResult';

const ProcessedResultsDashboard = () => {
  const [stats, setStats] = useState({
    totalResults: 0,
    thisMonth: 0,
    averageProcessingTime: '2.3s',
    successRate: '95%'
  });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getProcessedResults();
      if (data.success) {
        setRecentResults(data.data.slice(0, 5)); // Show latest 5
        
        // Calculate basic stats
        const total = data.data.length;
        const thisMonth = data.data.filter(item => {
          const uploadDate = new Date(item.uploadedAt);
          const now = new Date();
          return uploadDate.getMonth() === now.getMonth() && 
                 uploadDate.getFullYear() === now.getFullYear();
        }).length;

        setStats(prevStats => ({
          ...prevStats,
          totalResults: total,
          thisMonth: thisMonth
        }));
      }
    } catch (error) {
      console.error('Error fetching processed results:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Total Results Processed"
          value={stats.totalResults}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="This Month"
          value={stats.thisMonth}
          subtitle="New uploads"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Avg. Processing Time"
          value={stats.averageProcessingTime}
          color="yellow"
        />
        <StatCard
          icon={Users}
          title="Success Rate"
          value={stats.successRate}
          subtitle="Extraction accuracy"
          color="purple"
        />
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Uploads</h3>
        </div>
        <div className="p-6">
          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first PDF to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {result.metadata.totalRows} rows • {result.metadata.extractionMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(result.uploadedAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      result.metadata.confidence >= 0.8 
                        ? 'bg-green-100 text-green-800'
                        : result.metadata.confidence >= 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(result.metadata.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessedResultsDashboard;

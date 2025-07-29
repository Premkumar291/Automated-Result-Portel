import { useState } from 'react';
import { analyzePDFWithPdfCo } from '../../api/analyzePdfCo';
import { Zap } from 'lucide-react';

/**
 * Example component demonstrating how to use the PDF.co enhanced analysis
 * This component shows a simple form to analyze a PDF using the PDF.co API
 */
export default function PdfCoAnalysisExample() {
  const [pdfId, setPdfId] = useState('');
  const [page, setPage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Override console.log to capture logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Setup console log capture
  useState(() => {
    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogs(prevLogs => [...prevLogs, { type: 'log', content: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ') }]);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      setLogs(prevLogs => [...prevLogs, { type: 'error', content: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ') }]);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  /**
   * Handles the form submission to analyze a PDF using PDF.co
   */
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);
    
    try {
      // Call the PDF.co analysis API
      console.log('Starting PDF.co analysis workflow...');
      const data = await analyzePDFWithPdfCo(pdfId, page || undefined);
      console.log('Analysis complete, displaying results');
      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">PDF.co Enhanced Analysis</h2>
        <Zap className="h-6 w-6 text-yellow-500" />
      </div>
      
      <form onSubmit={handleAnalyze} className="mb-8 space-y-4">
        <div>
          <label htmlFor="pdfId" className="block text-sm font-medium text-gray-700 mb-1">
            PDF ID
          </label>
          <input
            type="text"
            id="pdfId"
            value={pdfId}
            onChange={(e) => setPdfId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the PDF ID"
            required
          />
        </div>
        
        <div>
          <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">
            Page Number (Optional)
          </label>
          <input
            type="number"
            id="page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page number (optional)"
            min="1"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze with PDF.co'
          )}
        </button>
      </form>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Console Logs Display */}
      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Console Logs
          </h3>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96 font-mono text-xs">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 
                  log.content.includes('===== CSV CONTENT') || 
                  log.content.includes('===== JSON') || 
                  log.content.includes('===== PARSING') ? 'text-yellow-300' : 
                  log.content.includes('===== STEP') ? 'text-green-300' : 'text-gray-300'}`}
              >
                {log.type === 'error' ? '🔴 ' : '🟢 '}
                {log.content}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
          
          <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-bold">{result.students.length}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm font-medium text-gray-500">Subjects</p>
                <p className="text-2xl font-bold">{result.subjectCodes.length}</p>
              </div>
            </div>
            
            {result.students.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-800 mb-2">Sample Student Data</h4>
                <div className="bg-gray-100 p-3 rounded overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(result.students[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {result.subjectCodes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-800 mb-2">Subject Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {result.subjectCodes.map((code, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {result.metadata && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-800 mb-2">Metadata</h4>
                <div className="bg-gray-100 p-3 rounded overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
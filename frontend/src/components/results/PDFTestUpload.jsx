import { useState, useRef } from 'react';

const PDFTestUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileTest = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError('');
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('resultPDF', file);

      const response = await fetch('http://localhost:8080/api/results/test', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Test failed');
      }

      const result = await response.json();
      setTestResult(result.data);
    } catch (err) {
      setError(err.message || 'Test failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileTest(file);
    }
  };

  const resetTest = () => {
    setTestResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">PDF Processing Test</h2>
        
        {!isProcessing && !testResult && !error && (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 hover:bg-gray-50 transition-all">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-lg font-medium text-gray-700 mb-2">
                Test PDF2JSON Processing
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Upload a PDF to test extraction capabilities
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Select PDF for Testing
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Testing PDF2JSON extraction...</div>
          </div>
        )}

        {testResult && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Test Results</h3>
              <p className="text-green-700">File: {testResult.fileName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Structured Data Results */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Structured Data Extraction</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Text Length:</span> {testResult.structuredData.textLength} characters
                  </div>
                  <div>
                    <span className="font-medium">Tables Found:</span> {testResult.structuredData.tablesFound}
                  </div>
                </div>
                
                {testResult.structuredData.firstFewLines.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">First Few Lines:</h5>
                    <div className="bg-white border rounded p-2 text-xs font-mono">
                      {testResult.structuredData.firstFewLines.map((line, index) => (
                        <div key={index} className="truncate">{line || '(empty line)'}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {testResult.structuredData.sampleTable && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Sample Table Data:</h5>
                    <div className="bg-white border rounded p-2 text-xs">
                      <div><strong>Page:</strong> {testResult.structuredData.sampleTable.page}</div>
                      <div><strong>Rows:</strong> {testResult.structuredData.sampleTable.rows.length}</div>
                      <div className="mt-2">
                        {testResult.structuredData.sampleTable.rows.slice(0, 3).map((row, index) => (
                          <div key={index} className="font-mono text-xs truncate">
                            {row.join(' | ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simple Text Results */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Simple Text Extraction</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Text Length:</span> {testResult.simpleText.textLength} characters
                  </div>
                </div>
                
                {testResult.simpleText.firstFewLines.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">First Few Lines:</h5>
                    <div className="bg-white border rounded p-2 text-xs font-mono">
                      {testResult.simpleText.firstFewLines.map((line, index) => (
                        <div key={index} className="truncate">{line || '(empty line)'}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={resetTest}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Test Another PDF
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <h3 className="text-lg font-semibold text-red-800">Test Failed</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={resetTest}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Test Instructions</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            This tool tests the PDF2JSON extraction capabilities
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Upload any PDF file to see how the system extracts text and structured data
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Structured extraction attempts to identify tables and organize data
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Simple extraction gets raw text content from the PDF
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PDFTestUpload;

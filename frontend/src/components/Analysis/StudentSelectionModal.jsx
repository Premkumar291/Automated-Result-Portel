import { Fragment, useState } from 'react';

export default function StudentSelectionModal({ isOpen, students, onSelectStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  if (!isOpen) return null;
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Create a mapping of filtered students to their original indices
  const filteredToOriginalIndex = filteredStudents.map(filteredStudent => 
    students.findIndex(student => student.regNo === filteredStudent.regNo)
  );
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ position: 'relative', zIndex: 10000 }}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                    Select Starting Student
                  </h3>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                    Required Action
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Select the first student to include in the analysis. <strong className="text-blue-600">Only students from this point onward will be analyzed.</strong>
                  </p>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Click on a student</strong> from the list below to select them as the starting point.</span>
                    </p>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Important:</strong> The analysis will <strong>only include students from your selected student onwards</strong>. 
                      Earlier students in the PDF will be excluded from all calculations and statistics.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Search by name or registration number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredStudents.map((student, index) => (
                          <li key={student.regNo} className="py-2">
                            <button
                              className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-[1.02] hover:shadow-md flex items-center justify-between ${isSelecting && selectedStudentIndex === index ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white hover:bg-blue-100 border-gray-200'}`}
                              onClick={() => {
                                  // Prevent multiple clicks
                                  if (isSelecting) return;
                                  
                                  setIsSelecting(true);
                                  setSelectedStudentIndex(index);
                                  
                                  const originalIndex = filteredToOriginalIndex[index];
                                  console.log('Student selected:', student.regNo, 'filtered index:', index, 'original index:', originalIndex);
                                  
                                  // Add a small delay to show the selection state
                                  setTimeout(() => {
                                    onSelectStudent(originalIndex);
                                  }, 300);
                                }}
                              type="button"
                            >
                              <div>
                                <div className={`flex items-center space-x-2 ${isSelecting && selectedStudentIndex === index ? 'text-white' : 'text-gray-900'}`}>
                                  <span className="font-medium">{student.regNo}</span>
                                  <span className="text-sm">-</span>
                                  <span className="font-medium">{student.name}</span>
                                </div>
                                <div className={`text-sm mt-1 ${isSelecting && selectedStudentIndex === index ? 'text-blue-100' : 'text-gray-500'}`}>
                                  Click to select as starting point
                                </div>
                              </div>
                              <div className={isSelecting && selectedStudentIndex === index ? 'text-white' : 'text-blue-500'}>
                                {isSelecting && selectedStudentIndex === index ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No students found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSelecting && selectedStudentIndex === -1 ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={isSelecting}
              onClick={() => {
                // Default to first student if no selection is made
                if (isSelecting) return;
                
                setIsSelecting(true);
                setSelectedStudentIndex(-1); // Special value for the button
                
                // Add a small delay to show the selection state
                setTimeout(() => {
                  onSelectStudent(0);
                }, 300);
              }}
            >
                {isSelecting && selectedStudentIndex === -1 ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Use First Student'
                )}
              </button>
            <div className="mt-2 sm:mt-0 text-xs text-gray-500 flex-1 sm:text-right pr-3">
              <p>Please select a student or use the first student as default</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
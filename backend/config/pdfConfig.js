/**
 * Configuration settings for PDF processing
 * Centralizes all PDF-related configuration options
 */

/**
 * PDF parsing configuration
 */
export const pdfParseConfig = {
  // Maximum number of pages to process in a single request
  // Set to null to process all pages
  maxPages: null,
  
  // Timeout for PDF parsing operations (in milliseconds)
  // Prevents hanging on corrupt or extremely large PDFs
  parseTimeout: 30000, // 30 seconds
  
  // Whether to render images in PDFs (usually not needed for text extraction)
  renderImages: false,
  
  // Whether to extract hyperlinks from PDFs
  extractLinks: false,
  
  // PDF.js rendering options
  renderOptions: {
    // Normalize whitespace during rendering
    normalizeWhitespace: true,
    
    // Disable combining text items that are close together
    // This helps preserve the original text layout
    disableCombineTextItems: true
  }
};

/**
 * Text extraction configuration
 */
export const textExtractionConfig = {
  // Minimum line length to consider for subject names
  // Helps filter out noise in the PDF
  minSubjectNameLength: 3,
  
  // Maximum distance to look for subject names (in lines)
  // How many lines before/after a subject code to search for the name
  subjectNameSearchDistance: 2,
  
  // Patterns for identifying different elements in the PDF
  patterns: {
    // Subject code pattern (e.g., CS101, MATH201)
    subjectCode: '\\b([A-Z]{2,}\\s*\\d{3,})\\b',
    
    // Registration number pattern (e.g., 19CSE001)
    registrationNumber: '\\b(\\d{2}[A-Z]{2,}\\d{2,})\\b',
    
    // Grade patterns (A+, B, C, etc.)
    grades: [
      // Standard grades with word boundaries
      '\\b([A-F][+]?|AB|I)\\b',
      
      // Looser pattern without word boundary after grade
      '([A-F][+]?|AB|I)',
      
      // Pattern for grades that might appear in a separate column
      '.*?\\b([A-F][+]?|AB|I)\\b'
    ]
  },
  
  // Context window for searching for grades (in lines)
  // How many lines before/after a student entry to search for grades
  gradeSearchWindow: 10,
  
  // Context window for searching for student names (in lines)
  // How many lines before/after a registration number to search for names
  nameSearchWindow: 5
};

/**
 * Grade point mapping configuration
 */
export const gradePointConfig = {
  // Standard grades
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C+': 6,
  'C': 5,
  'D': 4,
  'F': 0,  // Fail
  
  // Alternative notations
  'APLUS': 10,
  'BPLUS': 8,
  'CPLUS': 6,
  'A-PLUS': 10,
  'B-PLUS': 8,
  'C-PLUS': 6,
  'A PLUS': 10,
  'B PLUS': 8,
  'C PLUS': 6,
  
  // Special grades
  'EX': 10,   // Excellent/Exceptional
  'VG': 8,    // Very Good
  'G': 6,     // Good
  'S': 5,     // Satisfactory
  'U': 0,     // Unsatisfactory
  'AB': 0,    // Absent
  'I': 0,     // Incomplete
  'NA': 0,    // Not Available
  'N/A': 0,   // Not Available (alternative format)
  '-': 0      // Missing
};

/**
 * PDF extraction performance configuration
 */
export const performanceConfig = {
  // Whether to use compression when creating single-page PDFs
  useCompression: true,
  
  // Compression options for PDF-lib
  compressionOptions: {
    useObjectStreams: true,
    addDefaultPage: false,
    preserveEditability: false
  },
  
  // Maximum buffer size for PDF processing (in bytes)
  // PDFs larger than this will be rejected
  maxBufferSize: 50 * 1024 * 1024, // 50 MB
  
  // Whether to cache extraction results
  enableCaching: true,
  
  // Cache TTL (in seconds)
  cacheTTL: 3600 // 1 hour
};
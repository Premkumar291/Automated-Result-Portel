# PDF Extractor Modules

This directory contains the modularized PDF extraction functionality that was previously in a single large `pdfExtractor.js` file.

## Module Structure

### 📁 **pdfextractor/**
- **`pdfextractor.entry.js`** - Main entry point that exports all functions
- **`dataExtractor.js`** - Main PDF data extraction functionality
- **`contentDetector.js`** - Content detection and structured analysis
- **`tableCreator.js`** - Basic table creation from structured content
- **`gradeTableCreator.js`** - Specialized grade table creation for academic documents

## Functions by Module

### 🔍 **dataExtractor.js**
- `extractStructuredData(pdfData)` - Main function to extract structured data from PDF

### 🔍 **contentDetector.js**
- `detectStructuredContent(texts)` - Detects tables, lists, headers, and paragraphs

### 🔍 **tableCreator.js**
- `createTableFromRows(tableRows)` - Creates tables from accumulated row data

### 🔍 **gradeTableCreator.js**
- `createAnnaUniversityGradeTable(texts)` - Specialized for Anna University grade sheets
- `createSemanticTable(texts)` - General semantic table creation
- `createGridBasedTable(texts, courseCodes, grades, names, studentIds)` - Grid-based table creation

## Usage

### Import All Functions (Recommended)
```javascript
import { 
  extractStructuredData,
  detectStructuredContent,
  createTableFromRows,
  createAnnaUniversityGradeTable,
  createSemanticTable,
  createGridBasedTable
} from './pdfextractor/pdfextractor.entry.js';
```

### Import Specific Modules
```javascript
import { extractStructuredData } from './pdfextractor/dataExtractor.js';
import { detectStructuredContent } from './pdfextractor/contentDetector.js';
```

## Benefits of Modularization

✅ **Better Organization** - Each module has a specific responsibility
✅ **Easier Maintenance** - Smaller, focused files are easier to debug and update
✅ **Improved Testing** - Individual modules can be tested separately
✅ **Code Reusability** - Specific functions can be imported as needed
✅ **Better Collaboration** - Multiple developers can work on different modules
✅ **Reduced Complexity** - Large 800-line file split into manageable pieces

## Backward Compatibility

The original `pdfExtractor.js` file still exists and re-exports all functions, so existing imports will continue to work without changes.

## File Size Reduction

- **Original**: 1 file with 800 lines
- **Modularized**: 5 focused files with 100-200 lines each
- **Maintained**: Full functionality and backward compatibility

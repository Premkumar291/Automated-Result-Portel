# PDF Table Reconstruction Feature

## Overview

The PDF Table Reconstruction feature automatically converts PDF content into clean, structured tabular data with proper column headers and JSON output. This is especially useful for processing result sheets, grade reports, and other tabular documents.

## Features

### 🔧 **Core Functionality**
- **Automatic Header Detection**: Identifies column headers like Roll No, Name, Subject, Marks, etc.
- **Smart Data Alignment**: Aligns data under appropriate column headers
- **Multiple Output Formats**: Provides data in JSON and CSV formats
- **Confidence Scoring**: Indicates the reliability of the extraction process
- **Error Highlighting**: Flags ambiguous rows for manual review

### 📊 **Data Processing**
1. **Primary Method**: Uses pdf2json for structured table extraction
2. **Fallback Method**: Text analysis with pattern recognition
3. **OCR Backup**: Falls back to Tesseract.js if other methods fail
4. **Intelligent Mapping**: Maps data to appropriate columns using content patterns

### 🎯 **Output Structure**
```json
{
  "success": true,
  "data": {
    "headers": ["Roll No", "Name", "Marks"],
    "rows": [
      {
        "Roll No": "12345",
        "Name": "John Doe", 
        "Marks": "85"
      }
    ],
    "metadata": {
      "totalRows": 1,
      "detectedFormat": "structured_table",
      "confidence": 0.95,
      "ambiguousRows": [],
      "errors": [],
      "originalFileName": "results.pdf",
      "processedAt": "2025-07-01T10:30:00.000Z",
      "extractionMethod": "structured"
    }
  }
}
```

## Usage

### API Endpoint
```
POST /api/result/reconstruct-table
```

**Headers:**
- Content-Type: multipart/form-data
- Cookie: token (JWT authentication required)

**Body:**
- `resultPDF`: PDF file (max 10MB)

### Frontend Integration
The feature is accessible through the dashboard's "Table Reconstruct" tab, providing:
- Drag-and-drop file upload
- Real-time processing feedback
- Interactive table preview
- Download options (JSON/CSV)
- Error and ambiguity reporting

## Technical Implementation

### Backend Components

#### 1. Table Reconstruction Engine
- `reconstructTabularData()`: Main orchestration function
- `extractFromStructuredTables()`: Processes pdf2json table data
- `extractFromTextContent()`: Fallback text analysis
- `calculateTableConsistency()`: Evaluates table structure quality

#### 2. Header Detection
- `parseHeaderLine()`: Extracts headers from delimiter-separated text
- `detectDefaultHeaders()`: Infers headers from data patterns
- `cleanHeaderText()`: Standardizes header formatting

#### 3. Data Parsing
- `parseDataLine()`: Converts text lines to structured data
- `intelligentColumnMapping()`: Maps data to appropriate columns
- Pattern-based content recognition (roll numbers, names, grades)

#### 4. Quality Assessment
- Confidence scoring based on successful parsing rate
- Ambiguous row detection and flagging
- Error collection and reporting

### Frontend Components

#### TableReconstructor.jsx
- **File Upload**: Drag-and-drop interface with validation
- **Processing Display**: Real-time status and progress indicators
- **Results Visualization**: 
  - Metadata summary (rows, confidence, format)
  - Interactive table preview
  - Download buttons (JSON/CSV)
- **Error Handling**: Displays ambiguous rows and processing errors

## Supported Formats

### Input
- PDF files up to 10MB
- Both image-based and text-based PDFs
- Various table layouts and formats

### Detected Column Types
- **Roll Numbers**: Numeric student IDs (e.g., 12345, REG001)
- **Names**: Student names with proper case handling
- **Marks/Grades**: Numeric scores or letter grades (A, B+, etc.)
- **Subjects**: Course or subject names
- **Semesters**: Semester/year information
- **Batches**: Class or batch identifiers

### Output
- **JSON**: Structured data with metadata
- **CSV**: Comma-separated values for spreadsheet import
- **Preview**: Interactive table in the browser

## Error Handling

### Confidence Levels
- **High (≥80%)**: Green indicator, reliable extraction
- **Medium (60-79%)**: Yellow indicator, good quality with minor issues
- **Low (<60%)**: Red indicator, manual review recommended

### Ambiguous Row Detection
Rows flagged for manual review when:
- Column count doesn't match headers
- Content patterns don't match expected types
- Low confidence in data mapping

### Common Issues and Solutions
1. **Poor PDF Quality**: Falls back to OCR processing
2. **Complex Layouts**: Uses text analysis with pattern recognition
3. **Missing Headers**: Infers headers from data patterns
4. **Inconsistent Formatting**: Applies intelligent column mapping

## Authentication & Security

- **JWT Authentication**: All endpoints require valid authentication
- **File Validation**: Only PDF files accepted
- **Size Limits**: 10MB maximum file size
- **Temporary Storage**: Files automatically deleted after processing
- **Timeout Handling**: Database operations have appropriate timeouts

## Performance Considerations

- **Processing Time**: Varies by PDF complexity (typically 2-10 seconds)
- **Memory Usage**: Optimized for large documents
- **Concurrent Processing**: Handles multiple users simultaneously
- **Error Recovery**: Graceful degradation with multiple fallback methods

## Future Enhancements

1. **Template Learning**: Learn from user corrections to improve accuracy
2. **Batch Processing**: Process multiple PDFs simultaneously
3. **Custom Headers**: Allow users to define custom column mappings
4. **Export Formats**: Add Excel, XML, and other export options
5. **Preview Modes**: Different visualization options for complex tables

## Troubleshooting

### Common Issues

**1. Low Confidence Scores**
- Check PDF quality and clarity
- Verify table structure is consistent
- Review ambiguous rows for patterns

**2. Missing Headers**
- Ensure first row contains header information
- Check for merged cells or complex layouts
- Review detected format in metadata

**3. Incorrect Data Mapping**
- Examine the raw extracted text
- Check for unusual formatting or characters
- Use the test feature to debug extraction

### Debug Information
The metadata includes detailed information for troubleshooting:
- Extraction method used
- Processing confidence
- Identified errors and ambiguities
- Raw table data for inspection

## API Reference

### Request Example
```bash
curl -X POST http://localhost:8080/api/result/reconstruct-table \
  -H "Cookie: token=your_jwt_token" \
  -F "resultPDF=@path/to/results.pdf"
```

### Success Response
```json
{
  "success": true,
  "data": {
    "headers": ["Roll No", "Name", "Subject", "Marks"],
    "rows": [...],
    "metadata": {...}
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Unable to extract readable content from PDF",
  "error": "Detailed error message"
}
```

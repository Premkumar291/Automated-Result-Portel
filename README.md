# Automated College Result Portal

## Overview
The Automated College Result Portal is a web application for analyzing and visualizing academic performance data from PDF result documents. It provides a comprehensive dashboard for understanding student performance across subjects.

## Features
- PDF upload and semester-wise splitting
- Automatic text extraction and data parsing
- Enhanced PDF analysis using PDF.co API
- Interactive result analysis dashboard
- Subject-wise performance visualization
- Student selection for targeted analysis

## New Feature: PDF.co Integration
The application now includes integration with the PDF.co API for enhanced PDF text extraction and table recognition, which significantly improves the accuracy of result data extraction, especially for complex PDF layouts and scanned documents.

### Benefits of PDF.co Integration
- Improved text extraction accuracy
- Better table structure recognition
- Enhanced handling of complex PDF layouts
- More reliable extraction of student data and grades

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- PDF.co API key

### Environment Variables
Create or update the `.env` file in the backend directory with the following variables:

```
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
NODE_ENV=development
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# PDF.co API Configuration
PDFCO_API_KEY=your_pdfco_api_key
```

### Installation

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Usage

### Enhanced PDF Analysis
The application uses PDF.co for enhanced PDF analysis:

**Enhanced Analysis (PDF.co)**: Uses the PDF.co API for improved text extraction and table recognition. This provides superior results for complex PDFs, scanned documents, and ensures accurate data extraction.

### Workflow
1. Upload a PDF result document
2. Select a semester PDF to analyze
3. Select a starting student for analysis
4. View the comprehensive performance dashboard
# Automated College Result Portal
## API Endpoints
### PDF Analysis

- `GET /api/analyze/upload/:id` - Analyze PDF using PDF.co enhanced method

The endpoint supports an optional `page` query parameter for analyzing specific pages.

## Technologies Used
- **Frontend**: React, Recharts, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB with GridFS for PDF storage
- **PDF Processing**: pdf-lib, pdf-parse, PDF.co API
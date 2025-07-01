import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 8080;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

// Simple upload configuration
const upload = multer({
  dest: './uploads/test-uploads',
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Create upload directory
const uploadDir = './uploads/test-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Test API route
app.get('/api/processed-results/test', (req, res) => {
  res.json({ 
    message: 'Processed results API is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple upload test route
app.post('/api/processed-results/upload-extract', upload.single('pdfFile'), (req, res) => {
  console.log('Upload request received');
  console.log('File:', req.file);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Clean up test file
  try {
    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error('Error cleaning up file:', err);
  }

  res.json({
    success: true,
    message: 'Test upload successful - backend is working!',
    data: {
      extractedData: {
        headers: ['Test Column 1', 'Test Column 2'],
        rows: [['Test Data 1', 'Test Data 2']],
        metadata: {
          extractionMethod: 'test-mode',
          confidence: 1.0,
          totalRows: 1
        }
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`🚀 Test Backend Server is running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/processed-results/test`);
  console.log(`==============================================`);
});

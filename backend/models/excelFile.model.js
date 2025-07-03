import mongoose from 'mongoose';

const excelFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalPdfName: {
    type: String,
    required: true
  },
  analysisData: {
    type: Object,
    default: {}
  },
  studentCount: {
    type: Number,
    default: 0
  },
  subjectCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
excelFileSchema.index({ userId: 1, semester: 1 });
excelFileSchema.index({ createdAt: -1 });

export const ExcelFile = mongoose.model('ExcelFile', excelFileSchema);

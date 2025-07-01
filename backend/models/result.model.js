import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  // Course Information
  course: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  regulation: {
    type: String,
    required: true,
    trim: true
  },
  
  // Student Information
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Result Information
  marks: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Absent', 'Pending'],
    default: 'Pending'
  },
  
  // Upload Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // PDF Information
  originalFileName: {
    type: String,
    required: true
  },
  processingStatus: {
    type: String,
    enum: ['Processing', 'Completed', 'Failed'],
    default: 'Processing'
  }
}, {
  timestamps: true
});

// Compound index for duplicate detection
resultSchema.index({ 
  course: 1, 
  subject: 1, 
  semester: 1, 
  batch: 1,
  rollNumber: 1 
}, { unique: true });

// Index for efficient queries
resultSchema.index({ uploadedBy: 1, uploadDate: -1 });
resultSchema.index({ course: 1, semester: 1, batch: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result;

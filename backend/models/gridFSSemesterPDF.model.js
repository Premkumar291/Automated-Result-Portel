import mongoose from 'mongoose';

// This model is used to store metadata about semester PDFs stored in GridFS
const gridFSSemesterPDFSchema = new mongoose.Schema({
  // Original upload name (usually the filename of the uploaded PDF)
  uploadName: { 
    type: String, 
    required: true,
    index: true // Index for faster queries
  },
  // Semester number (1-8)
  semester: { 
    type: Number, 
    required: true,
    min: 1,
    max: 8
  },
  // Reference to the file stored in GridFS
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  // Filename in GridFS
  filename: { 
    type: String, 
    required: true 
  },
  // Upload date
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  // Auto-delete time
  deleteAt: { 
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for common queries
gridFSSemesterPDFSchema.index({ uploadName: 1, semester: 1 }, { unique: true });
gridFSSemesterPDFSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('GridFSSemesterPDF', gridFSSemesterPDFSchema);
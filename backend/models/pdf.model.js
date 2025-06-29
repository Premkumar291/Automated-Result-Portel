import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema({
  // Basic PDF information
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  
  // File metadata
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    default: 'application/pdf'
  },
  
  // PDF content (stored as Buffer for binary data)
  fileData: {
    type: Buffer,
    required: true
  },
  
  // User association
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Upload metadata
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  // Analysis results (stored when PDF is analyzed)
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  gradeAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Analysis metadata
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  lastAnalyzed: {
    type: Date,
    default: null
  },
  
  // Statistics for quick access
  statistics: {
    totalSubjects: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    averagePassRate: { type: Number, default: 0 },
    overallPassRate: { type: Number, default: 0 }
  },
  
  // Status and flags
  status: {
    type: String,
    enum: ['uploaded', 'analyzing', 'analyzed', 'error'],
    default: 'uploaded'
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better query performance
pdfSchema.index({ uploadedBy: 1, uploadDate: -1 });
pdfSchema.index({ uploadedBy: 1, filename: 1 });

// Virtual for file size formatting
pdfSchema.virtual('formattedSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to update analysis results
pdfSchema.methods.updateAnalysis = function(extractedData, gradeAnalysis) {
  this.extractedData = extractedData;
  this.gradeAnalysis = gradeAnalysis;
  this.isAnalyzed = true;
  this.lastAnalyzed = new Date();
  this.status = gradeAnalysis.success ? 'analyzed' : 'error';
  
  if (gradeAnalysis.success && gradeAnalysis.overallStats) {
    this.statistics = {
      totalSubjects: gradeAnalysis.overallStats.totalSubjects || 0,
      totalStudents: gradeAnalysis.overallStats.totalStudents || 0,
      averagePassRate: gradeAnalysis.overallStats.averagePassRate || 0,
      overallPassRate: gradeAnalysis.overallStats.overallPassRate || 0
    };
  }
  
  if (!gradeAnalysis.success) {
    this.errorMessage = gradeAnalysis.error || 'Analysis failed';
  }
  
  return this.save();
};

// Method to update filename/description
pdfSchema.methods.updateInfo = function(filename, description) {
  if (filename) this.filename = filename;
  if (description !== undefined) this.description = description;
  this.lastModified = new Date();
  return this.save();
};

// Static method to find user's PDFs
pdfSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ uploadedBy: userId });
  
  if (options.analyzed !== undefined) {
    query.where('isAnalyzed').equals(options.analyzed);
  }
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  return query.sort({ uploadDate: -1 });
};

const PDF = mongoose.model('PDF', pdfSchema);

export default PDF;

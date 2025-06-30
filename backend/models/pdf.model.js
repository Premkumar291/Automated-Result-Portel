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
  
  // Storage and Processing metadata
  isStored: {
    type: Boolean,
    default: false // Initially not stored in database
  },
  isProcessed: {
    type: Boolean,
    default: false // Renamed from isAnalyzed for better clarity
  },
  isAnalyzed: {
    type: Boolean,
    default: false // Keep for backward compatibility
  },
  lastAnalyzed: {
    type: Date,
    default: null
  },
  lastProcessed: {
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
    enum: ['uploaded', 'processing', 'processed', 'analyzing', 'analyzed', 'error'],
    default: 'uploaded'
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
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
pdfSchema.index({ uploadedBy: 1, isStored: 1 });
pdfSchema.index({ uploadedBy: 1, isProcessed: 1 });
pdfSchema.index({ uploadedBy: 1, status: 1 });
pdfSchema.index({ uploadedBy: 1, processingStatus: 1 });

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
  this.isProcessed = true;
  this.lastAnalyzed = new Date();
  this.lastProcessed = new Date();
  this.status = gradeAnalysis.success ? 'analyzed' : 'error';
  this.processingStatus = gradeAnalysis.success ? 'completed' : 'failed';
  
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

// Method to mark PDF as stored in database
pdfSchema.methods.markAsStored = function() {
  this.isStored = true;
  this.lastModified = new Date();
  return this.save();
};

// Method to update processing status
pdfSchema.methods.updateProcessingStatus = function(status, errorMessage = null) {
  this.processingStatus = status;
  this.lastProcessed = new Date();
  
  if (status === 'processing') {
    this.status = 'processing';
  } else if (status === 'completed') {
    this.status = 'processed';
    this.isProcessed = true;
  } else if (status === 'failed') {
    this.status = 'error';
    this.errorMessage = errorMessage || 'Processing failed';
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
  
  if (options.processed !== undefined) {
    query.where('isProcessed').equals(options.processed);
  }
  
  if (options.stored !== undefined) {
    query.where('isStored').equals(options.stored);
  }
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.processingStatus) {
    query.where('processingStatus').equals(options.processingStatus);
  }
  
  return query.sort({ uploadDate: -1 });
};

// Static method to find stored PDFs only
pdfSchema.statics.findStoredByUser = function(userId) {
  return this.find({ 
    uploadedBy: userId, 
    isStored: true 
  }).sort({ uploadDate: -1 });
};

// Static method to get PDF statistics for user
pdfSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { uploadedBy: mongoose.Types.ObjectId(userId), isStored: true } },
    {
      $group: {
        _id: null,
        totalPDFs: { $sum: 1 },
        processedPDFs: { $sum: { $cond: ['$isProcessed', 1, 0] } },
        analyzedPDFs: { $sum: { $cond: ['$isAnalyzed', 1, 0] } },
        totalSize: { $sum: '$fileSize' }
      }
    }
  ]);
};

const PDF = mongoose.model('PDF', pdfSchema);

export default PDF;
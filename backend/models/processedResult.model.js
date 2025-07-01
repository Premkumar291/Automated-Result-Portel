import mongoose from 'mongoose';

const processedResultSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  headers: [{
    type: String,
    required: true
  }],
  rows: [{
    type: mongoose.Schema.Types.Mixed, // Dynamic object structure
    required: true
  }],
  metadata: {
    extractionMethod: {
      type: String,
      enum: ['pdf2json', 'ocr', 'mixed'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    totalRows: {
      type: Number,
      required: true,
      min: 0
    },
    pageCount: {
      type: Number,
      default: 1
    },
    issues: [{
      type: String
    }]
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processingStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  }
}, {
  timestamps: true,
  // Index for efficient queries
  collection: 'processedresults'
});

// Indexes for better query performance
processedResultSchema.index({ uploadedBy: 1, uploadedAt: -1 });
processedResultSchema.index({ fileName: 1, uploadedBy: 1 });
processedResultSchema.index({ processingStatus: 1 });

// Virtual for row count
processedResultSchema.virtual('rowCount').get(function() {
  return this.rows ? this.rows.length : 0;
});

// Ensure virtuals are included in JSON
processedResultSchema.set('toJSON', { virtuals: true });

const ProcessedResult = mongoose.model('ProcessedResult', processedResultSchema);

export default ProcessedResult;

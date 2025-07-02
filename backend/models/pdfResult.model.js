import mongoose from 'mongoose';

// Schema for individual subject results
const subjectResultSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  grade: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  marks: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, { _id: false });

// Schema for processed PDF results
const pdfResultSchema = new mongoose.Schema({
  // Student Information
  reg_no: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  
  // Academic Information
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['arrear', 'current'],
    lowercase: true,
    index: true
  },
  
  // Subject Results
  subjects: [subjectResultSchema],
  
  // PDF Processing Information
  originalFileName: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processingDate: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  batch: {
    type: String,
    trim: true
  },
  regulation: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
pdfResultSchema.index({ 
  reg_no: 1, 
  semester: 1, 
  type: 1 
}, { unique: true });

pdfResultSchema.index({ uploadedBy: 1, processingDate: -1 });
pdfResultSchema.index({ semester: 1, type: 1 });
pdfResultSchema.index({ originalFileName: 1 });

// Instance methods
pdfResultSchema.methods.getSubjectCount = function() {
  return this.subjects.length;
};

pdfResultSchema.methods.getPassedSubjects = function() {
  const passingGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P'];
  return this.subjects.filter(subject => 
    passingGrades.includes(subject.grade.toUpperCase())
  );
};

pdfResultSchema.methods.getFailedSubjects = function() {
  const failingGrades = ['RA', 'AB', 'F', 'U'];
  return this.subjects.filter(subject => 
    failingGrades.includes(subject.grade.toUpperCase())
  );
};

// Static methods
pdfResultSchema.statics.findByRegNo = function(regNo) {
  return this.find({ reg_no: regNo.toUpperCase() }).sort({ semester: 1, type: 1 });
};

pdfResultSchema.statics.findBySemester = function(semester, type = null) {
  const query = { semester };
  if (type) query.type = type;
  return this.find(query).sort({ reg_no: 1 });
};

pdfResultSchema.statics.getResultStatistics = async function(semester) {
  return this.aggregate([
    { $match: { semester } },
    {
      $group: {
        _id: '$type',
        totalStudents: { $sum: 1 },
        avgSubjects: { $avg: { $size: '$subjects' } }
      }
    }
  ]);
};

const PdfResult = mongoose.model('PdfResult', pdfResultSchema);

export default PdfResult;

import mongoose from "mongoose";

const reportTemplateSchema = new mongoose.Schema(
  {
    // Faculty information
    facultyName: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Semester and academic information
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "others"],
    },
    
    // Result data reference
    analysisDataId: {
      type: String,
      required: [true, "Analysis data ID is required"],
    },
    
    // Generated file information
    pdfPath: {
      type: String,
      required: false
    },
    excelPath: {
      type: String,
      required: false
    },
    fileType: {
      type: String,
      enum: ['pdf', 'excel'],
      default: 'pdf'
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    
    // Additional metadata
    totalStudents: {
      type: Number,
      required: true,
    },
    totalSubjects: {
      type: Number,
      required: true,
    },
    overallPassPercentage: {
      type: Number,
      required: true,
    },
    
    // Subject-wise results for quick access
    subjectResults: [{
      subjectCode: String,
      subjectName: String,
      passPercentage: Number,
      totalStudents: Number,
      passedStudents: Number,
    }],
    
    // Students data
    studentsData: [{
      regNo: String,
      name: String,
      grades: mongoose.Schema.Types.Mixed,
    }],
    
    // Faculty assignments per subject (for institutional reports)
    facultyAssignments: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Report type
    reportType: {
      type: String,
      enum: ["standard", "enhanced", "institutional"],
      default: "standard",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
reportTemplateSchema.index({ facultyId: 1, semester: 1, academicYear: 1 });
reportTemplateSchema.index({ status: 1 });
reportTemplateSchema.index({ createdAt: -1 });

export const ReportTemplate = mongoose.model("ReportTemplate", reportTemplateSchema);

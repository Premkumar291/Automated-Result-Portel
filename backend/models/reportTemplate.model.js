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
    
    // Generated PDF information
    pdfPath: {
      type: String,
    },
    generatedAt: {
      type: Date,
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

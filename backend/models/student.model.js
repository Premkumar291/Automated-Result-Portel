import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true],
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true],
      unique: true,
      uppercase: true,
    },
    typeOfAdmission: {
      type: String,
      required: [true],
      enum: {
        values: ["COUNSELLING", "MANAGEMENT"],
      },
      trim: true,
    },
    modeOfAdmission: {
      type: String,
      enum: {
        values: ["DIRECT"],
      },
    },
    mediumOfInstruction: {
      type: String,
      enum: {
        values: ["ENGLISH", "TAMIL"],
      },
    },
    registerNumber: {
      type: String,
      required: [true],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true],
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["MALE", "FEMALE", "OTHER"],
      },
    },
    fatherName: {
      type: String,
    },
    motherName: {
      type: String,
    },
    community: {
      type: String,
    },
    aadaarNumber: {
      type: String,
      unique: true,
      required: [true],
    },
    department: {
      type: String,
      required: [true],
      trim: true,
      enum: {
        values: ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS"],
    
      },
    },
    joiningYear: {
      type: Number,
      required: [true],
      max: [
        new Date().getFullYear() + 1,
        "Joining year cannot be in the future",
      ],
    },
    passOutYear: {
      type: Number,
      required: [true],
    },
    dateOfBirth: {
      type: Date,
      required: [true],
    },
    mobileNumber: {
      type: String,
      required: [true],
      unique: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit mobile number"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to validate pass out year
studentSchema.pre("save", function (next) {
  if (this.passOutYear <= this.joiningYear) {
    return next(new Error("Pass out year must be after joining year"));
  }
  next();
});

// Indexes for better query performance - focused on department and name search
studentSchema.index({ department: 1 });
studentSchema.index({ name: "text" });
studentSchema.index({ registerNumber: 1 });

export const Student = mongoose.model("Student", studentSchema);

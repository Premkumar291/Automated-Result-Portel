import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    registerNumber: { 
        type: String, 
        required: [true, 'Register number is required'], 
        unique: true,
        uppercase: true,
        trim: true
    },
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    department: { 
        type: String, 
        required: [true, 'Department is required'],
        trim: true,
        enum: {
            values: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS'],
            message: 'Department must be one of: CSE, ECE, EEE, MECH, CIVIL, IT, AIDS'
        }
    },
    joiningYear: { 
        type: Number, 
        required: [true, 'Joining year is required'],
        min: [2000, 'Joining year must be after 2000'],
        max: [new Date().getFullYear() + 1, 'Joining year cannot be in the future']
    },
    passOutYear: { 
        type: Number, 
        required: [true, 'Pass out year is required'],
        min: [2000, 'Pass out year must be after 2000']
    },
    dateOfBirth: { 
        type: Date, 
        required: [true, 'Date of birth is required']
    },
    mobileNumber: { 
        type: String, 
        required: [true, 'Mobile number is required'], 
        unique: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
    }
}, { 
    timestamps: true
});

// Pre-save middleware to validate pass out year
studentSchema.pre('save', function(next) {
    if (this.passOutYear <= this.joiningYear) {
        return next(new Error('Pass out year must be after joining year'));
    }
    next();
});

// Indexes for better query performance - focused on department and name search
studentSchema.index({ department: 1 });
studentSchema.index({ name: 'text' });
studentSchema.index({ registerNumber: 1 });

export const Student = mongoose.model('Student', studentSchema);

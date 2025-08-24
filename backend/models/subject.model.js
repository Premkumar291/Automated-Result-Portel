import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{2,4}\d{3,4}[A-Z]?$/, 'Subject code must be in format like CS101, MATH201, etc.']
    },
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSBS', 'OTHER']
    },
    semester: {
        type: Number,
        required: false,
        min: 1,
        max: 8
    },
    credits: {
        type: Number,
        required: false,
        min: 1,
        max: 6
    },
    subjectType: {
        type: String,
        enum: ['Theory', 'Practical', 'Lab', 'Project'],
        default: 'Theory'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
subjectSchema.index({ subjectCode: 1 });
subjectSchema.index({ department: 1 });
subjectSchema.index({ subjectName: 1 });

// Virtual for full subject display
subjectSchema.virtual('displayName').get(function() {
    return `${this.subjectCode} - ${this.subjectName}`;
});

// Static method to find subjects by department
subjectSchema.statics.findByDepartment = function(department) {
    return this.find({ department: department.toUpperCase(), isActive: true });
};

// Static method to search subjects
subjectSchema.statics.searchSubjects = function(searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find({
        $or: [
            { subjectCode: regex },
            { subjectName: regex }
        ],
        isActive: true
    });
};

export const Subject = mongoose.model('Subject', subjectSchema);

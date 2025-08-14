import mongoose from 'mongoose';

const studySchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
        enum: ['PhD', 'M.Tech', 'M.E', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 'B.Tech', 'B.E', 'B.Sc', 'B.A', 'B.Com', 'BCA', 'Diploma', 'Other']
    },
    specialization: {
        type: String,
        required: false,
        trim: true
    },
    institution: {
        type: String,
        required: false,
        trim: true
    },
    year: {
        type: Number,
        required: false,
        min: 1950,
        max: new Date().getFullYear()
    }
});

const facultySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum: ['Dr.', 'Prof.', 'Asst. Prof.', 'Assoc. Prof.', 'Mr.', 'Ms.', 'Mrs.']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    initials: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true // Allow multiple null values
    },
    department: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSBS', 'OTHER']
    },
    studies: [studySchema],
    employeeId: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        sparse: true
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    dateOfJoining: {
        type: Date,
        required: false
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
facultySchema.index({ name: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ email: 1 });
facultySchema.index({ employeeId: 1 });

// Virtual for full name display
facultySchema.virtual('fullName').get(function() {
    return `${this.title} ${this.name}`;
});

// Virtual for display name with initials
facultySchema.virtual('displayName').get(function() {
    return `${this.title} ${this.name} (${this.initials})`;
});

// Method to add study
facultySchema.methods.addStudy = function(studyData) {
    this.studies.push(studyData);
    return this.save();
};

// Method to remove study
facultySchema.methods.removeStudy = function(studyId) {
    this.studies.id(studyId).remove();
    return this.save();
};

// Static method to find faculty by department
facultySchema.statics.findByDepartment = function(department) {
    return this.find({ department: department.toUpperCase(), isActive: true });
};

// Static method to search faculty
facultySchema.statics.searchFaculty = function(searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find({
        $or: [
            { name: regex },
            { initials: regex },
            { email: regex },
            { employeeId: regex }
        ],
        isActive: true
    });
};

export const Faculty = mongoose.model('Faculty', facultySchema);

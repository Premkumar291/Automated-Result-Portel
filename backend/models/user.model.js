import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    // College name field for admin and faculty users
    collegeName: {
        type: String,
        required: function () { return this.role === 'admin'; }, // Required only for admin users
        trim: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['faculty', 'admin'],
        required: true
    },
    // Admin management fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, { timestamps: true });

// Add a pre-save hook to log the data being saved
userSchema.pre('save', function (next) {
    console.log('Saving user with data:', {
        email: this.email,
        name: this.name,
        department: this.department,
        collegeName: this.collegeName,
        role: this.role,
        createdBy: this.createdBy
    });
    next();
});

// Indexes for admin queries
userSchema.index({ createdBy: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware for basic validation
userSchema.pre('save', async function (next) {
    try {
        // If user is an admin, collegeName is required
        if (this.role === 'admin' && !this.collegeName) {
            next(new Error('College name is required for admin users'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to get users created by an admin
userSchema.statics.getUsersCreatedBy = function (adminId) {
    return this.find({
        createdBy: adminId
    }).populate('createdBy');
};

// Method to check if user can see another user (only users they created)
// Method removed: canSeeUser was incorrect and is now handled by hierarchyUtils.js

// Method to get the college name for a user (from themselves if admin, or from their creator if faculty)
userSchema.methods.getCollegeName = async function () {
    console.log('Getting college name for user:', {
        userId: this._id,
        role: this.role,
        collegeName: this.collegeName,
        createdBy: this.createdBy
    });

    if (this.role === 'admin') {
        console.log('User is admin, returning collegeName:', this.collegeName);
        return this.collegeName;
    } else if (this.role === 'faculty' && this.createdBy) {
        // For faculty, get the college name from the admin who created them
        console.log('User is faculty, looking up creator:', this.createdBy);
        try {
            const creator = await this.constructor.findById(this.createdBy);
            console.log('Creator found:', creator);
            if (creator && creator.role === 'admin') {
                console.log('Creator is admin, returning collegeName:', creator.collegeName);
                return creator.collegeName;
            } else {
                console.log('Creator is not an admin or not found');
            }
        } catch (error) {
            console.error('Error looking up creator:', error);
        }
    }
    console.log('No college name found, returning null');
    return null;
};

export const User = mongoose.model('User', userSchema);
import { User } from '../../models/user.model.js';
import { Faculty } from '../../models/faculty.model.js';
import { getVisibleUsersForAdmin, getAdminData, getAdminStats, canCreateAdmin } from '../../utils/hierarchyUtils.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js';
import { generateVerificationCode } from '../../utils/generateVerificationCode.js';

/**
 * Controller for hierarchical admin management
 */

/**
 * Create an admin
 */
export const createAdmin = async (req, res) => {
    try {
        const { email, password, name, department } = req.body;
        const creatorId = req.userId || req.user?.userId || req.user?._id;


        // Validate required fields
        if (!email || !password || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate creatorId
        if (!creatorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required - creator ID not found"
            });
        }

        // Validate creatorId is a valid ObjectId
        if (!creatorId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid creator ID format"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Get creator admin
        const creator = await User.findById(creatorId);
        if (!creator || creator.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admins can create sub-admins"
            });
        }

        // Get the college name from the creator admin
        const collegeName = await creator.getCollegeName();
        if (!collegeName) {
            return res.status(400).json({
                success: false,
                message: "Admin does not have a college name assigned"
            });
        }

        // Check if creator can create admin
        const canCreate = await canCreateAdmin(creatorId);
        if (!canCreate.canCreate) {
            return res.status(403).json({
                success: false,
                message: canCreate.reason
            });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Generate verification code
        const verificationToken = generateVerificationCode();

        // Create admin
        const newAdmin = new User({
            email,
            password: hashedPassword,
            name,
            department,
            collegeName: collegeName, // Inherit college name from creator admin
            role: 'admin',
            createdBy: creatorId,
            isVerified: false, // Users must verify their email
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        await newAdmin.save();

        // Remove password from response
        const { password: _, ...adminData } = newAdmin.toObject();

        res.status(201).json({
            success: true,
            message: "Admin account created successfully. User will receive verification code when they login for the first time.",
            admin: adminData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Create a faculty user account
 */
export const createFacultyUser = async (req, res) => {
    try {
        const { email, password, name, department } = req.body;
        const creatorId = req.userId || req.user?.userId || req.user?._id;

        // Validate required fields
        if (!email || !password || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate creatorId
        if (!creatorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required - creator ID not found"
            });
        }

        // Validate creatorId is a valid ObjectId
        if (!creatorId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid creator ID format"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Get creator admin
        const creator = await User.findById(creatorId);
        if (!creator || creator.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admins can create faculty accounts"
            });
        }

        // Get the college name from the admin creator
        const collegeName = await creator.getCollegeName();
        if (!collegeName) {
            return res.status(400).json({
                success: false,
                message: "Admin does not have a college name assigned"
            });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Generate verification code
        const verificationToken = generateVerificationCode();

        // Create faculty user with college name inherited from admin
        const newFacultyUser = new User({
            email,
            password: hashedPassword,
            name,
            department,
            collegeName: collegeName, // Inherit college name from admin
            role: 'faculty',
            createdBy: creatorId,
            isVerified: false, // Users must verify their email
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        await newFacultyUser.save();

        // Don't send verification email during creation
        // Email will be sent when user tries to login or clicks resend

        // Remove password from response
        const { password: _, ...facultyData } = newFacultyUser.toObject();

        res.status(201).json({
            success: true,
            message: "Faculty account created successfully. User will receive verification code when they first login.",
            faculty: facultyData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get admin data and their created users
 */
export const getAdminInfo = async (req, res) => {
    try {
        const adminId = req.user.userId;

        const adminData = await getAdminData(adminId);

        // Get created faculty separately (faculty users are stored in User model)
        const createdFaculty = await User.find({
            createdBy: adminId,
            role: 'faculty'
        })
            .select('name email department collegeName createdAt')
            .sort({ createdAt: -1 });

        // Add faculty to the response
        adminData.createdFaculty = createdFaculty;

        res.status(200).json({
            success: true,
            message: "Admin data retrieved successfully",
            data: adminData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get users created by current admin
 */
export const getCreatedUsers = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { type } = req.query; // 'admins', 'faculty', 'users', or 'all'

        const createdUsers = await getVisibleUsersForAdmin(adminId);

        let responseData = {};

        if (type === 'admins' || !type) {
            responseData.admins = createdUsers.admins;
        }

        if (type === 'faculty' || !type) {
            responseData.faculty = createdUsers.faculty;
        }

        if (type === 'users' || !type) {
            responseData.users = createdUsers.users;
        }

        if (!type) {
            responseData = createdUsers;
        }

        res.status(200).json({
            success: true,
            message: "Created users retrieved successfully",
            data: responseData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get admin statistics
 */
export const getAdminStatistics = async (req, res) => {
    try {
        const adminId = req.user.userId;

        const stats = await getAdminStats(adminId);

        res.status(200).json({
            success: true,
            message: "Admin statistics retrieved successfully",
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Update admin information
 */
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, email } = req.body;
        const adminId = req.user.userId;

        // Find the admin
        const targetAdmin = await User.findById(id);
        if (!targetAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Check if current admin can modify this admin (only if they created them)
        const canModify = targetAdmin.createdBy?.equals(adminId);

        if (!canModify) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this admin"
            });
        }

        // Update fields
        if (name) targetAdmin.name = name;
        if (department) targetAdmin.department = department;
        if (email && email !== targetAdmin.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
            targetAdmin.email = email;
        }

        await targetAdmin.save();

        // Remove password from response
        const { password: _, ...adminData } = targetAdmin.toObject();

        res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            admin: adminData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        // Find the admin
        const targetAdmin = await User.findById(id);
        if (!targetAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Check if current admin can delete this admin (only if they created them)
        const canDelete = targetAdmin.createdBy?.equals(adminId);

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this admin"
            });
        }

        // Check if admin has created users
        const createdUsers = await User.countDocuments({ createdBy: id });
        // Faculty users are stored in User model, not Faculty model
        const createdFaculty = await User.countDocuments({
            createdBy: id,
            role: 'faculty'
        });

        if (createdUsers > 0 || createdFaculty > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete admin who has created ${createdUsers} users and ${createdFaculty} faculty members. Please reassign or delete them first.`
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Admin deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Delete faculty user
 */
export const deleteFacultyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        // Find the faculty user
        const facultyUser = await User.findById(id);
        if (!facultyUser) {
            return res.status(404).json({
                success: false,
                message: "Faculty user not found"
            });
        }

        // Check if the faculty user has the correct role
        if (facultyUser.role !== 'faculty') {
            return res.status(400).json({
                success: false,
                message: "User is not a faculty member"
            });
        }

        // Check if current admin created this faculty user
        const canDelete = facultyUser.createdBy?.equals(adminId);

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this faculty user"
            });
        }

        // Delete the faculty user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Faculty user deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get admin creation status
 */
export const getAdminCreationStatus = async (req, res) => {
    try {
        const adminId = req.user.userId;

        const canCreateStatus = await canCreateAdmin(adminId);
        const admin = await User.findById(adminId);
        const createdAdminCount = await User.countDocuments({
            createdBy: adminId,
            role: 'admin'
        });

        res.status(200).json({
            success: true,
            message: "Admin creation status retrieved",
            data: {
                canCreate: canCreateStatus.canCreate,
                reason: canCreateStatus.reason,
                currentCreatedAdmins: createdAdminCount,
                adminName: admin.name,
                adminEmail: admin.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

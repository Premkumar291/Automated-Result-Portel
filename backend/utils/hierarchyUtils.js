import { User } from '../models/user.model.js';

/**
 * Hierarchy utility functions for admin visibility and permission management
 */

/**
 * Get all users (admins and faculty) visible to a specific admin
 * @param {string} adminId - The admin's ObjectId
 * @returns {Object} Object containing visible admins and faculty
 */
export const getVisibleUsersForAdmin = async (adminId) => {
    try {
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            throw new Error('Invalid admin');
        }

        // Get users created by this admin only
        const visibleUsers = await User.find({
            createdBy: adminId
        }).populate('createdBy', 'name email role');

        // Separate admins and faculty
        const visibleAdmins = visibleUsers.filter(user => user.role === 'admin');
        const visibleFacultyUsers = visibleUsers.filter(user => user.role === 'faculty');

        return {
            admins: visibleAdmins,
            faculty: visibleFacultyUsers, // Faculty users are stored in User model
            users: visibleFacultyUsers
        };
    } catch (error) {
        throw new Error(`Error getting visible users: ${error.message}`);
    }
};

/**
 * Check if an admin can see a specific user
 * @param {string} adminId - The admin's ObjectId
 * @param {string} targetUserId - The target user's ObjectId
 * @returns {boolean} True if admin can see the user
 */
export const canAdminSeeUser = async (adminId, targetUserId) => {
    try {
        const admin = await User.findById(adminId);
        const targetUser = await User.findById(targetUserId);

        if (!admin || !targetUser || admin.role !== 'admin') {
            return false;
        }

        // Admin can see themselves
        if (adminId === targetUserId) {
            return true;
        }

        // Can only see users they created directly
        if (targetUser.createdBy && targetUser.createdBy.equals(adminId)) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};

/**
 * Check if an admin can see a specific faculty member
 * @param {string} adminId - The admin's ObjectId
 * @param {string} facultyId - The faculty's ObjectId
 * @returns {boolean} True if admin can see the faculty
 */
export const canAdminSeeFaculty = async (adminId, facultyId) => {
    try {
        const admin = await User.findById(adminId);
        const faculty = await User.findById(facultyId);

        if (!admin || !faculty || admin.role !== 'admin' || faculty.role !== 'faculty') {
            return false;
        }

        // Can only see faculty they created directly
        if (faculty.createdBy && faculty.createdBy.equals(adminId)) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};

/**
 * Check if an admin can create another admin
 * @param {string} adminId - The admin's ObjectId
 * @returns {Object} Object with canCreate boolean and reason
 */
export const canCreateAdmin = async (adminId) => {
    try {
        const admin = await User.findById(adminId);

        if (!admin || admin.role !== 'admin') {
            return { canCreate: false, reason: 'Invalid admin' };
        }

        // All admins can create other admins (no restrictions)
        return { canCreate: true, reason: 'Can create admin' };
    } catch (error) {
        return { canCreate: false, reason: `Error: ${error.message}` };
    }
};

/**
 * Get admin data and their created users
 * @param {string} adminId - The admin's ObjectId
 * @returns {Object} Admin data with created users
 */
export const getAdminData = async (adminId) => {
    try {
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            throw new Error('Invalid admin');
        }

        // Get all visible users
        const { admins, faculty, users } = await getVisibleUsersForAdmin(adminId);

        return {
            currentAdmin: admin,
            createdAdmins: admins,
            createdFaculty: faculty, // Faculty users are stored in User model
            createdUsers: users,
            totalCreatedAdmins: admins.length,
            totalCreatedFaculty: faculty.length,
            totalCreatedUsers: users.length
        };
    } catch (error) {
        throw new Error(`Error getting admin data: ${error.message}`);
    }
};

/**
 * Get admin statistics
 * @param {string} adminId - The admin's ObjectId
 * @returns {Object} Statistics about the admin's created users
 */
export const getAdminStats = async (adminId) => {
    try {
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            throw new Error('Invalid admin');
        }

        // Count users created by this admin
        const createdAdmins = await User.countDocuments({
            createdBy: adminId,
            role: 'admin'
        });

        const createdUsers = await User.countDocuments({
            createdBy: adminId,
            role: 'faculty'
        });

        // Faculty users are stored in User model, not Faculty model
        const createdFaculty = createdUsers;

        return {
            adminName: admin.name,
            adminEmail: admin.email,
            createdAdmins,
            createdUsers,
            createdFaculty,
            totalCreated: createdAdmins + createdUsers
        };
    } catch (error) {
        throw new Error(`Error getting admin stats: ${error.message}`);
    }
};
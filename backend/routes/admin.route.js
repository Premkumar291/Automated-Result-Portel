import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        console.log('Admin requesting all users list');
        const users = await User.find({}, '-password').lean();
        console.log(`Found ${users.length} users`);
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update user role (admin only)
router.patch('/users/:userId/role', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        console.log(`Admin attempting to update role for user ${userId} to ${role}`);

        if (!['admin', 'faculty'].includes(role)) {
            console.log('Invalid role provided:', role);
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be either 'faculty' or 'admin'"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User role updated successfully:', { userId, newRole: role });
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get system statistics (admin only)
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        console.log('Admin requesting system statistics');
        
        const stats = await Promise.all([
            User.countDocuments({ role: 'faculty' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ isVerified: false })
        ]);

        const systemStats = {
            facultyCount: stats[0],
            adminCount: stats[1],
            unverifiedUsers: stats[2]
        };

        console.log('System statistics retrieved:', systemStats);
        res.status(200).json({
            success: true,
            data: systemStats
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching system statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;

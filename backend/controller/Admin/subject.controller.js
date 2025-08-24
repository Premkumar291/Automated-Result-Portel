import { Subject } from "../../models/subject.model.js";

// Create a new subject
export const createSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName, department, semester, credits, subjectType } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!subjectCode || !subjectName || !department) {
            return res.status(400).json({
                success: false,
                message: 'Subject code, subject name, and department are required'
            });
        }

        // Check if subject code already exists
        const existingSubject = await Subject.findOne({ 
            subjectCode: subjectCode.toUpperCase() 
        });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Subject with this code already exists'
            });
        }

        // Create new subject
        const subject = new Subject({
            subjectCode: subjectCode.toUpperCase(),
            subjectName,
            department: department.toUpperCase(),
            semester,
            credits,
            subjectType: subjectType || 'Theory',
            createdBy: userId
        });

        await subject.save();

        console.log('Subject created successfully:', subject._id);
        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all subjects with pagination and filters
export const getSubjects = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            department, 
            semester, 
            search 
        } = req.query;

        let filter = { isActive: true };

        // Add department filter
        if (department) {
            filter.department = department.toUpperCase();
        }

        // Add semester filter
        if (semester) {
            filter.semester = parseInt(semester);
        }

        // Add search filter
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { subjectCode: regex },
                { subjectName: regex },
                { 'faculty.name': regex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const subjects = await Subject.find(filter)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ subjectCode: 1 })
            .lean();

        const totalSubjects = await Subject.countDocuments(filter);
        const totalPages = Math.ceil(totalSubjects / parseInt(limit));

        console.log(`Found ${subjects.length} subjects`);
        res.status(200).json({
            success: true,
            data: subjects,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalSubjects,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get subject by ID
export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await Subject.findById(id)
            .populate('createdBy', 'name email')
            .lean();

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        console.log('Subject retrieved:', subject._id);
        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update subject
export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.createdBy;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Convert department and subjectCode to uppercase if provided
        if (updates.department) {
            updates.department = updates.department.toUpperCase();
        }
        if (updates.subjectCode) {
            updates.subjectCode = updates.subjectCode.toUpperCase();
        }

        const subject = await Subject.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        console.log('Subject updated successfully:', subject._id);
        res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: subject
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete subject (soft delete)
export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await Subject.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        console.log('Subject deleted successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add faculty to subject
export const addFacultyToSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const facultyData = req.body;

        // Validate faculty data
        if (!facultyData.title || !facultyData.name || !facultyData.initials) {
            return res.status(400).json({
                success: false,
                message: 'Faculty title, name, and initials are required'
            });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        subject.faculty.push(facultyData);
        await subject.save();

        console.log('Faculty added to subject:', id);
        res.status(200).json({
            success: true,
            message: 'Faculty added successfully',
            data: subject
        });
    } catch (error) {
        console.error('Error adding faculty to subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding faculty to subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Remove faculty from subject
export const removeFacultyFromSubject = async (req, res) => {
    try {
        const { id, facultyId } = req.params;

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        const facultyMember = subject.faculty.id(facultyId);
        if (!facultyMember) {
            return res.status(404).json({
                success: false,
                message: 'Faculty member not found in this subject'
            });
        }

        facultyMember.remove();
        await subject.save();

        console.log('Faculty removed from subject:', id);
        res.status(200).json({
            success: true,
            message: 'Faculty removed successfully',
            data: subject
        });
    } catch (error) {
        console.error('Error removing faculty from subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing faculty from subject',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get subjects by department
export const getSubjectsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;

        const subjects = await Subject.findByDepartment(department)
            .populate('createdBy', 'name email')
            .sort({ subjectCode: 1 })
            .lean();

        console.log(`Found ${subjects.length} subjects in ${department} department`);
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects by department',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

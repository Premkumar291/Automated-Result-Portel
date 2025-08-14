import { Faculty } from "../../models/faculty.model.js";

// Create a new faculty member
export const createFaculty = async (req, res) => {
    try {
        const { 
            title, 
            name, 
            initials, 
            email, 
            department, 
            studies,
            employeeId,
            phoneNumber,
            dateOfJoining
        } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title || !name || !initials || !department) {
            return res.status(400).json({
                success: false,
                message: 'Title, name, initials, and department are required'
            });
        }

        // Check if faculty already exists with same email or employee ID
        const existingFaculty = await Faculty.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(employeeId ? [{ employeeId }] : [])
            ]
        });

        if (existingFaculty) {
            let field = 'email';
            if (existingFaculty.employeeId === employeeId) field = 'employee ID';
            
            return res.status(400).json({
                success: false,
                message: `Faculty with this ${field} already exists`
            });
        }

        // Validate studies if provided
        if (studies && studies.length > 0) {
            for (const study of studies) {
                if (!study.degree) {
                    return res.status(400).json({
                        success: false,
                        message: 'Degree is required for each study entry'
                    });
                }
            }
        }

        // Create new faculty
        const faculty = new Faculty({
            title,
            name,
            initials,
            email: email || undefined,
            department: department.toUpperCase(),
            studies: studies || [],
            employeeId: employeeId || undefined,
            phoneNumber,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
            createdBy: userId
        });

        await faculty.save();

        console.log('Faculty created successfully:', faculty._id);
        res.status(201).json({
            success: true,
            message: 'Faculty created successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all faculty with pagination and filters
export const getFaculty = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            department, 
            search 
        } = req.query;

        let filter = { isActive: true };

        // Add department filter
        if (department) {
            filter.department = department.toUpperCase();
        }

        // Add search filter
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { initials: regex },
                { email: regex },
                { employeeId: regex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const faculty = await Faculty.find(filter)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 })
            .lean();

        const totalFaculty = await Faculty.countDocuments(filter);
        const totalPages = Math.ceil(totalFaculty / parseInt(limit));

        console.log(`Found ${faculty.length} faculty members`);
        res.status(200).json({
            success: true,
            data: faculty,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalFaculty,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get faculty by ID
export const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await Faculty.findById(id)
            .populate('createdBy', 'name email')
            .lean();

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        console.log('Faculty retrieved:', faculty._id);
        res.status(200).json({
            success: true,
            data: faculty
        });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update faculty
export const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.createdBy;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Convert department to uppercase if provided
        if (updates.department) {
            updates.department = updates.department.toUpperCase();
        }

        // Convert dateOfJoining to Date object if provided
        if (updates.dateOfJoining) {
            updates.dateOfJoining = new Date(updates.dateOfJoining);
        }

        const faculty = await Faculty.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        console.log('Faculty updated successfully:', faculty._id);
        res.status(200).json({
            success: true,
            message: 'Faculty updated successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete faculty (soft delete)
export const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await Faculty.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        console.log('Faculty deleted successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Faculty deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get faculty by department
export const getFacultyByDepartment = async (req, res) => {
    try {
        const { department } = req.params;

        const faculty = await Faculty.findByDepartment(department)
            .populate('createdBy', 'name email')
            .sort({ name: 1 })
            .lean();

        console.log(`Found ${faculty.length} faculty members in ${department} department`);
        res.status(200).json({
            success: true,
            data: faculty
        });
    } catch (error) {
        console.error('Error fetching faculty by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty by department',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add study to faculty
export const addStudyToFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const studyData = req.body;

        // Validate study data
        if (!studyData.degree) {
            return res.status(400).json({
                success: false,
                message: 'Degree is required'
            });
        }

        const faculty = await Faculty.findById(id);
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        await faculty.addStudy(studyData);

        console.log('Study added to faculty:', id);
        res.status(200).json({
            success: true,
            message: 'Study added successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error adding study to faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding study to faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Remove study from faculty
export const removeStudyFromFaculty = async (req, res) => {
    try {
        const { id, studyId } = req.params;

        const faculty = await Faculty.findById(id);
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        const study = faculty.studies.id(studyId);
        if (!study) {
            return res.status(404).json({
                success: false,
                message: 'Study not found'
            });
        }

        study.remove();
        await faculty.save();

        console.log('Study removed from faculty:', id);
        res.status(200).json({
            success: true,
            message: 'Study removed successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error removing study from faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing study from faculty',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

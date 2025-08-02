import { Student } from "../../models/student.model.js";   

// Create a new student
export const createStudent = async (req, res) => {
    try {
        const { email, registerNumber, name, department, joiningYear, passOutYear, dateOfBirth, mobileNumber } = req.body;

        // Validate required fields
        if (!email || !registerNumber || !name || !department || !joiningYear || !passOutYear || !dateOfBirth || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if student already exists with same email or register number
        const existingStudent = await Student.findOne({
            $or: [{ email }, { registerNumber }, { mobileNumber }]
        });

        if (existingStudent) {
            let field = 'email';
            if (existingStudent.registerNumber === registerNumber) field = 'register number';
            if (existingStudent.mobileNumber === mobileNumber) field = 'mobile number';
            
            return res.status(400).json({
                success: false,
                message: `Student with this ${field} already exists`
            });
        }

        // Create new student
        const student = new Student({
            email,
            registerNumber,
            name,
            department,
            joiningYear,
            passOutYear,
            dateOfBirth: new Date(dateOfBirth),
            mobileNumber
        });

        await student.save();

        console.log('Student created successfully:', student._id);
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: student
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get students by department (Main function)
export const getStudentsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const filter = { department: department.toUpperCase() };
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const students = await Student.find(filter)
            .select('name registerNumber department joiningYear passOutYear')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 })
            .lean();
            
        const totalStudents = await Student.countDocuments(filter);
        const totalPages = Math.ceil(totalStudents / parseInt(limit));

        console.log(`Found ${students.length} students in ${department} department`);
        res.status(200).json({
            success: true,
            data: students,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalStudents,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching students by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students by department',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Search students by name (Main function)
export const searchStudentsByName = async (req, res) => {
    try {
        const { name } = req.query;
        const { department, page = 1, limit = 50 } = req.query;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name search query must be at least 2 characters long'
            });
        }

        const filter = {
            name: { $regex: name.trim(), $options: 'i' }
        };
        
        // Add department filter if provided
        if (department) {
            filter.department = department.toUpperCase();
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const students = await Student.find(filter)
            .select('name registerNumber department joiningYear passOutYear')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 })
            .lean();
            
        const totalStudents = await Student.countDocuments(filter);
        const totalPages = Math.ceil(totalStudents / parseInt(limit));

        console.log(`Found ${students.length} students matching name: ${name}`);
        res.status(200).json({
            success: true,
            data: students,
            searchQuery: name,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalStudents,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error searching students by name:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching students by name',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all departments with student count
export const getDepartments = async (req, res) => {
    try {
        const departments = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { department: '$_id', count: 1, _id: 0 } }
        ]);

        console.log('Departments retrieved:', departments);
        res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get student by register number
export const getStudentByRegNumber = async (req, res) => {
    try {
        const { registerNumber } = req.params;
        
        const student = await Student.findOne({ registerNumber: registerNumber.toUpperCase() })
            .select('name registerNumber department joiningYear passOutYear')
            .lean();
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        console.log('Student retrieved by register number:', student._id);
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error fetching student by register number:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update student (Admin only)
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Convert dateOfBirth to Date object if provided
        if (updates.dateOfBirth) {
            updates.dateOfBirth = new Date(updates.dateOfBirth);
        }

        const student = await Student.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        console.log('Student updated successfully:', student._id);
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete student (Admin only)
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const student = await Student.findByIdAndDelete(id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        console.log('Student deleted successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Legacy function - kept for backward compatibility
export const getStudent = async (req, res) => {

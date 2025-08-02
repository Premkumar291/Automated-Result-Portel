import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js';
import {
    createStudent,
    getStudentsByDepartment,
    searchStudentsByName,
    getDepartments,
    getStudentByRegNumber,
    updateStudent,
    deleteStudent
} from '../controller/Admin/student.controller.js';

const router = express.Router();

// Get all departments with student count (Admin/Faculty)
router.get('/departments', verifyToken, getDepartments);

// Search students by name (Admin/Faculty)
// Usage: /api/student/search?name=john&department=CSE&page=1&limit=50
router.get('/search', verifyToken, searchStudentsByName);

// Get students by department (Admin/Faculty)
// Usage: /api/student/department/CSE?page=1&limit=50
router.get('/department/:department', verifyToken, getStudentsByDepartment);

// Get student by register number (Admin/Faculty)
router.get('/register/:registerNumber', verifyToken, getStudentByRegNumber);

// Create new student (Admin only)
router.post('/', verifyToken, verifyAdmin, createStudent);

// Update student (Admin only)
router.put('/:id', verifyToken, verifyAdmin, updateStudent);

// Delete student (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, deleteStudent);

export default router;

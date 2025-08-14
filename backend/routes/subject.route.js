import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js';
import {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    addFacultyToSubject,
    removeFacultyFromSubject,
    getSubjectsByDepartment
} from '../controller/Admin/subject.controller.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(verifyToken, verifyAdmin);

// Subject CRUD operations
router.post('/', createSubject);                           // Create new subject
router.get('/', getSubjects);                              // Get all subjects with filters
router.get('/:id', getSubjectById);                        // Get subject by ID
router.put('/:id', updateSubject);                         // Update subject
router.delete('/:id', deleteSubject);                      // Delete subject (soft delete)

// Department-specific routes
router.get('/department/:department', getSubjectsByDepartment); // Get subjects by department

// Faculty management within subjects
router.post('/:id/faculty', addFacultyToSubject);          // Add faculty to subject
router.delete('/:id/faculty/:facultyId', removeFacultyFromSubject); // Remove faculty from subject

export default router;

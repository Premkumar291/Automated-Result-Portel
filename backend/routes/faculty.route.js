import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js';
import {
    createFaculty,
    getFaculty,
    getFacultyById,
    updateFaculty,
    deleteFaculty,
    getFacultyByDepartment,
    addStudyToFaculty,
    removeStudyFromFaculty
} from '../controller/Admin/faculty.controller.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(verifyToken, verifyAdmin);

// Faculty CRUD operations
router.post('/', createFaculty);                           // Create new faculty
router.get('/', getFaculty);                               // Get all faculty with filters
router.get('/:id', getFacultyById);                        // Get faculty by ID
router.put('/:id', updateFaculty);                         // Update faculty
router.delete('/:id', deleteFaculty);                      // Delete faculty (soft delete)

// Department-specific routes
router.get('/department/:department', getFacultyByDepartment); // Get faculty by department

// Studies management within faculty
router.post('/:id/studies', addStudyToFaculty);            // Add study to faculty
router.delete('/:id/studies/:studyId', removeStudyFromFaculty); // Remove study from faculty

export default router;

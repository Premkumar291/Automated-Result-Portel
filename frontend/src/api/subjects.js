import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: `${API_URL}/subjects`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Subject Management API
export const subjectAPI = {
    // Create new subject
    createSubject: async (subjectData) => {
        try {
            const response = await api.post('/', subjectData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all subjects with filters
    getSubjects: async (params = {}) => {
        try {
            const response = await api.get('/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get subject by ID
    getSubjectById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update subject
    updateSubject: async (id, updateData) => {
        try {
            const response = await api.put(`/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete subject
    deleteSubject: async (id) => {
        try {
            const response = await api.delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get subjects by department
    getSubjectsByDepartment: async (department) => {
        try {
            const response = await api.get(`/department/${department}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add faculty to subject
    addFacultyToSubject: async (subjectId, facultyData) => {
        try {
            const response = await api.post(`/${subjectId}/faculty`, facultyData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove faculty from subject
    removeFacultyFromSubject: async (subjectId, facultyId) => {
        try {
            const response = await api.delete(`/${subjectId}/faculty/${facultyId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Constants for dropdowns
export const DEGREE_OPTIONS = [
    'PhD', 'M.Tech', 'M.E', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 
    'B.Tech', 'B.E', 'B.Sc', 'B.A', 'B.Com', 'BCA', 'Diploma', 'Other'
];

export const TITLE_OPTIONS = [
    'Dr.', 'Prof.', 'Asst. Prof.', 'Assoc. Prof.', 'Mr.', 'Ms.', 'Mrs.'
];

export const DEPARTMENT_OPTIONS = [
    'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSBS', 'OTHER'
];

export default subjectAPI;

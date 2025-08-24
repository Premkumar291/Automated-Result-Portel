import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: `${API_URL}/faculty`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Faculty Management API
export const facultyAPI = {
    // Create new faculty
    createFaculty: async (facultyData) => {
        try {
            const response = await api.post('/', facultyData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all faculty with filters
    getFaculty: async (params = {}) => {
        try {
            const response = await api.get('/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get faculty by ID
    getFacultyById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update faculty
    updateFaculty: async (id, updateData) => {
        try {
            const response = await api.put(`/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete faculty
    deleteFaculty: async (id) => {
        try {
            const response = await api.delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get faculty by department
    getFacultyByDepartment: async (department) => {
        try {
            const response = await api.get(`/department/${department}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add study to faculty
    addStudyToFaculty: async (facultyId, studyData) => {
        try {
            const response = await api.post(`/${facultyId}/studies`, studyData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove study from faculty
    removeStudyFromFaculty: async (facultyId, studyId) => {
        try {
            const response = await api.delete(`/${facultyId}/studies/${studyId}`);
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

export default facultyAPI;

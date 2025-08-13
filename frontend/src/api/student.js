
// src/api/student.js

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/students'; 


export const addStudent = async (studentData) => {
  const response = await axios.post(`${BASE_URL}/add`, studentData);
  return response.data;
};


export const getAllStudents = async () => {
  const response = await axios.get(`${BASE_URL}/all`);
  return response.data;
};


export const searchStudents = async (department, query) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { department, query }
  });
  return response.data;
};



import axios from 'axios';
import { getAccessToken } from './auth.api';

const BASE_URL = 'http://localhost:3000/api/interview';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// POST /generate-interview-report — multipart/form-data with resume, jobdescription, selfdescription
export const generateInterviewReport = (formData) => {
  // Remove manual Content-Type header to let axios set it automatically with correct boundary
  return api.post('/generate-interview-report', formData);
};

// GET /reports/:userId — get all reports for a user
export const getInterviewReports = (userId) =>
  api.get(`/reports/${userId}`);

// GET /report/:reportId — get full detail of a single report
export const getInterviewReportDetails = (reportId) =>
  api.get(`/report/${reportId}`);

// GET /download-report/:reportId — download PDF blob
export const downloadInterviewReport = (reportId) =>
  api.get(`/download-report/${reportId}`, { responseType: 'blob' });

export default api;

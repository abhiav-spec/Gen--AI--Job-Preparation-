import axios from 'axios';
import { getAccessToken, refreshAccessToken, setAccessToken } from './auth.api';

const BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/interview`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401 and retry the request once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry 401s if we haven't already retried this request once
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshAccessToken();
        const { accessToken } = res.data;
        if (accessToken) {
          setAccessToken(accessToken);
          processQueue(null, accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('CRITICAL: Token refresh loop detected or network error. Logging out.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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

// DELETE /report/:reportId — delete report permanently
export const deleteInterviewReport = (reportId) =>
  api.delete(`/report/${reportId}`);

// GET /public/report/:reportId — Get public report details
export const getPublicInterviewReport = (reportId) =>
  api.get(`/public/report/${reportId}`);

// GET /public/download-report/:reportId — Download public report PDF
export const downloadPublicInterviewReport = (reportId) =>
  api.get(`/public/download-report/${reportId}`, { responseType: 'blob' });

export default api;

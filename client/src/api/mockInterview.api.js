import axios from 'axios';
import { getAccessToken, refreshAccessToken, setAccessToken } from './auth.api';

const BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/mock-interview`;

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
        console.error('CRITICAL: Token refresh loop detected in Mock API. Terminating.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// POST /start — Start a new mock interview session
export const startMockInterview = ({ role, difficulty, duration, jobDescription }) =>
  api.post('/start', { role, difficulty, duration, jobDescription });

// POST /:sessionId/answer — Submit answer to current question
export const submitMockAnswer = (sessionId, answer) =>
  api.post(`/${sessionId}/answer`, { answer });

// POST /:sessionId/end — End interview and get report
export const endMockInterview = (sessionId, lastAnswer, behaviorReport = null) =>
  api.post(`/${sessionId}/end`, { lastAnswer, behaviorReport });

// GET /:sessionId — Get session details
export const getMockSession = (sessionId) =>
  api.get(`/${sessionId}`);

// GET /sessions/all — Get all mock interview sessions
export const getAllMockSessions = () =>
  api.get('/sessions/all');

// DELETE /:sessionId — Delete session permanently
export const deleteMockInterview = (sessionId) =>
  api.delete(`/${sessionId}`);

// GET /:sessionId/download — Download the PDF analysis report
export const downloadMockInterviewReport = (sessionId) =>
  api.get(`/${sessionId}/download`, { responseType: 'blob' });

// GET /public/:sessionId — Get public mock session details
export const getPublicMockSession = (sessionId) =>
  api.get(`/public/${sessionId}`);

// GET /public/:sessionId/download — Download public mock PDF
export const downloadPublicMockReport = (sessionId) =>
  api.get(`/public/${sessionId}/download`, { responseType: 'blob' });

export default api;

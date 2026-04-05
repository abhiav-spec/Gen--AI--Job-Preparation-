import axios from 'axios';
import { getAccessToken, refreshAccessToken, setAccessToken } from './auth.api';

const BASE_URL = 'http://localhost:3000/api/mock-interview';

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
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
export const endMockInterview = (sessionId, lastAnswer) =>
  api.post(`/${sessionId}/end`, { lastAnswer });

// GET /:sessionId — Get session details
export const getMockSession = (sessionId) =>
  api.get(`/${sessionId}`);

// GET /sessions/all — Get all mock interview sessions
export const getAllMockSessions = () =>
  api.get('/sessions/all');

export default api;

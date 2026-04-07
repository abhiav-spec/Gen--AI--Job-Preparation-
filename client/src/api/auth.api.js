import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory + localStorage on every request
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  }
};

export const getAccessToken = () => {
  // Return from memory first, fallback to localStorage
  return _accessToken || localStorage.getItem('accessToken');
};

export const clearAccessToken = () => {
  _accessToken = null;
  localStorage.removeItem('accessToken');
};

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

    // Skip refresh logic for login/refresh endpoints to avoid infinite loops
    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }

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
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────

export const registerUser = (data) =>
  api.post('/register', data);

export const loginUser = (data) =>
  api.post('/login', data);

export const verifyEmail = (data) =>
  api.post('/verify-email', data);

export const resendOtp = (data) =>
  api.post('/resend-otp', data);

export const refreshAccessToken = () =>
  api.post('/refresh-token');

export const getProfile = () =>
  api.get('/profile');

export const logoutUser = () =>
  api.post('/logout');

export const logoutAllDevices = () =>
  api.post('/logout-all');

export const updateUserProfile = (data) =>
  api.patch('/profile', data);

export default api;

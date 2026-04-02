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
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

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

export default api;

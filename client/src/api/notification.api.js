import api from './auth.api';

const BASE_URL = '/notifications'; // Base URL is handled by the api instance

export const getNotifications = () => api.get(`${BASE_URL}/all`);
export const markAsRead = (id) => api.patch(`${BASE_URL}/${id}/read`);
export const markAllAsRead = () => api.patch(`${BASE_URL}/all/read`);

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/notifications';

// Helper for authorized requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const getNotifications = () => axios.get(`${API_URL}/all`, getAuthHeaders());
export const markAsRead = (id) => axios.patch(`${API_URL}/${id}/read`, {}, getAuthHeaders());
export const markAllAsRead = () => axios.patch(`${API_URL}/all/read`, {}, getAuthHeaders());

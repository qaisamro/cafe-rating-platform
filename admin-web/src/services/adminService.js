import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getStats = () => axios.get(`${API_URL}/analytics/stats`, getAuthHeaders());
export const getPendingReviews = () => axios.get(`${API_URL}/reviews/moderation`, getAuthHeaders());
export const moderateReview = (id, approved) => axios.put(`${API_URL}/reviews/${id}/moderate`, { approved }, getAuthHeaders());
export const getUsers = () => axios.get(`${API_URL}/users`, getAuthHeaders());
export const createOwner = (data) => axios.post(`${API_URL}/users/create-owner`, data, getAuthHeaders());
export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data, getAuthHeaders());
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());

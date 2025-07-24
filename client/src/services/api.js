import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Message API calls
export const getMessages = () => api.get('/messages');
export const sendMessage = (messageData) => api.post('/messages', messageData);
export const getMessage = (id) => api.get(`/messages/${id}`);
export const deleteMessage = (id) => api.delete(`/messages/${id}`);

// User API calls
export const getUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

export default api;
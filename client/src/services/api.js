import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API calls
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

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

// Chat API calls (Public - no auth required)
export const sendChatMessage = (messageData) => api.post('/chat/message', messageData);
export const sendStreamingChatMessage = (messageData) => api.post('/chat/message/stream', messageData);
export const sendConversation = (conversationData) => api.post('/chat/conversation', conversationData);
export const getAvailableModels = () => api.get('/chat/models');
export const testLMStudioConnection = () => api.get('/chat/status');

// Embedding API calls
export const createEmbedding = (embeddingData) => api.post('/chat/embeddings', embeddingData);
export const searchSimilarEmbeddings = (searchData) => api.post('/chat/embeddings/search', searchData);

// Legacy embedding calls (to be implemented on backend)
export const getEmbeddings = () => api.get('/embeddings');
export const uploadDocument = (formData) => api.post('/embeddings/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const searchEmbeddings = (query) => api.post('/embeddings/search', { query });
export const deleteEmbedding = (id) => api.delete(`/embeddings/${id}`);

export default api;
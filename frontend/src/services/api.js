import axios from 'axios';

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://3.238.129.215:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};
  
// User endpoints
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (passwords) => api.post('/users/change-password', passwords),
};

// Orders endpoints
export const orders = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

// Admin endpoints
export const admin = {
  users: {
    getAll: () => api.get('/admin/users'),
    updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
  },
  orders: {
    getAll: () => api.get('/admin/orders'),
    updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  },
};

export default api; 
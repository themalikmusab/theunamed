// API Service
// Centralized API client for all backend requests

import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
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

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';

    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You don\'t have permission to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ============================================
// WELLNESS CHECKINS API
// ============================================

export const checkinsAPI = {
  create: (data) => api.post('/wellness/checkins', data),
  getAll: (params) => api.get('/wellness/checkins', { params }),
  getById: (id) => api.get(`/wellness/checkins/${id}`),
  getStats: (params) => api.get('/wellness/checkins/stats/summary', { params }),
};

// ============================================
// STUDY SESSIONS API
// ============================================

export const sessionsAPI = {
  start: (data) => api.post('/wellness/sessions', data),
  end: (id, data) => api.post(`/wellness/sessions/${id}/end`, data),
  takeBreak: (id, data) => api.post(`/wellness/sessions/${id}/break`, data),
  endBreak: (id, breakId) => api.post(`/wellness/sessions/${id}/break/${breakId}/end`),
  getAll: (params) => api.get('/wellness/sessions', { params }),
};

// ============================================
// WELLNESS DASHBOARD API
// ============================================

export const wellnessAPI = {
  getDashboard: (params) => api.get('/wellness/dashboard', { params }),
  getInsights: (params) => api.get('/wellness/insights', { params }),
  markInsightRead: (id) => api.patch(`/wellness/insights/${id}/read`),
  getSettings: () => api.get('/wellness/settings'),
  updateSettings: (data) => api.patch('/wellness/settings', data),
};

// ============================================
// RESOURCES API
// ============================================

export const resourcesAPI = {
  getAll: (params) => api.get('/wellness/resources', { params }),
  getCrisis: () => api.get('/wellness/resources/crisis'),
  interact: (id, data) => api.post(`/wellness/resources/${id}/interact`, data),
};

// ============================================
// EDUCATOR API
// ============================================

export const educatorAPI = {
  getStudents: (params) => api.get('/educator/students', { params }),
  getAlerts: (params) => api.get('/educator/alerts', { params }),
  acknowledgeAlert: (id, data) => api.post(`/educator/alerts/${id}/acknowledge`, data),
};

export default api;

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get admin token from localStorage
const getAdminToken = () => localStorage.getItem('adminToken');

// Create axios instance with auth
const adminAPI = axios.create({
  baseURL: `${API_BASE}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
adminAPI.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (redirect to login)
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const adminAuth = {
  login: (credentials) => axios.post(`${API_BASE}/admin/auth/login`, credentials),
  getMe: () => adminAPI.get('/auth/me'),
  changePassword: (data) => adminAPI.post('/auth/change-password', data),
  logout: () => adminAPI.post('/auth/logout')
};

// Dashboard
export const adminDashboard = {
  getStats: () => adminAPI.get('/dashboard/stats'),
  getCharts: (period) => adminAPI.get('/dashboard/charts', { params: { period } })
};

// Users
export const adminUsers = {
  getAll: (params) => adminAPI.get('/users', { params }),
  getById: (id) => adminAPI.get(`/users/${id}`),
  suspend: (id, data) => adminAPI.put(`/users/${id}/suspend`, data),
  delete: (id) => adminAPI.delete(`/users/${id}`)
};

// Jobs
export const adminJobs = {
  getAll: (params) => adminAPI.get('/jobs', { params }),
  getById: (id) => adminAPI.get(`/jobs/${id}`),
  approve: (id, data) => adminAPI.put(`/jobs/${id}/approve`, data),
  reject: (id, data) => adminAPI.put(`/jobs/${id}/reject`, data)
};

// Reviews
export const adminReviews = {
  getAll: (params) => adminAPI.get('/reviews', { params }),
  getById: (id) => adminAPI.get(`/reviews/${id}`),
  approve: (id, data) => adminAPI.put(`/reviews/${id}/approve`, data),
  flag: (id, data) => adminAPI.put(`/reviews/${id}/flag`, data),
  bulkApprove: (reviewIds) => adminAPI.post('/reviews/bulk-approve', { reviewIds }),
  bulkFlag: (reviewIds, reason) => adminAPI.post('/reviews/bulk-flag', { reviewIds, reason }),
  getStatistics: () => adminAPI.get('/reviews/statistics')
};

// Payments
export const adminPayments = {
  getAll: (params) => adminAPI.get('/payments', { params }),
  getById: (id) => adminAPI.get(`/payments/${id}`)
};

// System
export const adminSystem = {
  getConfig: () => adminAPI.get('/system/config'),
  updateConfig: (data) => adminAPI.put('/system/config', data),
  createBackup: () => adminAPI.post('/system/backup')
};

export default adminAPI;
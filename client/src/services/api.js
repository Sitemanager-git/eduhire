import axios from 'axios';
import { INDIAN_STATES, DISTRICTS_BY_STATE } from '../constants/formData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Attach token to every request
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, attach it to Authorization header
    if (token) {
      // CRITICAL: Use Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Request]', config.method.toUpperCase(), config.url, '✓ Token attached');
    } else {
      console.warn('[API Request]', config.method.toUpperCase(), config.url, '⚠️  No token');
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);


/**
 * Response interceptor - Handle auth errors and responses
 */
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url, '✓ Success');
    return response;
  },
  (error) => {
    // Handle 422 Unprocessable Entity - Incomplete Profile
    if (error.response?.status === 422) {
      const data = error.response.data;
      
      if (data.action === 'complete-profile') {
        console.warn('Profile incomplete - redirecting to profile page');
        
        // Show message
        import('antd').then(({ message }) => {
          message.warning(data.message);
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = data.redirectUrl || '/create-institution-profile';
        }, 1500);
        
        return Promise.reject(error);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('[API Response] 401 Unauthorized - Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    console.error('[API Response Error]', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

/**
 * Contract Validation Helper
 * Validates that API responses match the expected contract structure
 * Logs warnings for missing fields but doesn't break functionality
 */
const validateResponse = (data, contractFields) => {
  const errors = [];
  
  contractFields.forEach((field) => {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (errors.length > 0) {
    console.warn('⚠️ Contract Validation Warnings:', errors, 'Response:', data);
  }

  return data;
};

/**
 * API Endpoint Functions
 */

// Authentication API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    verifyToken: () => api.post('/auth/verify'),
    getCurrentUser: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/update-password', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Teacher Profile API - ENFORCES API_CONTRACTS.json
export const teacherAPI = {
    create: (formData) => api.post('/teachers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    get: async () => {
      const response = await api.get('/teachers/profile');
      // Contract: name, email, subject, experience, qualifications, profilePicture, subscription
      const contractFields = ['name', 'email', 'subject', 'experience', 'qualifications'];
      validateResponse(response.data, contractFields);
      return response;
    },
    update: (formData) => api.put('/teachers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Institution Profile API - ENFORCES API_CONTRACTS.json
export const institutionAPI = {
    create: (data) => api.post('/institutions/profile', data),
    get: async () => {
      const response = await api.get('/institutions/profile');
      // Contract: name, email, schoolName, location, about, profilePicture, subscription
      const contractFields = ['name', 'email', 'schoolName', 'location', 'about'];
      validateResponse(response.data, contractFields);
      return response;
    },
    update: (data) => api.put('/institutions/profile', data),
    checkProfileStatus: () => api.get('/institutions/profile-status'),
};

// Job API
export const jobAPI = {
    create: (data) => api.post('/jobs/create', data),
    getAll: (params) => api.get('/jobs', { params }),
    getById: (id) => api.get(`/jobs/${id}`),
    getDetails: (id) => api.get(`/jobs/${id}/details`),
    search: (params) => api.get('/jobs/search', { params }),
    update: (id, data) => api.put(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
    getMyJobs: (params) => api.get('/jobs/my-jobs', { params }),
    duplicate: (id) => api.post(`/jobs/${id}/duplicate`),
    getSimilar: (id) => api.get(`/jobs/${id}/similar`),
};

// Application API
export const applicationAPI = {
    submit: (jobId, data) => api.post('/applications/apply', { job_id: jobId, ...data }),
    getAll: (params) => api.get('/applications', { params }),
    getMyApplications: (params) => api.get('/applications/my', { params }),
    getByJob: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
    updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
    getReceived: (params) => api.get('/applications/received', { params }),
    withdraw: (id) => api.delete(`/applications/${id}`),
    exportApplicants: (jobId, format = 'csv') =>
        api.get(`/applications/export/${jobId}`, {
            params: { format },
            responseType: 'blob'
        }),
};

// Bookmark API
export const bookmarkAPI = {
    create: (data) => api.post('/bookmarks', data),
    getAll: (params) => api.get('/bookmarks/my', { params }),
    remove: (jobId) => api.delete(`/bookmarks/${jobId}`),
    check: (jobId) => api.get(`/bookmarks/check/${jobId}`),
};

// Review API
export const reviewAPI = {
    submit: (data) => api.post('/reviews', data),
    getForEntity: (entityType, entityId, params) => 
        api.get(`/reviews/${entityType}/${entityId}`, { params }),
    getMy: () => api.get('/reviews/my-reviews'),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// Notification API - ENFORCES API_CONTRACTS.json
export const notificationAPI = {
    getAll: async (params) => {
      const response = await api.get('/notifications', { params });
      // Contract: Array of { _id, userId, message, type, read, createdAt }
      return response;
    },
    getUnreadCount: async () => {
      const response = await api.get('/notifications/unread-count');
      // Contract: { count }
      validateResponse(response.data, ['count']);
      return response;
    },
    markAsRead: (id) => {
      // Contract: { _id, read: true }
      return api.patch(`/notifications/${id}/read`);
    },
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
};

// Settings API - ENFORCES API_CONTRACTS.json
export const settingsAPI = {
    getSettings: async () => {
      const response = await api.get('/user/settings');
      // Contract: { notifications: {...}, privacy: {...} }
      validateResponse(response.data, ['notifications', 'privacy']);
      return response;
    },
    updateSettings: async (data) => {
      const response = await api.put('/user/settings', data);
      validateResponse(response.data, ['notifications', 'privacy']);
      return response;
    },
    changePassword: (data) => api.post('/user/change-password', data),
    exportData: () => api.get('/user/export-data', { responseType: 'blob' }),
    deleteAccount: () => api.delete('/user/account'),
};

// Subscriptions API - ENFORCES API_CONTRACTS.json
export const subscriptionAPI = {
    getCurrent: async () => {
      const response = await api.get('/subscriptions/my-subscription');
      // Contract: { plan, renewalDate, status }
      validateResponse(response.data, ['plan', 'renewalDate', 'status']);
      return response;
    },
    upgrade: (plan) => api.post('/subscriptions/upgrade', { plan }),
    cancel: () => api.post('/subscriptions/cancel'),
    getBillingHistory: () => api.get('/subscriptions/billing-history'),
};

// Support API - ENFORCES API_CONTRACTS.json
export const supportAPI = {
    createTicket: async (data) => {
      const response = await api.post('/support/create-ticket', data);
      // Contract: { _id, ticketId, status, createdAt }
      validateResponse(response.data, ['_id', 'ticketId', 'status', 'createdAt']);
      return response;
    },
    getFAQ: () => api.get('/faq'),
};

// Dashboard API
export const dashboardAPI = {
    getTeacherStats: () => api.get('/dashboard/teacher-stats'),
    getInstitutionStats: () => api.get('/dashboard/institution-stats'),
};

export const locationAPI = {
    getStates: () => {
        return Promise.resolve({
            data: {
                states: INDIAN_STATES
            }
        });
    },

    getDistricts: (state) => {
        return Promise.resolve({
            data: {
                districts: DISTRICTS_BY_STATE[state] || []
            }
        });
    }
};

export default api;

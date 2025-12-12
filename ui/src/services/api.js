import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh')
};

// Borrowers API
export const borrowersAPI = {
  getAll: (params = {}) => api.get('/borrowers', { params }),
  getById: (id) => api.get(`/borrowers/${id}`),
  create: (data) => api.post('/borrowers', data),
  update: (id, data) => api.put(`/borrowers/${id}`, data),
  delete: (id) => api.delete(`/borrowers/${id}`),
  search: (query) => api.get(`/borrowers/search?q=${query}`)
};

// Loans API
export const loansAPI = {
  getAll: (params = {}) => api.get('/loans', { params }),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  update: (id, data) => api.put(`/loans/${id}`, data),
  delete: (id) => api.delete(`/loans/${id}`),
  approve: (id, data) => api.post(`/loans/${id}/approve`, data),
  disburse: (id, data) => api.post(`/loans/${id}/disburse`, data),
  getSchedule: (id) => api.get(`/loans/${id}/schedule`),
  getStatement: (id) => api.get(`/loans/${id}/statement`)
};

// Payments API
export const paymentsAPI = {
  process: (data) => api.post('/payments/process', data),
  getHistory: (loanId, params = {}) => api.get(`/payments/history/${loanId}`, { params }),
  getReport: (params = {}) => api.get('/payments/report', { params }),
  getAll: (params = {}) => api.get('/payments', { params })
};

// EMI Calculator API
export const emiAPI = {
  calculate: (data) => api.post('/emi/calculate', data),
  generateSchedule: (data) => api.post('/emi/schedule', data)
};

// Analytics API
export const analyticsAPI = {
  getPortfolio: (params = {}) => api.get('/analytics/portfolio', { params }),
  getTrends: (params = {}) => api.get('/analytics/trends', { params }),
  getPerformance: (params = {}) => api.get('/analytics/performance', { params }),
  getOverdueAnalysis: (params = {}) => api.get('/overdue/analysis', { params })
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: (params = {}) => api.get('/dashboard/kpis', { params }),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getAlerts: () => api.get('/dashboard/alerts')
};

// Reports API
export const reportsAPI = {
  getPortfolio: (params = {}) => api.get('/reports/portfolio', { params }),
  getCollections: (params = {}) => api.get('/reports/collections', { params }),
  getOverdue: (params = {}) => api.get('/reports/overdue', { params }),
  exportPortfolio: (params = {}) => api.get('/reports/portfolio/export', { 
    params, 
    responseType: 'blob' 
  }),
  exportCollections: (params = {}) => api.get('/reports/collections/export', { 
    params, 
    responseType: 'blob' 
  })
};

// Branches API
export const branchesAPI = {
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`)
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.post(`/users/${id}/change-password`, data)
};

// Legal Cases API
export const legalAPI = {
  getAll: (params = {}) => api.get('/legal-cases', { params }),
  getById: (id) => api.get(`/legal-cases/${id}`),
  create: (data) => api.post('/legal-cases', data),
  update: (id, data) => api.put(`/legal-cases/${id}`, data),
  delete: (id) => api.delete(`/legal-cases/${id}`)
};

// Collections API
export const collectionsAPI = {
  getAll: (params = {}) => api.get('/collections', { params }),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  getFieldVisits: (params = {}) => api.get('/collections/field-visits', { params }),
  createFieldVisit: (data) => api.post('/collections/field-visits', data)
};

// Import/Export API
export const importAPI = {
  importDisbursements: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/disbursements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  importPayments: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getImportStatus: (jobId) => api.get(`/import/status/${jobId}`)
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

export default api;
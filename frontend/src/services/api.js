import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me')
};

export const borrowersAPI = {
  getAll: (params) => api.get('/borrowers', { params }),
  getById: (id) => api.get(`/borrowers/${id}`),
  create: (data) => api.post('/borrowers', data),
  update: (id, data) => api.put(`/borrowers/${id}`, data),
  delete: (id) => api.delete(`/borrowers/${id}`)
};

export const loansAPI = {
  getAll: (params) => api.get('/loans', { params }),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  updateStatus: (id, status) => api.patch(`/loans/${id}/status`, { status })
};

export const paymentsAPI = {
  getByLoan: (loanId) => api.get(`/payments/loan/${loanId}`),
  create: (data) => api.post('/payments', data)
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data)
};

export default api;

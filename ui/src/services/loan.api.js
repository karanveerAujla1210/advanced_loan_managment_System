import api from './api';

export const loanAPI = {
  // Get all loans
  getLoans: async (params = {}) => {
    const response = await api.get('/loans', { params });
    return response.data;
  },

  // Get loan by ID
  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  // Create new loan
  createLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  // Update loan
  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },

  // Get loan schedule
  getLoanSchedule: async (id) => {
    const response = await api.get(`/loans/${id}/schedule`);
    return response.data;
  },

  // Calculate EMI
  calculateEMI: async (loanData) => {
    const response = await api.post('/emi/calculate', loanData);
    return response.data;
  }
};

export default loanAPI;
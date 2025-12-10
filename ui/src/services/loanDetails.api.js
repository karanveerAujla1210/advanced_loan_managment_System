import { api } from './api';

export const loanDetailsApi = {
  // Get comprehensive loan details
  getLoanDetails: async (loanId) => {
    const response = await api.get(`/loans/${loanId}/details`);
    return response.data;
  },

  // Get closing summary
  getClosingSummary: async (loanId) => {
    const response = await api.get(`/loans/${loanId}/closing-summary`);
    return response.data;
  },

  // Generate closing statement
  generateClosingStatement: async (loanId) => {
    const response = await api.post(`/loans/${loanId}/closing-statement`);
    return response.data;
  }
};

export default loanDetailsApi;
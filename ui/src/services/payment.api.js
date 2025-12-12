import api from './api';

export const paymentAPI = {
  // Add payment
  addPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Get payment history for loan
  getPaymentHistory: async (loanId) => {
    const response = await api.get(`/payments/loan/${loanId}`);
    return response.data;
  }
};

export default paymentAPI;
// ui/src/services/loan.api.js
import api from "./api"; // your axios instance

export const fetchLoanDetails = (loanId) => api.get(`/loans/${loanId}/details`).then(r => r.data);
export const postPayment = (loanId, payload) => api.post(`/payments`, { loanId, ...payload }).then(r => r.data);
export const postBounce = (loanId, payload) => api.post(`/payments/bounce`, { loanId, ...payload }).then(r => r.data);
export const triggerLegal = (loanId, payload) => api.post(`/legal/case`, { loanId, ...payload }).then(r => r.data);
export const downloadLoanPdf = (loanId) => {
  // server endpoint must exist: GET /loans/:id/statement (PDF)
  const url = `${import.meta.env.VITE_API || ""}/loans/${loanId}/statement`;
  window.open(url, "_blank");
};

export default { fetchLoanDetails, postPayment, postBounce, triggerLegal, downloadLoanPdf };
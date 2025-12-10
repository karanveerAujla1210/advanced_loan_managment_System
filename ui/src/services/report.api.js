import api from "./api";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchPortfolio = (params) => api.get("/reports/portfolio", { params }).then(r => r.data);
export const fetchCollections = (params) => api.get("/reports/collections", { params }).then(r => r.data);
export const fetchAging = (params) => api.get("/reports/aging", { params }).then(r => r.data);
export const fetchDisbursement = (params) => api.get("/reports/disbursement", { params }).then(r => r.data);
export const fetchBranchPerformance = (params) => api.get("/reports/branch", { params }).then(r => r.data);
export const fetchAgentPerformance = (params) => api.get("/reports/agents", { params }).then(r => r.data);
export const fetchLegal = (params) => api.get("/reports/legal", { params }).then(r => r.data);

export const exportXlsx = (type, params = {}) => {
  const query = new URLSearchParams({ type, ...params }).toString();
  window.open(`${API_BASE}/reports/export?${query}`);
};

export const exportCsv = (type, params = {}) => {
  const query = new URLSearchParams({ type, ...params }).toString();
  window.open(`${API_BASE}/reports/export-csv?${query}`);
};

export const exportPdf = (type, params = {}) => {
  const query = new URLSearchParams({ type, ...params }).toString();
  window.open(`${API_BASE}/reports/export-pdf?${query}`);
};

export const sendScheduledReport = (data) => api.post("/reports/send-scheduled", data).then(r => r.data);

export default { 
  fetchPortfolio, 
  fetchCollections, 
  fetchAging, 
  fetchDisbursement,
  fetchBranchPerformance,
  fetchAgentPerformance,
  fetchLegal,
  exportXlsx, 
  exportCsv, 
  exportPdf,
  sendScheduledReport
};
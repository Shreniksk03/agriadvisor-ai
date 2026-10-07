import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// ─── JWT Token Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ─── Advisory API ────────────────────────────────────────────────────────────
export const advisoryAPI = {
  getAll: () => api.get('/advisories'),
  getById: (id) => api.get(`/advisories/${id}`),
  updateStatus: (id, data) => api.patch(`/advisories/${id}`, data),
  scoreSingle: (data) => api.post('/advisories/score-single', data),
  batchUpload: (formData) => api.post('/advisories/batch-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
};

// ─── Analytics API ───────────────────────────────────────────────────────────
export const analyticsAPI = {
  pathogenRings: () => api.get('/analytics/pathogen-rings'),
  anomalySpikes: () => api.get('/analytics/anomaly-spikes'),
};

// ─── Dashboard API ───────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── Policy API ──────────────────────────────────────────────────────────────
export const policyAPI = {
  simulate: (data) => api.put('/policies/simulate', data),
};

// ─── Review Queue API ────────────────────────────────────────────────────────
export const reviewAPI = {
  getQueue: () => api.get('/review-queue'),
};

export default api;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor thêm token vào mọi request
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

// Interceptor xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Nhân Khẩu API
export const nhanKhauAPI = {
  getAll: (params) => api.get('/nhankhau', { params }),
  getById: (id) => api.get(`/nhankhau/${id}`),
  create: (data) => api.post('/nhankhau', data),
  update: (id, data) => api.put(`/nhankhau/${id}`, data),
  delete: (id) => api.delete(`/nhankhau/${id}`),
};

// Hộ Khẩu API
export const hoKhauAPI = {
  getAll: (params) => api.get('/hokhau', { params }),
  getById: (id) => api.get(`/hokhau/${id}`),
  create: (data) => api.post('/hokhau', data),
  update: (id, data) => api.put(`/hokhau/${id}`, data),
  delete: (id) => api.delete(`/hokhau/${id}`),
};

// Khoản Thu API
export const khoanThuAPI = {
  getAll: (params) => api.get('/khoanthu', { params }),
  getById: (id) => api.get(`/khoanthu/${id}`),
  create: (data) => api.post('/khoanthu', data),
  update: (id, data) => api.put(`/khoanthu/${id}`, data),
  delete: (id) => api.delete(`/khoanthu/${id}`),
};

// Phiếu Thu API
export const phieuThuAPI = {
  getAll: (params) => api.get('/phieuthu', { params }),
  getById: (id) => api.get(`/phieuthu/${id}`),
  create: (data) => api.post('/phieuthu', data),
  update: (id, data) => api.put(`/phieuthu/${id}`, data),
  delete: (id) => api.delete(`/phieuthu/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getGrowthChart: () => api.get('/dashboard/growth-chart'),
};

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ========== DASHBOARD ==========
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ========== NHÂN KHẨU ==========
export const nhanKhauAPI = {
  getAll: (params) => api.get('/nhankhau', { params }),
  getById: (id) => api.get(`/nhankhau/${id}`),
  create: (data) => api.post('/nhankhau', data),
  update: (id, data) => api.put(`/nhankhau/${id}`, data),
  delete: (id) => api.delete(`/nhankhau/${id}`),
  getAvailableForHoKhau: (hoKhauId, params) => api.get(`/nhankhau/available-for-hokhau/${hoKhauId}`, { params })
};

// ========== HỘ KHẨU ==========
export const hoKhauAPI = {
  getAll: (params) => api.get('/hokhau', { params }),
  getById: (id) => api.get(`/hokhau/${id}`),
  create: (data) => api.post('/hokhau', data),
  update: (id, data) => api.put(`/hokhau/${id}`, data),
  delete: (id) => api.delete(`/hokhau/${id}`),
  addMember: (id, data) => api.post(`/hokhau/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/hokhau/${id}/members/${memberId}`),
  approve: (id) => api.patch(`/hokhau/${id}/approve`),
  reject: (id, data) => api.patch(`/hokhau/${id}/reject`, data),
  getAvailableForJoin: (params) => api.get('/hokhau/available-for-join', { params }),
};

// ========== TẠM TRÚ (DANH SÁCH CHÍNH THỨC) ==========
export const tamTruAPI = {
  getAll: (params) => api.get('/tamtru', { params }),
  getById: (id) => api.get(`/tamtru/${id}`),
  create: (data) => api.post('/tamtru', data),
  update: (id, data) => api.put(`/tamtru/${id}`, data),
  delete: (id) => api.delete(`/tamtru/${id}`),
};

// ========== TẠM VẮNG (DANH SÁCH CHÍNH THỨC) ==========
export const tamVangAPI = {
  getAll: (params) => api.get('/tamvang', { params }),
  getById: (id) => api.get(`/tamvang/${id}`),
  create: (data) => api.post('/tamvang', data),
  update: (id, data) => api.put(`/tamvang/${id}`, data),
  delete: (id) => api.delete(`/tamvang/${id}`),
};

// ⭐ ========== ĐƠN TẠM TRÚ (ĐƠN ĐĂNG KÝ) ========== ⭐
export const donTamTruAPI = {
  getAll: (params) => api.get('/don-tam-tru', { params }),
  getById: (id) => api.get(`/don-tam-tru/${id}`),
  create: (data) => api.post('/don-tam-tru', data),
  approve: (id) => api.post(`/don-tam-tru/${id}/approve`),
  reject: (id, data) => api.post(`/don-tam-tru/${id}/reject`, data),
  delete: (id) => api.delete(`/don-tam-tru/${id}`)
};

export const donTamVangAPI = {
  getAll: (params) => api.get('/don-tam-vang', { params }),
  getById: (id) => api.get(`/don-tam-vang/${id}`),
  create: (data) => api.post('/don-tam-vang', data),
  approve: (id) => api.post(`/don-tam-vang/${id}/approve`),
  reject: (id, data) => api.post(`/don-tam-vang/${id}/reject`, data),
  delete: (id) => api.delete(`/don-tam-vang/${id}`)
};

// ========== KHOẢN THU ==========
export const khoanThuAPI = {
  getAll: (params) => api.get('/khoanthu', { params }),
  getById: (id) => api.get(`/khoanthu/${id}`),
  create: (data) => api.post('/khoanthu', data),
  update: (id, data) => api.put(`/khoanthu/${id}`, data),
  delete: (id) => api.delete(`/khoanthu/${id}`),
};

// ========== PHIẾU THU ==========
export const phieuThuAPI = {
  getAll: (params) => {
    console.log('API Call - GET /phieuthu with params:', params);
    return api.get('/phieuthu', { params });
  },
  getById: (id) => {
    console.log('API Call - GET /phieuthu/' + id);
    return api.get(`/phieuthu/${id}`);
  },
  create: (data) => api.post('/phieuthu', data),
  update: (id, data) => api.put(`/phieuthu/${id}`, data),
  delete: (id) => api.delete(`/phieuthu/${id}`),
  markAsPaid: (id, data = {}) => {
    console.log('API Call - PUT /phieuthu/' + id + '/paid');
    return api.put(`/phieuthu/${id}/paid`, data);
  },
};

export const donXinVaoHoAPI = {
  getAll: (params) => api.get('/donxinvaoho', { params }),
  getById: (id) => api.get(`/donxinvaoho/${id}`),
  create: (data) => api.post('/donxinvaoho', data),
  delete: (id) => api.delete(`/donxinvaoho/${id}`)
};

// ========== USER ==========
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateRole: (userId, data) => api.put(`/users/${userId}/role`, data),
  updateStatus: (userId, data) => api.put(`/users/${userId}/status`, data),
  linkProfile: (userId, data) => api.put(`/users/${userId}/link-profile`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  changePassword: (data) => api.put('/users/change-password', data),
};

// ========== AUTH ==========
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  linkProfile: (nhanKhauId) => api.put('/auth/link-profile', { nhanKhauId }),
  logout: () => api.post('/auth/logout'),
};

// ========== NOTIFICATION API ==========
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const feedbackAPI = {
  create: (data) => api.post('/feedbacks', data),
  getAll: (params) => api.get('/feedbacks', { params }),
  getMyFeedbacks: () => api.get('/feedbacks/my-feedbacks'),
  getById: (id) => api.get(`/feedbacks/${id}`),
  reply: (id, data) => api.put(`/feedbacks/${id}/reply`, data),
  delete: (id) => api.delete(`/feedbacks/${id}`)
};

export default api;
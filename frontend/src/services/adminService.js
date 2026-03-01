import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  validateProvider: (userId) => api.put(`/admin/users/${userId}/validate`),
  banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getFraudLogs: (params) => api.get('/admin/fraud-logs', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getRecentActivity: () => api.get('/admin/activity'),
};

export default adminService;

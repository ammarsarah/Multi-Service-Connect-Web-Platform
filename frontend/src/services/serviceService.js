import api from './api';

const serviceService = {
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
  searchServices: (query, filters) => api.get('/services/search', { params: { q: query, ...filters } }),
  getMyServices: () => api.get('/services/my'),
  getCategories: () => api.get('/services/categories'),
  getFeaturedServices: () => api.get('/services/featured'),
  getServiceReviews: (id) => api.get(`/services/${id}/reviews`),
  addReview: (id, data) => api.post(`/services/${id}/reviews`, data),
};

export default serviceService;

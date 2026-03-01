import api from './api';

const requestService = {
  createRequest: (data) => api.post('/requests', data),
  getMyRequests: (params) => api.get('/requests/my', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateRequestStatus: (id, status, reason) =>
    api.put(`/requests/${id}/status`, { status, reason }),
  completeRequest: (id) => api.put(`/requests/${id}/complete`),
  cancelRequest: (id, reason) => api.put(`/requests/${id}/cancel`, { reason }),
  getProviderRequests: (params) => api.get('/requests/provider', { params }),
  addMessage: (id, message) => api.post(`/requests/${id}/messages`, { message }),
};

export default requestService;

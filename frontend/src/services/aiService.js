import api from './api';

const aiService = {
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  getMatching: (serviceId) => api.get(`/ai/matching/${serviceId}`),
  sendChatMessage: (message, conversationHistory = []) =>
    api.post('/ai/chat', { message, history: conversationHistory }),
  getServiceSuggestions: (query) => api.get('/ai/suggestions', { params: { q: query } }),
};

export default aiService;

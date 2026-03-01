import api from './api';

const paymentService = {
  createPaymentIntent: (requestId) =>
    api.post('/payments/create-intent', { requestId }),
  confirmPayment: (paymentIntentId, paymentMethodId) =>
    api.post('/payments/confirm', { paymentIntentId, paymentMethodId }),
  getMyTransactions: (params) => api.get('/payments/transactions', { params }),
  getTransactionById: (id) => api.get(`/payments/transactions/${id}`),
  requestRefund: (transactionId, reason) =>
    api.post(`/payments/transactions/${transactionId}/refund`, { reason }),
  getEarnings: (params) => api.get('/payments/earnings', { params }),
  getEarningsSummary: () => api.get('/payments/earnings/summary'),
};

export default paymentService;

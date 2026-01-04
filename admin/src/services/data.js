import api from './api';

export const dataService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  // Users
  getUsers: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/api/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Withdrawals
  getWithdrawals: async (page = 1, limit = 10, status = '') => {
    const response = await api.get('/api/withdrawals', {
      params: { page, limit, status },
    });
    return response.data;
  },

  updateWithdrawalStatus: async (id, status) => {
    const response = await api.patch(`/api/withdrawals/${id}/status`, { status });
    return response.data;
  },
};


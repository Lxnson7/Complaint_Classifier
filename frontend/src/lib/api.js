import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Methods
export const complaintAPI = {
  // Classify a complaint
  classify: async (complaint, customerId = null) => {
    const response = await api.post('/api/classify', {
      complaint,
      customer_id: customerId,
    });
    return response.data;
  },

  // Classify multiple complaints
  classifyBatch: async (complaints) => {
    const response = await api.post('/api/classify/batch', complaints);
    return response.data;
  },

  // Get all complaints
  getAllComplaints: async (limit = 100, offset = 0) => {
    const response = await api.get('/api/complaints', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const response = await api.get(`/api/complaints/${id}`);
    return response.data;
  },

  // Get complaints by category
  getComplaintsByCategory: async (category) => {
    const response = await api.get(`/api/complaints/category/${category}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },

  // Get detailed statistics
  getDetailedStats: async () => {
    const response = await api.get('/api/stats/detailed');
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Analyze complaint (debug)
  analyzeComplaint: async (complaint, customerId = null) => {
    const response = await api.post('/api/analyze', {
      complaint,
      customer_id: customerId,
    });
    return response.data;
  },

  // Reset data
  resetData: async () => {
    const response = await api.delete('/api/reset');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/<project>/us-central1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get idToken from auth (will be set by AuthContext)
    const token = localStorage.getItem('idToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Stripe endpoints
export const stripeAPI = {
  createCheckoutSession: async (userId, planId) => {
    const response = await apiClient.post('/stripe/createCheckoutSession', {
      userId,
      planId,
    });
    return response.data;
  },
  getBillingPortalUrl: async (userId) => {
    const response = await apiClient.get('/stripe/billingPortalUrl', {
      params: { userId },
    });
    return response.data;
  },
};

// AI endpoints
export const aiAPI = {
  generatePosts: async (userId, niche, goal, tone, count) => {
    const response = await apiClient.post('/ai/generatePosts', {
      userId,
      niche,
      goal,
      tone,
      count,
    });
    return response.data;
  },
};

// OAuth endpoints
export const oauthAPI = {
  getOAuthUrl: async (platform, userId) => {
    const response = await apiClient.get('/oauth/getOAuthUrl', {
      params: { platform, userId },
    });
    return response.data;
  },
};

export default apiClient;


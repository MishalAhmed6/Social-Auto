import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/<project>/us-central1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get idToken from auth (will be set by AuthContext)
    const token = localStorage.getItem('idToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasAuth: !!token,
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    if (error.config) {
      console.error('API Error:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

// Stripe endpoints
export const stripeAPI = {
  createCheckoutSession: async (userId, planId) => {
    const response = await apiClient.post('/createCheckoutSession', {
      userId,
      planId,
    });
    return response.data;
  },
  getBillingPortalUrl: async (userId) => {
    const response = await apiClient.get('/getBillingPortalUrl', {
      params: { userId },
    });
    return response.data;
  },
  syncSubscription: async (userId, sessionId = null) => {
    const response = await apiClient.post('/syncSubscription', {
      userId,
      sessionId,
    });
    return response.data;
  },
};

// AI endpoints
export const aiAPI = {
  generatePosts: async (userId, niche, goal, tone, count) => {
    const response = await apiClient.post('/generatePosts', {
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
    const response = await apiClient.get('/getOAuthUrl', {
      params: { platform, userId },
    });
    return response.data;
  },
  oauthCallback: async (platform, code, state) => {
    const response = await apiClient.get('/oauthCallback', {
      params: { platform, code, state },
    });
    return response.data;
  },
};

export default apiClient;


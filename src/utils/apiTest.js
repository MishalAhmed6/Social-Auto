import apiClient from '../api/cloudFunctions';

/**
 * Test if Cloud Functions API is reachable
 */
export const testApiConnection = async () => {
  try {
    // Try a simple GET request to check connectivity
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/<project>/us-central1';
    console.log('Testing API connection to:', baseURL);
    
    // Note: This assumes there's a health check endpoint or we can catch the error
    const response = await fetch(`${baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      baseURL: import.meta.env.VITE_API_BASE_URL 
    };
  }
};


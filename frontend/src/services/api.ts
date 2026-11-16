import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hillguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for consistent error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (typeof message === 'string' && (message.startsWith('{') || message.startsWith('['))) {
      try {
        const parsed = JSON.parse(message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          message = parsed.map((p: any) => p.message).join(', ');
        } else if (parsed?.message) {
          message = parsed.message;
        }
      } catch {}
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

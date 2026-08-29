import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data?.error || {
      code: 'REQUEST_FAILED',
      message: error.message || 'An error occurred while contacting the server.',
    };

    // If 401 Unauthorized, optionally clear token
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        // Token expired or invalid
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default api;

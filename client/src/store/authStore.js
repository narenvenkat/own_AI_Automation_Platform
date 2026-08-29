import { create } from 'zustand';
import api from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('agentflow_token');
    const storedUser = localStorage.getItem('agentflow_user');

    if (storedToken) {
      set({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: true,
      });

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data) {
          localStorage.setItem('agentflow_user', JSON.stringify(response.data));
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        }
      } catch (err) {
        console.warn('[AuthStore] Session verification failed, clearing credentials:', err);
        get().logout();
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      return { success: false, error: err.message || 'Registration failed' };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));

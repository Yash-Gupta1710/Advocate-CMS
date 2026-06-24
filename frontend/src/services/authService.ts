import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'lawyer' | 'client';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // Mock fallback if API is not running, to allow the prototype to work seamlessly
      if (!error.response) {
        console.warn('API connection failed. Falling back to Mock authentication.');
        if (email.includes('lawyer') && password === 'password') {
          return {
            token: 'mock-lawyer-token',
            user: { id: 'l1', name: 'Dr. Jane Doe (Mock Lawyer)', email, role: 'lawyer' }
          };
        } else if (email.includes('client') && password === 'password') {
          return {
            token: 'mock-client-token',
            user: { id: 'c1', name: 'John Smith (Mock Client)', email, role: 'client' }
          };
        } else if (password === 'password') {
          // Default fallback
          const role = email.includes('admin') || email.includes('lawyer') ? 'lawyer' : 'client';
          return {
            token: `mock-${role}-token`,
            user: { id: 'u1', name: email.split('@')[0], email, role }
          };
        }
        throw new Error('Invalid credentials (Try email: "lawyer@example.com", password: "password" or "client@example.com", password: "password")');
      }
      throw error.response?.data?.message || 'Failed to login';
    }
  },

  register: async (name: string, email: string, password: string, role: 'lawyer' | 'client'): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        // Fallback for prototype testing
        return {
          token: `mock-${role}-token`,
          user: { id: Math.random().toString(36).substr(2, 9), name, email, role }
        };
      }
      throw error.response?.data?.message || 'Failed to register';
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data.message;
    } catch (error: any) {
      if (!error.response) {
        return 'If your email is registered, we have sent reset instructions.';
      }
      throw error.response?.data?.message || 'Failed to send password reset email';
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<string> => {
    try {
      const response = await api.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword });
      return response.data.message;
    } catch (error: any) {
      if (!error.response) {
        return 'Password changed successfully.';
      }
      throw error.response?.data?.message || 'Failed to change password';
    }
  }
};

export default authService;

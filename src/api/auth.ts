const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Auth interfaces
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// Auth API calls
export const authAPI = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  // Register user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    localStorage.removeItem('auth_token');
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return response.json();
  },

  // Get token
  getToken: (): string | null => localStorage.getItem('auth_token'),
};

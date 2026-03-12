import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../../types/auth.types';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
    
    // Normalize user data
    const normalizedData: AuthResponse = {
      token: data.token,
      message: data.message,
      user: {
        id: data.user?.userId || data.user?.id || data.userId || data.id,
        username: data.user?.username || data.username || '',
        email: data.user?.email || data.email || '',
        online: data.user?.online || data.online,
        createdAt: data.user?.createdAt || data.createdAt,
      }
    };
    
    return normalizedData;
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
    
    // Normalize user data
    const normalizedData: AuthResponse = {
      token: data.token,
      message: data.message,
      user: {
        id: data.user?.userId || data.user?.id || data.userId || data.id,
        username: data.user?.username || data.username || '',
        email: data.user?.email || data.email || '',
        online: data.user?.online || data.online,
        createdAt: data.user?.createdAt || data.createdAt,
      }
    };
    
    return normalizedData;
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
    
    const data = await response.json();
    console.log('📥 getCurrentUser response:', data);
    
    // Normalize the response - backend might return userId instead of id
    const normalizedUser: User = {
      id: data.userId || data.id || data.user?.userId || data.user?.id,
      username: data.username || data.user?.username || '',
      email: data.email || data.user?.email || '',
      online: data.online || data.user?.online,
      createdAt: data.createdAt || data.user?.createdAt,
    };
    
    console.log('✅ Normalized user:', normalizedUser);
    
    return { user: normalizedUser };
  },

  // Get token
  getToken: (): string | null => localStorage.getItem('auth_token'),
};

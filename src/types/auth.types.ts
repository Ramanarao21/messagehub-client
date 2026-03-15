export interface User {
  id: string | number;
  username: string;
  email: string;
  online?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthError {
  error: string;
  details?: Record<string, string | null>;
}

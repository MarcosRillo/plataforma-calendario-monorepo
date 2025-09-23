/**
 * Authentication Service
 * Service functions for authentication-related API calls
 */

import { apiClient } from '@/lib/api';
import { User } from '@/types/user.types';

interface LoginCredentials extends Record<string, unknown> {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Login with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  return await apiClient.get<User>('/v1/auth/me');
};

/**
 * Logout user (if backend supports logout endpoint)
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post<void>('/v1/auth/logout');
};

/**
 * Refresh user token (if backend supports token refresh)
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  return await apiClient.post<LoginResponse>('/v1/auth/refresh');
};

/**
 * Validate current token
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    await apiClient.get<User>('/v1/auth/me');
    return true;
  } catch {
    return false;
  }
};

const authService = {
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  validateToken,
};

export default authService;

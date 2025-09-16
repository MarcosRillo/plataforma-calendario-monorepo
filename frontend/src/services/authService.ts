/**
 * Authentication Service
 * Service functions for authentication-related API calls
 */

import { AxiosResponse, AxiosError } from 'axios';
import apiClient from './apiClient';
import {
  LoginCredentials,
  LoginResponse,
  User,
  ApiResponse,
} from '../types/category.types';

/**
 * Login with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await apiClient.post('/v1/auth/login', credentials);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/v1/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user (if backend supports logout endpoint)
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/v1/auth/logout');
  } catch {
    // Even if logout fails on server, we can still clear local data
  }
};

/**
 * Refresh user token (if backend supports token refresh)
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await apiClient.post('/v1/auth/refresh');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate current token
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    await apiClient.get('/v1/auth/me');
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

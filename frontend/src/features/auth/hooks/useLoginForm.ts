/**
 * Login Form Hook
 * Manages login form state and submission logic
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginCredentials, LoginFormState, LoginFormActions } from '@/types/auth.types';

export const useLoginForm = (): LoginFormState & LoginFormActions => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Clear error when credentials change
  useEffect(() => {
    if (error && (email || password)) {
      clearError();
    }
  }, [email, password, error, clearError]);

  // Computed state
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Actions
  const setEmailValue = (value: string) => {
    setEmail(value);
  };

  const setPasswordValue = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!isFormValid) return;

    const credentials: LoginCredentials = {
      email: email.trim(),
      password: password.trim(),
    };
    
    const success = await login(credentials);
    
    if (success) {
      router.push('/');
    }
  };

  const clearFormError = () => {
    clearError();
  };

  return {
    // State
    email,
    password,
    error,
    isLoading,
    isFormValid,

    // Actions
    setEmail: setEmailValue,
    setPassword: setPasswordValue,
    handleSubmit,
    clearError: clearFormError,
  };
};

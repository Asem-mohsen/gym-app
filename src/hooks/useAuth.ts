import { useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, SignupCredentials, ApiError } from '../types';
import { authService } from '../services';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials, gymSlug?: string) => Promise<void>;
  signup: (credentials: SignupCredentials, gymSlug?: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutFromAllSessions: () => Promise<void>;
  logoutFromOtherSessions: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

/**
 * Custom hook for authentication state management
 * Follows Single Responsibility Principle - handles only auth state
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await authService.getProfile();
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.message || 'Authentication check failed',
      }));
    }
  };

  const login = useCallback(async (credentials: LoginCredentials, gymSlug?: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const authUser = await authService.login(credentials, gymSlug);
      
      setState(prev => ({
        ...prev,
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials, gymSlug?: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const authUser = await authService.signup(credentials, gymSlug);
      
      setState(prev => ({
        ...prev,
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Signup failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authService.logout();
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Logout failed',
      }));
      throw error;
    }
  }, []);

  const logoutFromAllSessions = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authService.logoutFromAllSessions();
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Logout from all sessions failed',
      }));
      throw error;
    }
  }, []);

  const logoutFromOtherSessions = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authService.logoutFromOtherSessions();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Logout from other sessions failed',
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedUser = await authService.updateProfile(userData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Profile update failed',
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const user = await authService.getProfile();
      setState(prev => ({ ...prev, user }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error?.message || 'Failed to refresh user data',
      }));
    }
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    logoutFromAllSessions,
    logoutFromOtherSessions,
    updateProfile,
    clearError,
    refreshUser,
  };
};

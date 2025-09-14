import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { LoginCredentials, SignupCredentials, AuthUser, User, ApiResponse } from '../types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Follows Single Responsibility Principle
 */
export class AuthService extends BaseService {
  private static instance: AuthService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with email and password
   */
  public async login(credentials: LoginCredentials, gymSlug?: string): Promise<AuthUser> {
    try {
      const endpoint = this.getGymSlug() 
        ? API_ENDPOINTS.AUTH.LOGIN 
        : (gymSlug ? getGymApiEndpoints(gymSlug).AUTH.LOGIN : API_ENDPOINTS.AUTH.LOGIN);
      
      const response = await this.post<any>(endpoint, credentials);
      
      if (response.data && response.data.token) {
        await this.storeToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  public async signup(credentials: SignupCredentials, gymSlug?: string): Promise<AuthUser> {
    try {
      const endpoint = this.getGymSlug() 
        ? API_ENDPOINTS.AUTH.SIGNUP 
        : (gymSlug ? getGymApiEndpoints(gymSlug).AUTH.SIGNUP : API_ENDPOINTS.AUTH.SIGNUP);
      
      const response = await this.post<any>(endpoint, credentials);
      
      if (response.data && response.data.token) {
        await this.storeToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user and clear stored token
   * Logout routes are global and don't require gym slug
   */
  public async logout(): Promise<void> {
    try {
      // Logout routes are global and don't need gym context
      await this.postGlobal<AuthUser>(API_ENDPOINTS.AUTH.LOGOUT);
      
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed, but clearing local token');
    } finally {
      await this.clearStoredToken();
    }
  }

  /**
   * Logout from all sessions
   * Logout routes are global and don't require gym slug
   */
  public async logoutFromAllSessions(): Promise<void> {
    try {
      await this.postGlobal<AuthUser>(API_ENDPOINTS.AUTH.LOGOUT_ALL);
      
    } catch (error) {
      console.warn('Logout from all sessions failed, but clearing local token');
    } finally {
      await this.clearStoredToken();
    }
  }

  /**
   * Logout from other sessions (keep current session)
   * Logout routes are global and don't require gym slug
   */
  public async logoutFromOtherSessions(): Promise<void> {
    try {
      await this.postGlobal<AuthUser>(API_ENDPOINTS.AUTH.LOGOUT_OTHERS);
      
    } catch (error) {
      console.warn('Logout from other sessions failed');
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  public async getProfile(): Promise<User> {
    try {
      const response = await this.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await this.put<User>(API_ENDPOINTS.AUTH.PROFILE, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      // Optionally verify token with server
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<string> {
    try {
      const response = await this.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH);
      
      if (response.data && response.data.token) {
        await this.storeToken(response.data.token);
        return response.data.token;
      }
      
      throw new Error('No token received from refresh endpoint');
    } catch (error) {
      throw error;
    }
  }
}

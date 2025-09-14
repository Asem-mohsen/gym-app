import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getGymApiUrl } from '../constants/api';
import { ApiResponse, ApiError } from '../types';

/**
 * Base Service Class following Single Responsibility Principle
 * Handles all HTTP communication with the API
 */
export abstract class BaseService {
  protected api: AxiosInstance;
  protected gymSlug: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Set gym slug for gym-specific API calls
   */
  public setGymSlug(gymSlug: string): void {
    this.gymSlug = gymSlug;
    this.api.defaults.baseURL = getGymApiUrl(gymSlug, '');
  }

  /**
   * Get the original base URL for global API calls (like logout)
   */
  protected getGlobalBaseURL(): string {
    return API_CONFIG.BASE_URL;
  }

  /**
   * Get current gym slug
   */
  public getGymSlug(): string | null {
    return this.gymSlug;
  }

  /**
   * Setup request and response interceptors
   * Handles authentication token and error responses
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage and redirect to login
          await this.clearStoredToken();
          // You can emit an event here to notify the app to redirect to login
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Generic GET request
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<any>(url, config);
      
      // Check if response is HTML (error case)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL.');
      }
      
      // Handle different API response structures
      let result;
      
      if (response.data && typeof response.data === 'object') {
        // Check if it's the expected structure: { status: true, message: "...", data: [...] }
        if (response.data.hasOwnProperty('data') && response.data.hasOwnProperty('status')) {
          result = {
            data: response.data.data,
            message: response.data.message,
            success: response.data.status,
            status: response.data.status ? 'success' : 'error'
          };
        } 
        // Check if it's a direct array response
        else if (Array.isArray(response.data)) {
          result = {
            data: response.data,
            message: 'Success',
            success: true,
            status: 'success'
          };
        }
        // Check if it's a direct object response
        else {
          result = {
            data: response.data,
            message: 'Success',
            success: true,
            status: 'success'
          };
        }
      } else {
        result = {
          data: response.data,
          message: 'Success',
          success: true,
          status: 'success'
        };
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<any>(url, data, config);
      // Handle API response structure: { status: true, message: "...", data: [...] }
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.status,
        status: response.data.status ? 'success' : 'error'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Global POST request (uses original base URL, not gym-specific)
   */
  protected async postGlobal<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const originalBaseURL = this.api.defaults.baseURL;
      this.api.defaults.baseURL = this.getGlobalBaseURL();
      
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      
      // Restore original base URL
      this.api.defaults.baseURL = originalBaseURL;
      
      return response.data;
    } catch (error) {
      // Restore original base URL even on error
      this.api.defaults.baseURL = this.getGymSlug() ? getGymApiUrl(this.getGymSlug()!, '') : this.getGlobalBaseURL();
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get paginated data
   */
  protected async getPaginated<T>(
    url: string,
    page: number = 1,
    perPage: number = 10,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.api.get<ApiResponse<T[]>>(url, {
        ...config,
        params: {
          page,
          per_page: perPage,
          ...config?.params,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Store authentication token
   */
  protected async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get stored authentication token
   */
  protected async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication token
   */
  protected async clearStoredToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  /**
   * Handle API errors and convert to standardized format
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error. Please check your connection.',
        status: false,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: false,
      };
    }
  }
}

import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { Service, ApiResponse, PaginatedResponse } from '../types';

/**
 * Service Service (for gym services like personal training, massage, etc.)
 * Handles all service-related API calls
 * Follows Single Responsibility Principle
 */
export class ServiceService extends BaseService {
  private static instance: ServiceService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  /**
   * Get all services with pagination
   */
  public async getServices(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Service>> {
    try {
      const response = await this.getPaginated<Service>(
        API_ENDPOINTS.SERVICES.LIST,
        page,
        perPage
      );
      return response as PaginatedResponse<Service>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all services without pagination
   */
  public async getAllServices(gymSlug?: string): Promise<Service[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).SERVICES.LIST 
        : API_ENDPOINTS.SERVICES.LIST;
      
      const response = await this.get<Service[]>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  public async getServiceById(id: number): Promise<Service> {
    try {
      const response = await this.get<Service>(API_ENDPOINTS.SERVICES.DETAILS(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active services only
   */
  public async getActiveServices(gymSlug?: string): Promise<Service[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).SERVICES.LIST 
        : API_ENDPOINTS.SERVICES.LIST;
      
      const response = await this.get<Service[]>(endpoint, {
        params: { is_active: true }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get services by category
   */
  public async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const response = await this.get<Service[]>(API_ENDPOINTS.SERVICES.LIST, {
        params: { category }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search services by name or description
   */
  public async searchServices(query: string): Promise<Service[]> {
    try {
      const response = await this.get<Service[]>(API_ENDPOINTS.SERVICES.LIST, {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all available categories
   */
  public async getServiceCategories(): Promise<string[]> {
    try {
      const response = await this.get<string[]>('/services/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

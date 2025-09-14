import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { Class, ApiResponse, PaginatedResponse } from '../types';

/**
 * Class Service
 * Handles all class-related API calls
 * Follows Single Responsibility Principle
 */
export class ClassService extends BaseService {
  private static instance: ClassService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): ClassService {
    if (!ClassService.instance) {
      ClassService.instance = new ClassService();
    }
    return ClassService.instance;
  }

  /**
   * Get all classes with pagination
   */
  public async getClasses(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Class>> {
    try {
      const response = await this.getPaginated<Class>(
        API_ENDPOINTS.CLASSES.LIST,
        page,
        perPage
      );
      return response as PaginatedResponse<Class>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all classes without pagination
   */
  public async getAllClasses(gymSlug?: string): Promise<Class[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).CLASSES.LIST 
        : API_ENDPOINTS.CLASSES.LIST;
      
      const response = await this.get<Class[]>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get class by ID
   */
  public async getClassById(id: number): Promise<Class> {
    try {
      const response = await this.get<Class>(API_ENDPOINTS.CLASSES.DETAILS(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active classes only
   */
  public async getActiveClasses(): Promise<Class[]> {
    try {
      const response = await this.get<Class[]>(API_ENDPOINTS.CLASSES.LIST, {
        params: { is_active: true }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get classes by instructor
   */
  public async getClassesByInstructor(instructor: string): Promise<Class[]> {
    try {
      const response = await this.get<Class[]>(API_ENDPOINTS.CLASSES.LIST, {
        params: { instructor }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search classes by name or description
   */
  public async searchClasses(query: string): Promise<Class[]> {
    try {
      const response = await this.get<Class[]>(API_ENDPOINTS.CLASSES.LIST, {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upcoming classes
   */
  public async getUpcomingClasses(gymSlug?: string): Promise<Class[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).CLASSES.LIST 
        : API_ENDPOINTS.CLASSES.LIST;
      
      const response = await this.get<Class[]>(endpoint, {
        params: { upcoming: true }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

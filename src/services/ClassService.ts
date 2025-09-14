import { BaseService } from './BaseService';
import { getGymApiEndpoints } from '../constants/api';
import { Class } from '../types';

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
   * Get all classes without pagination
   */
  public async getAllClasses(gymSlug: string): Promise<Class[]> {
    try {
      const endpoint = getGymApiEndpoints(gymSlug).CLASSES.LIST;
      
      const response = await this.get<Class[]>(endpoint);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get class details by ID
   */
  public async getClassDetails(id: number, gymSlug: string): Promise<any> {
    try {
      // Set the gym slug for this request
      this.setGymSlug(gymSlug);
      
      const endpoint = getGymApiEndpoints(gymSlug).CLASSES.DETAILS(id);
      
      return await this.get<any>(endpoint);
      
    } catch (error) {
      console.error('ClassService getClassDetails error:', error);
      throw error;
    }
  }
}

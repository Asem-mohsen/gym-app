import { BaseService } from './BaseService';
import { API_ENDPOINTS, API_CONFIG } from '../constants/api';
import { Gym, ApiResponse } from '../types';

/**
 * Gym Service
 * Handles all gym-related API calls
 * Follows Single Responsibility Principle
 */
export class GymService extends BaseService {
  private static instance: GymService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): GymService {
    if (!GymService.instance) {
      GymService.instance = new GymService();
    }
    return GymService.instance;
  }

  /**
   * Get all available gyms
   */
  public async getGyms(): Promise<Gym[]> {
    try {
      console.log('Fetching gyms from:', API_ENDPOINTS.GYMS.LIST);
      const response = await this.get<Gym[]>(API_ENDPOINTS.GYMS.LIST);
      console.log('Gym API response:', response);
      return response.data;
    } catch (error) {
      console.error('GymService.getGyms() error:', error);
      throw error;
    }
  }

  /**
   * Get gym by slug
   */
  public async getGymBySlug(slug: string): Promise<Gym> {
    try {
      const response = await this.get<Gym>(`/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

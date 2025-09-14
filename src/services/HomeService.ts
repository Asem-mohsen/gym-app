import { BaseService } from './BaseService';
import { API_CONFIG } from '../constants/api';

export interface HomeData {
  memberships: any[];
  trainers: any[];
  galleries: any[];
  classes: any[];
  branches: any[];
}

/**
 * Home Service
 * Handles home page data API calls
 * Follows Single Responsibility Principle
 */
export class HomeService extends BaseService {
  private static instance: HomeService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): HomeService {
    if (!HomeService.instance) {
      HomeService.instance = new HomeService();
    }
    return HomeService.instance;
  }

  /**
   * Get home page data for a specific gym
   */
  public async getHomeData(gymSlug: string): Promise<HomeData> {
    try {
      const response = await this.get<HomeData>(`/${gymSlug}`);
      return response.data;
    } catch (error) {
      console.error('HomeService.getHomeData() error:', error);
      throw error;
    }
  }
}

export const homeService = HomeService.getInstance();

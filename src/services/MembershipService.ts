import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { Membership } from '../types';

/**
 * Membership Service
 * Handles all membership-related API calls
 * Follows Single Responsibility Principle
 */
export class MembershipService extends BaseService {
  private static instance: MembershipService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): MembershipService {
    if (!MembershipService.instance) {
      MembershipService.instance = new MembershipService();
    }
    return MembershipService.instance;
  }

  /**
   * Get all memberships without pagination
   */
  public async getAllMemberships(gymSlug?: string): Promise<Membership[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).MEMBERSHIPS.LIST 
        : API_ENDPOINTS.MEMBERSHIPS.LIST;
      
      const response = await this.get<Membership[]>(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('MembershipService getAllMemberships error:', error);
      throw error;
    }
  }

  /**
   * Get membership details with trainers, user subscription, and branches
   */
  public async getMembershipDetails(id: number, gymSlug: string): Promise<any> {
    try {
      // Set the gym slug for this request
      this.setGymSlug(gymSlug);
      
      const endpoint = getGymApiEndpoints(gymSlug).MEMBERSHIPS.DETAILS(id);
      
      return await this.get<any>(endpoint);
    } catch (error) {
      console.error('MembershipService getMembershipDetails error:', error);
      throw error;
    }
  }
}

import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { Membership, ApiResponse, PaginatedResponse } from '../types';

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
   * Get all memberships with pagination
   */
  public async getMemberships(page: number = 1, perPage: number = 10, gymSlug?: string): Promise<PaginatedResponse<Membership>> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).MEMBERSHIPS.LIST 
        : API_ENDPOINTS.MEMBERSHIPS.LIST;
      
      const response = await this.getPaginated<Membership>(
        endpoint,
        page,
        perPage
      );
      return response as PaginatedResponse<Membership>;
    } catch (error) {
      throw error;
    }
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
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get membership by ID
   */
  public async getMembershipById(id: number): Promise<Membership> {
    try {
      const response = await this.get<Membership>(API_ENDPOINTS.MEMBERSHIPS.DETAILS(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active memberships only
   */
  public async getActiveMemberships(gymSlug?: string): Promise<Membership[]> {
    try {
      const endpoint = gymSlug 
        ? getGymApiEndpoints(gymSlug).MEMBERSHIPS.LIST 
        : API_ENDPOINTS.MEMBERSHIPS.LIST;
      
      const response = await this.get<Membership[]>(endpoint, {
        params: { is_active: true }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search memberships by name or description
   */
  public async searchMemberships(query: string): Promise<Membership[]> {
    try {
      const response = await this.get<Membership[]>(API_ENDPOINTS.MEMBERSHIPS.LIST, {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

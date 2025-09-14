import { BaseService } from './BaseService';
import { API_ENDPOINTS, getGymApiEndpoints } from '../constants/api';
import { Service, ApiResponse, PaginatedResponse, ServiceApiResponse } from '../types';

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
   * Get all services without pagination
   */
  public async getAllServices(gymSlug : string): Promise<ServiceApiResponse> {
    try {
      const endpoint = getGymApiEndpoints(gymSlug).SERVICES.LIST;
      console.log('ServiceService: Making request to endpoint:', endpoint);
      
      const response = await this.get<{services: Service[], booking_types: string[]}>(endpoint);
      console.log('ServiceService: Raw response from BaseService:', JSON.stringify(response, null, 2));
      
      const result: ServiceApiResponse = {
        status: true,
        message: response.message || 'Services retrieved successfully',
        data: response.data
      };
      console.log('ServiceService: Processed result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('ServiceService: Error in getAllServices:', error);
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  public async getServiceById(id: number, gymSlug: string): Promise<Service> {
    try {
      const response = await this.get<Service>(getGymApiEndpoints(gymSlug).SERVICES.DETAILS(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

}

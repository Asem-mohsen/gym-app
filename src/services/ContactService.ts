import { BaseService } from './BaseService';
import { getGymApiEndpoints } from '../constants/api';
import { ContactData, ContactApiResponse, ContactFormData, ApiResponse } from '../types';

/**
 * Contact Service
 * Handles all contact-related API calls
 * Follows Single Responsibility Principle
 */
export class ContactService extends BaseService {
  private static instance: ContactService | null = null;

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  /**
   * Get contact information for a gym
   */
  public async getContactInfo(gymSlug: string): Promise<ContactData> {
    try {
      this.setGymSlug(gymSlug);
      
      const endpoint = getGymApiEndpoints(gymSlug).CONTACT.INFO;
      
      const response = await this.get<ContactData>(endpoint);
      
      return response.data;
    } catch (error) {
      console.error('ContactService: Error in getContactInfo:', error);
      throw error;
    }
  }

  /**
   * Submit contact form
   */
  public async submitContactForm(gymSlug: string, formData: ContactFormData): Promise<ApiResponse<any>> {
    try {
      this.setGymSlug(gymSlug);
      
      const endpoint = getGymApiEndpoints(gymSlug).CONTACT.SUBMIT;
      
      const response = await this.post<ApiResponse<any>>(endpoint, formData);
      
      return response.data;
    } catch (error) {
      console.error('ContactService: Error in submitContactForm:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contactService = ContactService.getInstance();

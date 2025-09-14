// Export all services for easy importing
export { BaseService } from './BaseService';
export { GymService } from './GymService';
export { AuthService } from './AuthService';
export { MembershipService } from './MembershipService';
export { ClassService } from './ClassService';
export { ServiceService } from './ServiceService';
export { HomeService } from './HomeService';

// Import classes for instance creation
import { GymService } from './GymService';
import { AuthService } from './AuthService';
import { MembershipService } from './MembershipService';
import { ClassService } from './ClassService';
import { ServiceService } from './ServiceService';
import { HomeService } from './HomeService';

// Export service instances for singleton usage
export const gymService = GymService.getInstance();
export const authService = AuthService.getInstance();
export const membershipService = MembershipService.getInstance();
export const classService = ClassService.getInstance();
export const serviceService = ServiceService.getInstance();
export const homeService = HomeService.getInstance();

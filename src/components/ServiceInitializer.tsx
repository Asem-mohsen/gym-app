import React from 'react';
import { useGymContext } from '../contexts/GymContext';
import { authService, membershipService, classService, serviceService } from '../services';

/**
 * Service Initializer Component
 * Updates all services with the selected gym slug when gym changes
 * Follows Single Responsibility Principle - handles only service initialization
 */
export const ServiceInitializer: React.FC = () => {
  const { selectedGym } = useGymContext();

  React.useEffect(() => {
    if (selectedGym) {
      // Update all services with the selected gym slug
      authService.setGymSlug(selectedGym.slug);
      membershipService.setGymSlug(selectedGym.slug);
      classService.setGymSlug(selectedGym.slug);
      serviceService.setGymSlug(selectedGym.slug);
    }
  }, [selectedGym]);

  return null; // This component doesn't render anything
};

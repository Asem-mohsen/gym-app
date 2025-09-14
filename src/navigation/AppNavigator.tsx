import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useGymContext } from '../contexts/GymContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { GymSelectionScreen } from '../screens/gym/GymSelectionScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { Loader } from '../components/ui';

/**
 * Root App Navigator
 * Handles authentication state and routes between gym selection, auth and main flows
 * Follows Single Responsibility Principle - handles only app-level navigation
 * Using simple conditional rendering instead of React Navigation to avoid gesture handler issues
 */
export const AppNavigator: React.FC = () => {
  const { isLoading: authLoading } = useAuthContext();
  const { selectedGym, isLoading: gymLoading } = useGymContext();
  const { setActiveTab } = useNavigationContext();

  if (authLoading || gymLoading) {
    return <Loader variant="overlay" message="Loading..." />;
  }

  return <MainNavigator />;
};

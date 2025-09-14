import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGymContext } from './GymContext';

type MainTab = 'Home' | 'Memberships' | 'Classes' | 'Services' | 'Profile' | 'SignIn' | 'GymSelection';

interface NavigationState {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * Navigation Context Provider
 * Manages tab navigation state across the app
 * Follows Single Responsibility Principle - handles only navigation state
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const { selectedGym } = useGymContext();
  const [activeTab, setActiveTab] = useState<MainTab>('Home');

  // Set initial tab based on gym selection
  useEffect(() => {
    if (!selectedGym) {
      setActiveTab('GymSelection');
    } else {
      setActiveTab('Home');
    }
  }, [selectedGym]);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use navigation context
 * Throws error if used outside NavigationProvider
 */
export const useNavigationContext = (): NavigationState => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};

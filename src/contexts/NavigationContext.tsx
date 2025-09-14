import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGymContext } from './GymContext';

type MainTab = 'Home' | 'Memberships' | 'Classes' | 'Services' | 'Profile' | 'SignIn' | 'GymSelection';

interface NavigationParams {
  [key: string]: any;
}

interface NavigationState {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  navigationParams: NavigationParams;
  setNavigationParams: (params: NavigationParams) => void;
  navigate: (tab: MainTab, params?: NavigationParams) => void;
  goBack: () => void;
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
  const [navigationParams, setNavigationParams] = useState<NavigationParams>({});
  const [navigationHistory, setNavigationHistory] = useState<Array<{ tab: MainTab; params: NavigationParams }>>([]);

  // Set initial tab based on gym selection
  useEffect(() => {
    if (!selectedGym) {
      setActiveTab('GymSelection');
    } else {
      setActiveTab('Home');
    }
  }, [selectedGym]);

  const navigate = (tab: MainTab, params?: NavigationParams) => {
    // Add current state to history
    setNavigationHistory(prev => [...prev, { tab: activeTab, params: navigationParams }]);
    
    setActiveTab(tab);
    if (params) {
      setNavigationParams(params);
    } else {
      setNavigationParams({});
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActiveTab(previousState.tab);
      setNavigationParams(previousState.params);
    }
  };

  return (
    <NavigationContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      navigationParams, 
      setNavigationParams, 
      navigate, 
      goBack 
    }}>
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

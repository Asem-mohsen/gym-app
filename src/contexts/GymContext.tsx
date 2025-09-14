import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gym } from '../types';

interface GymContextType {
  selectedGym: Gym | null;
  setSelectedGym: (gym: Gym | null) => Promise<void>;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

interface GymProviderProps {
  children: ReactNode;
}

/**
 * Gym Context Provider
 * Manages the selected gym state across the app
 * Follows Single Responsibility Principle - handles only gym selection state
 */
export const GymProvider: React.FC<GymProviderProps> = ({ children }) => {
  const [selectedGym, setSelectedGymState] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSelectedGym = async (gym: Gym | null): Promise<void> => {
    try {
      if (gym) {
        await AsyncStorage.setItem('selected_gym', JSON.stringify(gym));
        setSelectedGymState(gym);
      } else {
        await AsyncStorage.removeItem('selected_gym');
        setSelectedGymState(null);
      }
    } catch (error) {
      console.error('Error saving selected gym:', error);
    }
  };

  // Load selected gym on app start
  React.useEffect(() => {
    const loadSelectedGym = async (): Promise<void> => {
      try {
        const storedGym = await AsyncStorage.getItem('selected_gym');
        if (storedGym) {
          setSelectedGymState(JSON.parse(storedGym));
        }
      } catch (error) {
        console.error('Error loading selected gym:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedGym();
  }, []);

  return (
    <GymContext.Provider value={{ selectedGym, setSelectedGym, isLoading }}>
      {children}
    </GymContext.Provider>
  );
};

/**
 * Hook to use gym context
 * Throws error if used outside GymProvider
 */
export const useGymContext = (): GymContextType => {
  const context = useContext(GymContext);
  
  if (context === undefined) {
    throw new Error('useGymContext must be used within a GymProvider');
  }
  
  return context;
};

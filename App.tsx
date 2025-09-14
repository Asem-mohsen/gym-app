/**
 * GymApp - React Native Mobile Application
 * Connected to Laravel API backend
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GymProvider } from './src/contexts/GymContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { NavigationProvider } from './src/contexts/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ServiceInitializer } from './src/components/ServiceInitializer';

/**
 * Main App Component
 * Wraps the entire application with gym and authentication context and navigation
 */
function App(): React.JSX.Element {
  return (
    <GymProvider>
      <AuthProvider>
        <NavigationProvider>
          <ServiceInitializer />
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <AppNavigator />
        </NavigationProvider>
      </AuthProvider>
    </GymProvider>
  );
}

export default App;

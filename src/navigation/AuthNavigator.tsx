import React, { useState } from 'react';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

type AuthScreen = 'Login' | 'Signup';

/**
 * Authentication Navigator
 * Handles navigation for unauthenticated users
 * Follows Single Responsibility Principle - handles only auth navigation
 * Using simple state-based navigation instead of React Navigation
 */
export const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('Login');

  const navigateToSignup = () => setCurrentScreen('Signup');
  const navigateToLogin = () => setCurrentScreen('Login');

  if (currentScreen === 'Signup') {
    return <SignupScreen onNavigateToLogin={navigateToLogin} />;
  }

  return <LoginScreen onNavigateToSignup={navigateToSignup} />;
};

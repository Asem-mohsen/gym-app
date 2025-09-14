import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MembershipListScreen } from '../screens/memberships/MembershipListScreen';
import { ClassListScreen } from '../screens/classes/ClassListScreen';
import { ServiceListScreen } from '../screens/services/ServiceListScreen';
import { GymSelectionScreen } from '../screens/gym/GymSelectionScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';

type MainTab = 'Home' | 'Memberships' | 'Classes' | 'Services' | 'Profile' | 'SignIn' | 'GymSelection';

/**
 * Main Tab Navigator
 * Handles navigation for authenticated users using simple state-based navigation
 * Follows Single Responsibility Principle - handles only main navigation
 */
export const MainNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { activeTab, setActiveTab } = useNavigationContext();

  const renderTabIcon = (tabName: MainTab, focused: boolean) => {
    const color = focused ? '#007AFF' : '#8E8E93';
    
    // Use text-based icons as fallback
    const getIconText = (tab: MainTab) => {
      switch (tab) {
        case 'Home':
          return '🏠';
        case 'Memberships':
          return '💳';
        case 'Classes':
          return '🏃';
        case 'Services':
          return '⚙️';
        case 'Profile':
          return '👤';
        case 'SignIn':
          return '🔐';
        case 'GymSelection':
          return '🏢';
        default:
          return '❓';
      }
    };

    return (
      <Text style={[styles.iconText, { color }]}>
        {getIconText(tabName)}
      </Text>
    );
  };

  const renderContent = () => {
    // Create mock navigation object for screens that expect it
    const mockNavigation = {
      navigate: () => {},
      goBack: () => {},
      reset: () => {},
      setParams: () => {},
      dispatch: () => {},
      canGoBack: () => false,
      isFocused: () => true,
      addListener: () => () => {},
      removeListener: () => {},
      getParent: () => undefined,
      getState: () => ({ routes: [], index: 0, routeNames: [], type: 'stack' }),
      getId: () => 'mock-navigation',
    };


    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Memberships':
        return <MembershipListScreen navigation={mockNavigation as any} />;
      case 'Classes':
        return <ClassListScreen navigation={mockNavigation as any} />;
      case 'Services':
        return <ServiceListScreen navigation={mockNavigation as any} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'SignIn':
        return <SignInScreen />;
      case 'GymSelection':
        return <GymSelectionScreen onNavigateToHome={() => setActiveTab('Home')} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <View style={styles.tabBar}>
        {(isAuthenticated 
          ? ['Home', 'Memberships', 'Classes', 'Services', 'Profile'] 
          : ['Home', 'Memberships', 'Classes', 'Services', 'GymSelection', 'SignIn']
        ).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab as MainTab)}
          >
            {renderTabIcon(tab as MainTab, activeTab === tab)}
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab ? '#007AFF' : '#8E8E93' }
            ]}>
              {tab === 'SignIn' ? 'Sign In' : tab === 'GymSelection' ? 'Gyms' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  iconText: {
    fontSize: 20,
  },
});

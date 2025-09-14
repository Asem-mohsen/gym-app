import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MembershipListScreen } from '../screens/memberships/MembershipListScreen';
import MembershipDetailsScreen from '../screens/memberships/MembershipDetailsScreen';
import { ClassListScreen } from '../screens/classes/ClassListScreen';
import ClassDetailsScreen from '../screens/classes/ClassDetailsScreen';
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
  const { activeTab, setActiveTab, navigationParams, setNavigationParams, goBack } = useNavigationContext();
  const [lastTabPress, setLastTabPress] = useState<{ tab: string; time: number } | null>(null);

  const handleTabPress = (tab: string) => {
    const now = Date.now();
    const isDoubleClick = lastTabPress && 
      lastTabPress.tab === tab && 
      (now - lastTabPress.time) < 500; // 500ms double-click threshold

    if (isDoubleClick && tab === 'Memberships' && navigationParams.membershipId) {
      // Double-click on Memberships tab while in details page - go to list
      setNavigationParams({});
      setActiveTab(tab as MainTab);
    } else {
      // Normal tab press
      setActiveTab(tab as MainTab);
    }

    setLastTabPress({ tab, time: now });
  };

  const renderTabIcon = (tabName: MainTab, focused: boolean) => {
    const color = focused ? '#007AFF' : '#8E8E93';
    const size = 22;
    
    // Use Ionicons for better UX
    const getIconName = (tab: MainTab) => {
      switch (tab) {
        case 'Home':
          return focused ? 'home' : 'home-outline';
        case 'Memberships':
          return focused ? 'card' : 'card-outline';
        case 'Classes':
          return focused ? 'fitness' : 'fitness-outline';
        case 'Services':
          return focused ? 'settings' : 'settings-outline';
        case 'Profile':
          return focused ? 'person' : 'person-outline';
        case 'SignIn':
          return focused ? 'log-in' : 'log-in-outline';
        case 'GymSelection':
          return focused ? 'business' : 'business-outline';
        default:
          return 'help-outline';
      }
    };

    return (
      <Icon 
        name={getIconName(tabName)} 
        size={size} 
        color={color} 
      />
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
        if (navigationParams.membershipId) {
          return <MembershipDetailsScreen />;
        }
        return <MembershipListScreen navigation={mockNavigation as any} />;
      case 'Classes':
        if (navigationParams.classId) {
          return <ClassDetailsScreen />;
        }
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
            onPress={() => handleTabPress(tab)}
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

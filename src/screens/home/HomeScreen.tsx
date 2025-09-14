import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGymContext } from '../../contexts/GymContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { homeService } from '../../services';
import { Membership, Class, Service } from '../../types';
import { Card, Loader, ErrorMessage, Button, Modal, HeroBanner, Slider, MotivationBanner } from '../../components/ui';
import { ContactModal } from '../../components/ContactModal';
import { LoginScreen } from '../auth/LoginScreen';
import { SignupScreen } from '../auth/SignupScreen';
import { fixImageUrl } from '../../constants/api';
import { heroImages, classImages, serviceImages } from '../../assets/images/placeholders';

/**
 * Home Screen Component
 * Displays overview of gym services and user information
 * Follows Single Responsibility Principle - handles only home screen display
 */
export const HomeScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { selectedGym } = useGymContext();
  const { setActiveTab, navigate } = useNavigationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [featuredMemberships, setFeaturedMemberships] = useState<Membership[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<Class[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);

  const loadData = async (): Promise<void> => {
    try {
      setError(null);
      
      if (selectedGym) {

        const homeData = await homeService.getHomeData(selectedGym.slug);

        setFeaturedMemberships(homeData.memberships.slice(0, 3));
        setUpcomingClasses(homeData.classes.slice(0, 3));
        setPopularServices(homeData.trainers.slice(0, 3));
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading..." />;
  }

  const renderMainContent = () => {
    const heroSlides = [
      {
        id: 'memberships',
        image: heroImages.memberships,
        title: 'Premium Memberships',
        subtitle: 'Choose the perfect plan for your fitness journey',
        actionText: 'View Memberships',
        actionIcon: 'card-membership',
        onPress: () => {
          setActiveTab('Memberships');
        },
      },
      {
        id: 'classes',
        image: heroImages.classes,
        title: 'Group Classes',
        subtitle: 'Join our amazing group fitness classes',
        actionText: 'View Classes',
        actionIcon: 'fitness-center',
        onPress: () => {
          setActiveTab('Classes');
        },
      },
    ];

    return (
      <>
        {/* Hero Banner */}
        <HeroBanner slides={heroSlides} />

        {error && <ErrorMessage message={error} />}

        {/* Featured Memberships Slider */}
        <Slider
          title="Featured Memberships"
          items={featuredMemberships.map((membership, index) => ({
            id: membership.id || index,
            title: membership.name || 'Membership',
            subtitle: `${membership.general_description || 'No description available'}\n$${membership.price || '0'} • ${membership.period || 'N/A'}`,
            image: heroImages.memberships, // Using hero image as placeholder
            onPress: () => {
              navigate('Memberships', { membershipId: membership.id });
            },
          }))}
          renderItem={(item) => (
            <View style={styles.membershipCard}>
              <Image source={item.image} style={styles.membershipImage} resizeMode="cover" />
              <View style={styles.membershipContent}>
                <Text style={styles.membershipTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.membershipDescription} numberOfLines={3}>
                  {item.subtitle}
                </Text>
                <TouchableOpacity
                  style={styles.discoverButton}
                  onPress={() => item.onPress?.()}
                >
                  <Text style={styles.discoverButtonText}>Discover More</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          onViewAllPress={() => {
            setActiveTab('Memberships');
          }}
        />

        {/* Motivation Banner */}
        <MotivationBanner
          title="Ready to Transform Your Life?"
          subtitle="Join thousands of members who have achieved their fitness goals with us. Start your journey today!"
          buttonText="Contact Us"
          onButtonPress={() => {
            setShowContactModal(true);
          }}
        />

        {/* Upcoming Classes Slider - Public for all users */}
        <Slider
          title="Upcoming Classes"
          items={upcomingClasses.map((classItem, index) => ({
            id: classItem.id || index,
            title: classItem.name || 'Class',
            subtitle: `Trainers: ${classItem.trainers && classItem.trainers.length > 0 
              ? classItem.trainers.map(trainer => getSafeText(trainer.name || trainer)).join(', ')
              : 'TBA'
            }\n${
              classItem.schedules && classItem.schedules.length > 0 ? 
                classItem.schedules.map(schedule => 
                  `${getSafeText(schedule.day)} ${getSafeText(schedule.start_time)}-${getSafeText(schedule.end_time)}`
                ).join(', ')
              : classItem.start_time ? 
                `${new Date(classItem.start_time).toLocaleDateString()} at ${new Date(classItem.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                'Time TBA'
            }`,
            image: classItem.image ? { uri: fixImageUrl(classItem.image) } : classImages.default,
            onPress: () => {
              navigate('Classes', { classId: classItem.id });
            },
          }))}
          onViewAllPress={() => {
            setActiveTab('Classes');
          }}
        />

        {/* Popular Services Slider - Public for all users */}
        <Slider
          title="Popular Services"
          items={popularServices.map((service, index) => ({
            id: service.id || index,
            title: service.name || 'Service',
            subtitle: `${service.description || 'No description available'}\n$${service.price || '0'} • ${service.duration || '0'} min`,
            image: serviceImages.default, // You can customize this based on service type
            onPress: () => {
              setActiveTab('Services');
            },
          }))}
          onViewAllPress={() => {
            setActiveTab('Services');
          }}
        />

      </>
    );
  };

  // Helper function to safely render text that might be an object
  const getSafeText = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      // Handle translation objects like {en: "text", ar: "text"}
      if (value.en) {
        return value.en;
      } else if (value.name) {
        return value.name;
      } else {
        return JSON.stringify(value);
      }
    } else {
      return String(value || '');
    }
  };
  
  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {renderMainContent()}
        </View>
      </ScrollView>
      
      <Modal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'login' ? 'Sign In' : 'Sign Up'}
      >
        {authMode === 'login' ? (
          <LoginScreen onClose={() => setShowAuthModal(false)} />
        ) : (
          <SignupScreen onClose={() => setShowAuthModal(false)} />
        )}
      </Modal>

      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  content: {
    padding: 16,
  },
  
  welcomeSection: {
    backgroundColor: '#007AFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  
  card: {
    marginBottom: 12,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  cardTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Auth Section Styles
  authSection: {
    padding: 24,
  },
  
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  gymLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  
  gymInfo: {
    flex: 1,
  },
  
  gymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  
  gymDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  authSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  authButtons: {
    gap: 16,
  },
  
  authButton: {
    marginBottom: 0,
  },
  
  // Membership Card Styles
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 200, // Ensure minimum height
    flex: 1,
  },
  
  membershipImage: {
    width: '100%',
    height: 120,
  },
  
  membershipContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  
  membershipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  
  membershipDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 12,
  },
  
  discoverButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

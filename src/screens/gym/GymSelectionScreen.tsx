import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Gym } from '../../types';
import { gymService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage } from '../../components/ui';
import { fixImageUrl } from '../../constants/api';

interface Props {
  onNavigateToHome?: () => void;
}

/**
 * Gym Selection Screen Component
 * Displays list of available gyms for user selection
 * Follows Single Responsibility Principle - handles only gym selection
 */
export const GymSelectionScreen: React.FC<Props> = ({ onNavigateToHome }) => {
  const { setSelectedGym, selectedGym } = useGymContext();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Debug: Clear selected gym if needed
  const clearSelectedGym = async () => {
    try {
      await setSelectedGym(null);
      console.log('Selected gym cleared');
    } catch (error) {
      console.error('Error clearing selected gym:', error);
    }
  };

  const loadGyms = async (): Promise<void> => {
    try {
      setError(null);
      const data = await gymService.getGyms();
      setGyms(data);
    } catch (err) {
      setError('Failed to load gyms. Please try again.');
      console.error('Gym loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadGyms();
  };

  const handleGymSelect = async (gym: Gym): Promise<void> => {
    try {
      await setSelectedGym(gym);
    } catch (error) {
      console.error('Error selecting gym:', error);
    }
  };

  const renderGym = ({ item }: { item: Gym }) => (
    <TouchableOpacity onPress={() => handleGymSelect(item)}>
      <Card style={styles.gymCard}>
        <View style={styles.gymHeader}>
          <View style={styles.gymLogo}>
            {item.logo && !imageErrors.has(item.id) ? (
              <Image 
                source={{ uri: fixImageUrl(item.logo) }} 
                style={styles.gymLogoImage}
                resizeMode="cover"
                onError={() => {
                  console.log('Image failed to load:', fixImageUrl(item.logo || ''));
                  setImageErrors(prev => new Set(prev).add(item.id));
                }}
                onLoad={() => console.log('Image loaded successfully:', fixImageUrl(item.logo || ''))}
              />
            ) : (
              <Text style={styles.gymLogoText}>
                {item.gym_name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>{item.gym_name}</Text>
            {item.description && (
              <Text style={styles.gymDescription}>{item.description}</Text>
            )}
          </View>
        </View>
        
        {item.address && (
          <View style={styles.gymDetails}>
            <Text style={styles.gymAddress}>{item.address}</Text>
          </View>
        )}

      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No gyms available</Text>
    </View>
  );

  useEffect(() => {
    loadGyms();
    // Debug: Log current selected gym
    console.log('GymSelectionScreen - Current selected gym:', selectedGym);
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading gyms..." />;
  }

  return (
    <View style={styles.container}>
      {/* Static header with sign-in icon */}
      <View style={styles.staticHeader}>
        <TouchableOpacity 
          style={styles.signInIcon}
          onPress={() => {
            if (onNavigateToHome) {
              onNavigateToHome();
            }
          }}
        >
          <Text style={styles.signInIconText}>🔐</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Select Your Gym</Text>
            <Text style={styles.subtitle}>Choose the gym you want to access</Text>
          </View>
        </View>
        {selectedGym && (
          <TouchableOpacity onPress={clearSelectedGym} style={styles.debugButton}>
            <Text style={styles.debugButtonText}>Clear Selected Gym (Debug)</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <ErrorMessage message={error} />}
      
      <FlatList
        data={gyms}
        renderItem={renderGym}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  staticHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingRight: 20,
  },
  
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  headerText: {
    flex: 1,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  signInIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  signInIconText: {
    fontSize: 20,
  },
  
  listContainer: {
    padding: 16,
  },
  
  gymCard: {
    marginBottom: 16,
  },
  
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  gymLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gymLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  gymLogoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  
  gymDetails: {
    marginBottom: 12,
  },
  
  gymAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  gymFooter: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  activeText: {
    color: '#4CAF50',
  },
  
  inactiveText: {
    color: '#F44336',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  debugButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

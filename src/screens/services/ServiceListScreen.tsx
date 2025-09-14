import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ServiceStackParamList, Service } from '../../types';
import { serviceService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage } from '../../components/ui';

type ServiceListScreenNavigationProp = StackNavigationProp<
  ServiceStackParamList,
  'ServiceList'
>;

interface Props {
  navigation: ServiceListScreenNavigationProp;
}

/**
 * Service List Screen Component
 * Displays list of available services
 * Follows Single Responsibility Principle - handles only service list display
 */
export const ServiceListScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedGym } = useGymContext();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async (): Promise<void> => {
    try {
      setError(null);
      const data = await serviceService.getAllServices(selectedGym?.slug);
      setServices(data);
    } catch (err) {
      setError('Failed to load services. Please try again.');
      console.error('Service loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadServices();
  };

  const handleServicePress = (service: Service): void => {
    navigation.navigate('ServiceDetails', { id: service.id });
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

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleServicePress(item)}>
      <Card style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{getSafeText(item.name)}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${getSafeText(item.price)}</Text>
          </View>
        </View>
        
        <Text style={styles.serviceDescription}>{getSafeText(item.description)}</Text>
        
        <View style={styles.serviceDetails}>
          <Text style={styles.category}>Category: {getSafeText(item.category)}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.is_active ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.is_active ? styles.activeText : styles.inactiveText
              ]}>
                {item.is_active ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            Duration: {getSafeText(item.duration_minutes)} minutes
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No services available</Text>
    </View>
  );

  useEffect(() => {
    loadServices();
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading services..." />;
  }

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} />}
      
      <FlatList
        data={services}
        renderItem={renderService}
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
  
  listContainer: {
    padding: 16,
  },
  
  serviceCard: {
    marginBottom: 16,
  },
  
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  
  priceContainer: {
    alignItems: 'flex-end',
  },
  
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  serviceDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 22,
  },
  
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  statusContainer: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  
  durationContainer: {
    alignItems: 'flex-start',
  },
  
  durationText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
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
});

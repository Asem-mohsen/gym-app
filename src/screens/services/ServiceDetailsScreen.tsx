import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ServiceStackParamList, Service } from '../../types';
import { serviceService } from '../../services';
import { Card, Loader, ErrorMessage, Button } from '../../components/ui';

type ServiceDetailsScreenNavigationProp = StackNavigationProp<
  ServiceStackParamList,
  'ServiceDetails'
>;

type ServiceDetailsScreenRouteProp = RouteProp<
  ServiceStackParamList,
  'ServiceDetails'
>;

interface Props {
  navigation: ServiceDetailsScreenNavigationProp;
  route: ServiceDetailsScreenRouteProp;
}

/**
 * Service Details Screen Component
 * Displays detailed information about a specific service
 * Follows Single Responsibility Principle - handles only service details display
 */
export const ServiceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadService = async (): Promise<void> => {
    try {
      setError(null);
      const data = await serviceService.getServiceById(id);
      setService(data);
    } catch (err) {
      setError('Failed to load service details. Please try again.');
      console.error('Service details loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadService();
  };

  const handleBookService = (): void => {
    // TODO: Implement booking functionality
    console.log('Book service:', service?.id);
  };

  useEffect(() => {
    loadService();
  }, [id]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading service details..." />;
  }

  if (!service) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Service not found" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {error && <ErrorMessage message={error} />}

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${service.price}</Text>
            <Text style={styles.priceUnit}>per session</Text>
          </View>
        </Card>

        {/* Category Card */}
        <Card style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Text style={styles.categoryText}>{service.category}</Text>
        </Card>

        {/* Duration Card */}
        <Card style={styles.durationCard}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.durationText}>
            {service.duration_minutes} minutes
          </Text>
          <Text style={styles.durationSubtext}>
            Each session lasts approximately {service.duration_minutes} minutes.
          </Text>
        </Card>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={[
            styles.statusBadge,
            service.is_active ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              service.is_active ? styles.activeText : styles.inactiveText
            ]}>
              {service.is_active ? 'Available' : 'Currently Unavailable'}
            </Text>
          </View>
        </Card>

        {/* Book Button */}
        {service.is_active && (
          <View style={styles.bookContainer}>
            <Button
              title="Book This Service"
              onPress={handleBookService}
              style={styles.bookButton}
            />
          </View>
        )}

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          <Text style={styles.infoText}>
            • Professional service provided by certified staff{'\n'}
            • All equipment and materials included{'\n'}
            • Flexible scheduling available{'\n'}
            • Cancellation policy: 24 hours notice required{'\n'}
            • Satisfaction guaranteed or full refund
          </Text>
        </Card>
      </View>
    </ScrollView>
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
  
  headerCard: {
    marginBottom: 16,
  },
  
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  
  serviceDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 16,
  },
  
  priceContainer: {
    alignItems: 'flex-start',
  },
  
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  priceUnit: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  categoryCard: {
    marginBottom: 16,
  },
  
  durationCard: {
    marginBottom: 16,
  },
  
  statusCard: {
    marginBottom: 16,
  },
  
  infoCard: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  
  durationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  
  durationSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  activeText: {
    color: '#4CAF50',
  },
  
  inactiveText: {
    color: '#F44336',
  },
  
  bookContainer: {
    marginBottom: 24,
  },
  
  bookButton: {
    marginHorizontal: 0,
  },
  
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

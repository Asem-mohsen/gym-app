import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ServiceStackParamList, Service } from '../../types';
import { serviceService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage, Button } from '../../components/ui';
import { fixImageUrl } from '../../constants/api';
import { serviceImages } from '../../assets/images/placeholders';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const { selectedGym } = useGymContext();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'visa' | null>(null);

  const loadService = async (): Promise<void> => {
    try {
      setError(null);
      if (!selectedGym?.slug) {
        setError('No gym selected');
        setIsLoading(false);
        return;
      }
      
      const data = await serviceService.getServiceById(id, selectedGym.slug);
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
    if (!service) return;
    
    if (service.booking_type === 'unbookable') {
      return; // Should not be able to book
    }
    
    if (service.booking_type === 'free_booking') {
      // For free booking, just need to select branch and date/time
      console.log('Book free service:', service.id, 'Branch:', selectedBranch);
      // TODO: Navigate to booking screen with date/time selection
    }
    
    if (service.booking_type === 'paid_booking') {
      // For paid booking, need branch and payment method
      if (!selectedBranch || !selectedPaymentMethod) {
        // Show error or validation
        return;
      }
      console.log('Book paid service:', service.id, 'Branch:', selectedBranch, 'Payment:', selectedPaymentMethod);
      // TODO: Navigate to payment screen
    }
  };

  const getBookingTypeDisplay = (bookingType: string) => {
    switch (bookingType) {
      case 'unbookable':
        return 'Not Bookable';
      case 'free_booking':
        return 'Free Booking';
      case 'paid_booking':
        return 'Paid Booking';
      default:
        return bookingType;
    }
  };

  const getBookingTypeColor = (bookingType: string) => {
    switch (bookingType) {
      case 'unbookable':
        return '#FF3B30';
      case 'free_booking':
        return '#34C759';
      case 'paid_booking':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const getSafeText = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
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

  useEffect(() => {
    loadService();
  }, [id, selectedGym]);

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

        {/* Service Image */}
        <Image 
          source={service.image ? { uri: fixImageUrl(service.image) } : serviceImages.default} 
          style={styles.serviceImage} 
          resizeMode="cover" 
        />

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Text style={styles.serviceName}>{getSafeText(service.name)}</Text>
          <Text style={styles.serviceDescription}>{getSafeText(service.description)}</Text>
          
          <View style={styles.priceContainer}>
            {service.booking_type === 'unbookable' ? (
              <Text style={styles.unbookableText}>Not Bookable</Text>
            ) : service.booking_type === 'free_booking' ? (
              <Text style={styles.freePrice}>Free</Text>
            ) : (
              <View>
                <Text style={styles.price}>
                  {service.price ? `$${service.price}` : 'Price on request'}
                </Text>
                <Text style={styles.priceUnit}>per session</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Booking Type Card */}
        <Card style={styles.bookingTypeCard}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.bookingTypeContainer}>
            <Icon 
              name={service.booking_type === 'unbookable' ? 'cancel' : 'check-circle'} 
              size={20} 
              color={getBookingTypeColor(service.booking_type)} 
            />
            <Text style={[
              styles.bookingTypeText,
              { color: getBookingTypeColor(service.booking_type) }
            ]}>
              {getBookingTypeDisplay(service.booking_type)}
            </Text>
          </View>
        </Card>

        {/* Duration Card */}
        <Card style={styles.durationCard}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.durationText}>
            {service.duration} minutes
          </Text>
          <Text style={styles.durationSubtext}>
            Each session lasts approximately {service.duration} minutes.
          </Text>
        </Card>

        {/* Availability Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={[
            styles.statusBadge,
            service.is_available ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              service.is_available ? styles.activeText : styles.inactiveText
            ]}>
              {service.is_available ? 'Available' : 'Currently Unavailable'}
            </Text>
          </View>
        </Card>

        {/* Branches Selection */}
        {service.branches && service.branches.length > 0 && service.booking_type !== 'unbookable' && (
          <Card style={styles.branchesCard}>
            <Text style={styles.sectionTitle}>Select Branch</Text>
            {service.branches.map((branch, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.branchOption,
                  selectedBranch?.id === branch.id && styles.branchOptionSelected
                ]}
                onPress={() => setSelectedBranch(branch)}
              >
                <Icon 
                  name={selectedBranch?.id === branch.id ? 'check-circle' : 'circle-o'} 
                  size={20} 
                  color={selectedBranch?.id === branch.id ? '#007AFF' : '#8E8E93'} 
                />
                <Text style={[
                  styles.branchText,
                  selectedBranch?.id === branch.id && styles.branchTextSelected
                ]}>
                  {getSafeText(branch.name || branch)}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Payment Method Selection for Paid Services */}
        {service.booking_type === 'paid_booking' && (
          <Card style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'cash' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <Icon 
                name={selectedPaymentMethod === 'cash' ? 'check-circle' : 'circle-o'} 
                size={20} 
                color={selectedPaymentMethod === 'cash' ? '#007AFF' : '#8E8E93'} 
              />
              <Text style={[
                styles.paymentText,
                selectedPaymentMethod === 'cash' && styles.paymentTextSelected
              ]}>
                Cash Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'visa' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('visa')}
            >
              <Icon 
                name={selectedPaymentMethod === 'visa' ? 'check-circle' : 'circle-o'} 
                size={20} 
                color={selectedPaymentMethod === 'visa' ? '#007AFF' : '#8E8E93'} 
              />
              <Text style={[
                styles.paymentText,
                selectedPaymentMethod === 'visa' && styles.paymentTextSelected
              ]}>
                Visa/Card Payment
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Book Button */}
        {service.booking_type !== 'unbookable' && service.is_available && (
          <View style={styles.bookContainer}>
            <Button
              title={
                service.booking_type === 'free_booking' 
                  ? 'Book Free Service' 
                  : 'Book & Pay Now'
              }
              onPress={handleBookService}
              style={[
                styles.bookButton,
                service.booking_type === 'free_booking' ? styles.freeBookButton : styles.paidBookButton
              ] as any}
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
  
  serviceImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
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
  
  freePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
  },
  
  unbookableText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  
  priceUnit: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  bookingTypeCard: {
    marginBottom: 16,
  },
  
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  bookingTypeText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  durationCard: {
    marginBottom: 16,
  },
  
  statusCard: {
    marginBottom: 16,
  },
  
  branchesCard: {
    marginBottom: 16,
  },
  
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  
  branchOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  
  branchText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  
  branchTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  paymentCard: {
    marginBottom: 16,
  },
  
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  
  paymentOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  
  paymentText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  
  paymentTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
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
  
  freeBookButton: {
    backgroundColor: '#34C759',
  },
  
  paidBookButton: {
    backgroundColor: '#007AFF',
  },
  
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ServiceStackParamList, Service } from '../../types';
import { serviceService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage, PageBanner } from '../../components/ui';
import { heroImages, serviceImages } from '../../assets/images/placeholders';
import { fixImageUrl } from '../../constants/api';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [bookingTypes, setBookingTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingType, setSelectedBookingType] = useState<string>('');

  const loadServices = async (): Promise<void> => {
    try {
      setError(null);
      if (!selectedGym?.slug) {
        setError('No gym selected');
        setIsLoading(false);
        return;
      }
      
      const response = await serviceService.getAllServices(selectedGym.slug);
      
      console.log('Service API Response:', JSON.stringify(response, null, 2));
      
      // Handle the API response structure
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('Services found:', response.data.services?.length || 0);
        console.log('Booking types found:', response.data.booking_types?.length || 0);
        setServices(response.data.services || []);
        setBookingTypes(response.data.booking_types || []);
        setFilteredServices(response.data.services || []);
      } else {
        console.log('Fallback: Response is not in expected format');
        // Fallback for old API structure
        setServices(Array.isArray(response) ? response : []);
        setBookingTypes([]);
        setFilteredServices(Array.isArray(response) ? response : []);
      }
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

  const filterServices = () => {
    let filtered = services;

    // Filter by search query (service name or description)
    if (searchQuery.trim()) {
      filtered = filtered.filter(service => {
        const serviceName = getSafeText(service.name).toLowerCase();
        const serviceDescription = getSafeText(service.description).toLowerCase();
        
        return serviceName.includes(searchQuery.toLowerCase()) || 
               serviceDescription.includes(searchQuery.toLowerCase());
      });
    }

    // Filter by booking type
    if (selectedBookingType) {
      filtered = filtered.filter(service => {
        return service.booking_type === selectedBookingType;
      });
    }

    setFilteredServices(filtered);
  };

  // Update filtered services when search query or booking type changes
  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedBookingType, services]);

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

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleServicePress(item)}>
      <Card style={styles.serviceCard}>
        {/* Service Image */}
        <Image 
          source={item.image ? { uri: fixImageUrl(item.image) } : serviceImages.default} 
          style={styles.serviceImage} 
          resizeMode="cover" 
        />
        
        <View style={styles.serviceContent}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{getSafeText(item.name)}</Text>
            <View style={styles.priceContainer}>
              {item.booking_type === 'unbookable' ? (
                <Text style={styles.unbookableText}>Not Bookable</Text>
              ) : item.booking_type === 'free_booking' ? (
                <Text style={styles.freePrice}>Free</Text>
              ) : (
                <Text style={styles.price}>
                  {item.price ? `$${item.price}` : 'Price on request'}
                </Text>
              )}
            </View>
          </View>
          
          <Text style={styles.serviceDescription}>{getSafeText(item.description)}</Text>
          
          {/* Service Details with Icons */}
          <View style={styles.serviceDetails}>
            <View style={styles.durationContainer}>
              <Icon name="schedule" size={16} color="#007AFF" />
              <Text style={styles.durationText}>{item.duration} min</Text>
            </View>
            
            <View style={styles.bookingTypeContainer}>
              <Icon 
                name={item.booking_type === 'unbookable' ? 'cancel' : 'check-circle'} 
                size={16} 
                color={getBookingTypeColor(item.booking_type)} 
              />
              <Text style={[
                styles.bookingTypeText,
                { color: getBookingTypeColor(item.booking_type) }
              ]}>
                {getBookingTypeDisplay(item.booking_type)}
              </Text>
            </View>
          </View>

          {/* Branches Information */}
          {item.branches && item.branches.length > 0 && (
            <View style={styles.branchesContainer}>
              <Icon name="location-on" size={16} color="#007AFF" />
              <Text style={styles.branchesText}>
                Available at: {item.branches.map(branch => getSafeText(branch.name || branch)).join(', ')}
              </Text>
            </View>
          )}

          {/* Book Button */}
          {item.booking_type !== 'unbookable' && item.is_available && (
            <View style={styles.bookButtonContainer}>
              <TouchableOpacity 
                style={[
                  styles.bookButton,
                  item.booking_type === 'free_booking' ? styles.freeBookButton : styles.paidBookButton
                ]}
                onPress={() => handleServicePress(item)}
              >
                <Icon 
                  name={item.booking_type === 'free_booking' ? 'calendar-plus-o' : 'credit-card'} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <Text style={styles.bookButtonText}>
                  {item.booking_type === 'free_booking' ? 'Book Free' : 'Book & Pay'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
      <PageBanner
        title="Premium Services"
        subtitle="Discover our range of professional services designed to enhance your fitness journey and wellness"
        image={heroImages.memberships} // Using memberships image as placeholder
      />
      
      {error && <ErrorMessage message={error} />}
      
      {/* Search and Filter Section */}
      <View style={styles.searchFilterContainer}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Booking Type Filter */}
        {bookingTypes.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedBookingType === '' && styles.filterChipActive
              ]}
              onPress={() => setSelectedBookingType('')}
            >
              <Text style={[
                styles.filterChipText,
                selectedBookingType === '' && styles.filterChipTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {bookingTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedBookingType === type && styles.filterChipActive
                ]}
                onPress={() => setSelectedBookingType(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedBookingType === type && styles.filterChipTextActive
                ]}>
                  {getBookingTypeDisplay(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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
  
  searchFilterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
  },
  
  filterContainer: {
    marginTop: 4,
  },
  
  filterContent: {
    paddingRight: 16,
  },
  
  filterChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  
  filterChipTextActive: {
    color: 'white',
  },
  
  listContainer: {
    padding: 16,
  },
  
  serviceCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  serviceImage: {
    width: '100%',
    height: 150,
  },
  
  serviceContent: {
    padding: 16,
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
  
  freePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  
  unbookableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
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
  
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  durationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  bookingTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  branchesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  branchesText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  
  bookButtonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  freeBookButton: {
    backgroundColor: '#34C759',
  },
  
  paidBookButton: {
    backgroundColor: '#007AFF',
  },
  
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

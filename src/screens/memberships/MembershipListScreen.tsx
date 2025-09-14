import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MembershipStackParamList, Membership } from '../../types';
import { membershipService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { Card, Loader, ErrorMessage, PageBanner, Button } from '../../components/ui';
import { heroImages } from '../../assets/images/placeholders';
import Icon from 'react-native-vector-icons/FontAwesome';

type MembershipListScreenNavigationProp = StackNavigationProp<
  MembershipStackParamList,
  'MembershipList'
>;

interface Props {
  navigation: MembershipListScreenNavigationProp;
}

/**
 * Membership List Screen Component
 * Displays list of available memberships
 * Follows Single Responsibility Principle - handles only membership list display
 */
export const MembershipListScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedGym } = useGymContext();
  const { navigate } = useNavigationContext();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = async (): Promise<void> => {
    try {
      setError(null);
      const data = await membershipService.getAllMemberships(selectedGym?.slug);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMemberships(data);
      } else {
        setMemberships([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load memberships. Please try again.';
      setError(errorMessage);
      setMemberships([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadMemberships();
  };

  const handleMembershipPress = (membership: Membership): void => {
    // Use the navigation context to navigate to membership details
    navigate('Memberships', { membershipId: membership.id });
  };

  const renderMembership = ({ item }: { item: Membership }) => {
    // Truncate description to approximately 100 words
    const truncateDescription = (text: string, maxWords: number = 100) => {
      const words = text.split(' ');
      if (words.length <= maxWords) return text;
      return words.slice(0, maxWords).join(' ') + '...';
    };

    return (
      <TouchableOpacity onPress={() => handleMembershipPress(item)}>
        <Card style={styles.membershipCard}>
          {/* Membership Image */}
          <Image source={heroImages.memberships} style={styles.membershipImage} resizeMode="cover" />
          
          <View style={styles.membershipContent}>
            <View style={styles.membershipHeader}>
              <Text style={styles.membershipName}>{item.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={styles.priceUnit}>/{item.period || 'month'}</Text>
              </View>
            </View>
            
            {/* Truncated Description */}
            <Text style={styles.membershipDescription}>
              {truncateDescription(item.general_description || 'No description available')}
            </Text>
            
            <View style={styles.membershipDetails}>
              <View style={styles.durationContainer}>
                <Icon name="schedule" size={16} color="#007AFF" />
                <Text style={styles.duration}>
                  {item.duration_days} days
                </Text>
              </View>
            </View>

            {/* Features with Icons */}
            {item.features && item.features.length > 0 && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Key Features:</Text>
                {item.features.map((feature, index) => {
                  // Handle different feature formats
                  let featureText = '';
                  if (typeof feature === 'string') {
                    featureText = feature;
                  } else if (typeof feature === 'object' && feature !== null) {
                    // Handle translation objects like {en: "text", ar: "text"}
                    if (feature.en) {
                      featureText = feature.en;
                    } else if (feature.name) {
                      featureText = feature.name;
                    } else {
                      featureText = JSON.stringify(feature);
                    }
                  } else {
                    featureText = String(feature);
                  }
                  
                  return (
                    <View key={index} style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#34C759" />
                      <Text style={styles.feature}>{featureText}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* View Details Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="View Details & Book"
                onPress={() => handleMembershipPress(item)}
                style={styles.viewDetailsButton}
                textStyle={styles.viewDetailsButtonText}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No memberships available</Text>
    </View>
  );

  useEffect(() => {
    loadMemberships();
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading memberships..." />;
  }

  return (
    <View style={styles.container}>
      <PageBanner
        title="Premium Memberships"
        subtitle="Choose the perfect plan for your fitness journey and unlock unlimited access to our world-class facilities"
        image={heroImages.memberships}
      />
      
      {error && <ErrorMessage message={error} />}
      
      <FlatList
        data={memberships}
        renderItem={renderMembership}
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
  
  listContainer: {
    padding: 16,
  },
  
  membershipCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  membershipImage: {
    width: '100%',
    height: 150,
  },
  
  membershipContent: {
    padding: 16,
  },
  
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  membershipName: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  priceUnit: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  membershipDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 22,
  },
  
  membershipDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  duration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  featuresContainer: {
    marginTop: 8,
  },
  
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  feature: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  
  moreFeatures: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  buttonContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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

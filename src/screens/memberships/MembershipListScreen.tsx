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
import { MembershipStackParamList, Membership } from '../../types';
import { membershipService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage } from '../../components/ui';

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
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = async (): Promise<void> => {
    try {
      setError(null);
      const data = await membershipService.getAllMemberships(selectedGym?.slug);
      setMemberships(data);
    } catch (err) {
      setError('Failed to load memberships. Please try again.');
      console.error('Membership loading error:', err);
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
    navigation.navigate('MembershipDetails', { id: membership.id });
  };

  const renderMembership = ({ item }: { item: Membership }) => (
    <TouchableOpacity onPress={() => handleMembershipPress(item)}>
      <Card style={styles.membershipCard}>
        <View style={styles.membershipHeader}>
          <Text style={styles.membershipName}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
        </View>
        
        <Text style={styles.membershipDescription}>{item.description}</Text>
        
        <View style={styles.membershipDetails}>
          <Text style={styles.duration}>
            Duration: {item.duration_days} days
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.is_active ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.is_active ? styles.activeText : styles.inactiveText
              ]}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {item.features && item.features.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features:</Text>
            {item.features.slice(0, 3).map((feature, index) => {
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
                <Text key={index} style={styles.feature}>
                  • {featureText}
                </Text>
              );
            })}
            {item.features.length > 3 && (
              <Text style={styles.moreFeatures}>
                +{item.features.length - 3} more features
              </Text>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

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
      {error && <ErrorMessage message={error} />}
      
      <FlatList
        data={memberships}
        renderItem={renderMembership}
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
  
  membershipCard: {
    marginBottom: 16,
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
  
  duration: {
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
  
  featuresContainer: {
    marginTop: 8,
  },
  
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  feature: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  
  moreFeatures: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
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

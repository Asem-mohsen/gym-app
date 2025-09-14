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
import { MembershipStackParamList, Membership } from '../../types';
import { membershipService } from '../../services';
import { Card, Loader, ErrorMessage, Button } from '../../components/ui';

type MembershipDetailsScreenNavigationProp = StackNavigationProp<
  MembershipStackParamList,
  'MembershipDetails'
>;

type MembershipDetailsScreenRouteProp = RouteProp<
  MembershipStackParamList,
  'MembershipDetails'
>;

interface Props {
  navigation: MembershipDetailsScreenNavigationProp;
  route: MembershipDetailsScreenRouteProp;
}

/**
 * Membership Details Screen Component
 * Displays detailed information about a specific membership
 * Follows Single Responsibility Principle - handles only membership details display
 */
export const MembershipDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembership = async (): Promise<void> => {
    try {
      setError(null);
      const data = await membershipService.getMembershipById(id);
      setMembership(data);
    } catch (err) {
      setError('Failed to load membership details. Please try again.');
      console.error('Membership details loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadMembership();
  };

  const handlePurchase = (): void => {
    // TODO: Implement purchase functionality
    console.log('Purchase membership:', membership?.id);
  };

  useEffect(() => {
    loadMembership();
  }, [id]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading membership details..." />;
  }

  if (!membership) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Membership not found" />
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
          <View style={styles.headerContent}>
            <Text style={styles.membershipName}>{membership.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${membership.price}</Text>
              <Text style={styles.priceUnit}>per month</Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              membership.is_active ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                membership.is_active ? styles.activeText : styles.inactiveText
              ]}>
                {membership.is_active ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description Card */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{membership.description}</Text>
        </Card>

        {/* Duration Card */}
        <Card style={styles.durationCard}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.durationText}>
            {membership.duration_days} days
          </Text>
          <Text style={styles.durationSubtext}>
            Your membership will be valid for {membership.duration_days} days from the purchase date.
          </Text>
        </Card>

        {/* Features Card */}
        {membership.features && membership.features.length > 0 && (
          <Card style={styles.featuresCard}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {membership.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Purchase Button */}
        {membership.is_active && (
          <View style={styles.purchaseContainer}>
            <Button
              title="Purchase Membership"
              onPress={handlePurchase}
              style={styles.purchaseButton}
            />
          </View>
        )}

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Text style={styles.infoText}>
            • Membership is non-refundable once purchased{'\n'}
            • Access to all gym facilities included{'\n'}
            • Personal training sessions available at additional cost{'\n'}
            • Group classes included in membership{'\n'}
            • 24/7 gym access
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
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  membershipName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  
  priceContainer: {
    alignItems: 'flex-end',
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
  
  statusContainer: {
    alignItems: 'flex-start',
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
    fontSize: 14,
    fontWeight: '600',
  },
  
  activeText: {
    color: '#4CAF50',
  },
  
  inactiveText: {
    color: '#F44336',
  },
  
  descriptionCard: {
    marginBottom: 16,
  },
  
  durationCard: {
    marginBottom: 16,
  },
  
  featuresCard: {
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
  
  description: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
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
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  featureBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  
  featureText: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 22,
  },
  
  purchaseContainer: {
    marginBottom: 24,
  },
  
  purchaseButton: {
    marginHorizontal: 0,
  },
  
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGymContext } from '../../contexts/GymContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { MembershipService } from '../../services/MembershipService';
import { Membership } from '../../types';
import { Card, Button, Loader, ErrorMessage } from '../../components/ui';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fixImageUrl } from '../../constants/api';

interface MembershipDetailsData {
  membership: Membership & {
    offers?: Array<{
      id: number;
      title: string;
      description: string;
      discount_percentage: number | null;
      start_date: string;
      end_date: string;
      status: number;
      remaining_days: number;
      is_active: boolean;
      offers: any[];
    }>;
  };
  trainers: any[];
  branches: any[];
  user_subscription: any;
}

const MembershipDetailsScreen: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { selectedGym } = useGymContext();
  const { navigationParams, goBack, navigate } = useNavigationContext();
  const membershipId = navigationParams.membershipId;
  
  const [membershipData, setMembershipData] = useState<MembershipDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const membershipService = new MembershipService();

  useEffect(() => {
    loadMembershipDetails();
  }, [membershipId]);

  const loadMembershipDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await membershipService.getMembershipDetails(membershipId, selectedGym?.slug || '');
      
    if (response.success && response.data) {
      setMembershipData(response.data);
    } else {
        setError(response.message || 'Failed to load membership details');
      }
    } catch (err) {
      setError('Failed to load membership details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('SignIn');
      return;
    }

    if (!membershipData) return;

    // Check if user is already subscribed to this specific membership
    const userSubscription = membershipData.user_subscription;
    const isSubscribedToThisPlan = userSubscription && userSubscription.membership_id === membership.id;
    
    if (isSubscribedToThisPlan) {
      Alert.alert(
        'Already Subscribed',
        'You are already subscribed to this membership plan.',
        [{ text: 'OK' }]
      );
      return;
    }

    const branches = membershipData.branches || [];
    
    if (branches && branches.length > 0) {
      setShowBranchModal(true);
    } else {
      setBooking(true);
    }
  };

  const handleBranchSelection = (branch: any) => {
    setSelectedBranch(branch);
    setShowBranchModal(false);
    setBooking(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      
      Alert.alert(
        'Booking Successful',
        `Your membership has been booked successfully!${selectedBranch ? `\nBranch: ${selectedBranch.name}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setBooking(false);
              setSelectedBranch(null);
            }
          }
        ]
      );
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert('Booking Failed', 'Failed to book membership. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderOfferWidget = () => {
    if (!membershipData) return null;
    
    // Check for offers array
    const offers = membershipData.membership?.offers || [];
    const activeOffer = offers.find(offer => offer.is_active && offer.status === 1);
    
    if (!activeOffer) {
      return null;
    }

    const originalPrice = parseFloat(membershipData.membership.price || '0');
    const discountPercentage = activeOffer.discount_percentage || 0;
    const offerPrice = originalPrice * (1 - discountPercentage / 100);
    const discount = originalPrice - offerPrice;

    return (
      <View style={styles.offerWidget}>
        <View style={styles.offerHeader}>
          <Icon name="local-offer" size={20} color="#FF6B35" />
          <Text style={styles.offerTitle}>{activeOffer.title}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
          <Text style={styles.offerPrice}>${offerPrice.toFixed(2)}</Text>
          <Text style={styles.discountText}>Save ${discount.toFixed(2)}</Text>
        </View>
        {activeOffer.description && (
          <Text style={styles.offerDescription}>{activeOffer.description}</Text>
        )}
      </View>
    );
  };

  const renderSubscriptionDetails = () => {
    if (!membershipData?.user_subscription || membershipData.user_subscription.membership_id !== membership.id) {
      return null;
    }

    const subscription = membershipData.user_subscription;
    const startDate = subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'N/A';
    const endDate = subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A';

    return (
      <View style={styles.subscriptionDetailsSection}>
        <Text style={styles.sectionTitle}>Your Subscription</Text>
        <View style={styles.subscriptionDetails}>
          <View style={styles.subscriptionDetailItem}>
            <Icon name="calendar-today" size={20} color="#4CAF50" />
            <Text style={styles.subscriptionDetailLabel}>Started:</Text>
            <Text style={styles.subscriptionDetailValue}>{startDate}</Text>
          </View>
          <View style={styles.subscriptionDetailItem}>
            <Icon name="event" size={20} color="#FF6B35" />
            <Text style={styles.subscriptionDetailLabel}>Expires:</Text>
            <Text style={styles.subscriptionDetailValue}>{endDate}</Text>
          </View>
          {subscription.status && (
            <View style={styles.subscriptionDetailItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.subscriptionDetailLabel}>Status:</Text>
              <Text style={styles.subscriptionDetailValue}>{subscription.status}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFeatures = () => {
    if (!membershipData?.membership?.features || membershipData.membership.features.length === 0) {
      return null;
    }

    return (
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        {membershipData.membership.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>
              {typeof feature === 'string' ? feature : feature.name || feature.title || 'Feature'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTrainer = ({ item }: { item: any }) => (
    <View style={styles.trainerCard}>
      <Image
        source={{ 
          uri: item.image ? fixImageUrl(item.image) : 'https://via.placeholder.com/150x150/2196F3/FFFFFF?text=T'
        }}
        style={styles.trainerImage}
        resizeMode="cover"
      />
      <Text style={styles.trainerName}>
        {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Trainer'}
      </Text>
      <View style={styles.socialMediaContainer}>
        {item.facebook_url && (
          <TouchableOpacity style={styles.socialIcon}>
            <Icon name="group" size={16} color="#1877F2" />
          </TouchableOpacity>
        )}
        {item.twitter_url && (
          <TouchableOpacity style={styles.socialIcon}>
            <Icon name="chat" size={16} color="#1DA1F2" />
          </TouchableOpacity>
        )}
        {item.instagram_url && (
          <TouchableOpacity style={styles.socialIcon}>
            <Icon name="photo-camera" size={16} color="#E4405F" />
          </TouchableOpacity>
        )}
        {item.youtube_url && (
          <TouchableOpacity style={styles.socialIcon}>
            <Icon name="play-circle-filled" size={16} color="#FF0000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTrainers = () => {
    if (!membershipData) return null;
    
    const trainers = membershipData.trainers || [];

    return (
      <View style={styles.trainersSection}>
        <Text style={styles.sectionTitle}>Meet Our Trainers</Text>
        <FlatList
          data={trainers}
          renderItem={renderTrainer}
          keyExtractor={(item, index) => `trainer-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trainersList}
          style={styles.trainersFlatList}
        />
      </View>
    );
  };

  const renderBookingForm = () => {
    if (!booking) return null;

    return (
      <View style={styles.bookingForm}>
        <Text style={styles.bookingTitle}>Complete Your Booking</Text>
        
        {selectedBranch && (
          <View style={styles.selectedBranch}>
            <Text style={styles.selectedBranchLabel}>Selected Branch:</Text>
            <Text style={styles.selectedBranchName}>{selectedBranch.name}</Text>
          </View>
        )}

        <View style={styles.bookingActions}>
          <Button
            title="Cancel"
            onPress={() => {
              setBooking(false);
              setSelectedBranch(null);
            }}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <Button
            title={bookingLoading ? "Processing..." : "Confirm Booking"}
            onPress={handleConfirmBooking}
            loading={bookingLoading}
            style={styles.confirmButton}
          />
        </View>
      </View>
    );
  };

  const renderBranchModal = () => {
    if (!showBranchModal) return null;

    if (!membershipData) return null;

    const branches = membershipData.branches || [];
    
    if (!branches || branches.length === 0) {
      return (
        <Modal
          visible={showBranchModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBranchModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>No Branches Available</Text>
              <Text style={styles.noBranchesText}>
                This membership is available at all locations.
              </Text>
              <Button
                title="Continue"
                onPress={() => {
                  setShowBranchModal(false);
                  setBooking(true);
                }}
                style={styles.modalCancelButton}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal
        visible={showBranchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Branch</Text>
            <ScrollView style={styles.branchList}>
              {branches.map((branch, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.branchItem}
                  onPress={() => handleBranchSelection(branch)}
                >
                  <Icon name="location-on" size={20} color="#2196F3" />
                  <View style={styles.branchInfo}>
                    <Text style={styles.branchName}>{branch.name || branch.title || `Branch ${index + 1}`}</Text>
                    {(branch.address || branch.location) && (
                      <Text style={styles.branchAddress}>{branch.address || branch.location}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title="Cancel"
              onPress={() => setShowBranchModal(false)}
              style={styles.modalCancelButton}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMembershipDetails} />;
  }

  if (!membershipData || !membershipData.membership) {
    return <ErrorMessage message="Membership not found" />;
  }

  const membership = membershipData.membership;

  return (
    <ScrollView style={styles.container}>
      {/* Banner with Image and Navigation */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ 
            uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Membership'
          }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.bannerContent}>
            <TouchableOpacity onPress={goBack} style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Memberships</Text>
              <Icon name="chevron-right" size={16} color="white" />
            </TouchableOpacity>
            <Text style={styles.bannerTitle}>{membership.name}</Text>
          </View>
          
          {renderOfferWidget()}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{membership.general_description}</Text>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.price}>
            ${parseFloat(membership.price || '0').toFixed(2)}
            {membership.period && ` / ${membership.period}`}
          </Text>
        </View>

        {renderSubscriptionDetails()}
        {renderFeatures()}
        {renderTrainers()}

        <View style={styles.bookingSection}>
          {!isAuthenticated ? (
            <View style={styles.authRequiredContainer}>
              <Button
                title="Login to Book"
                onPress={() => navigate('SignIn')}
                style={styles.authRequiredButton}
              />
              <Text style={styles.authRequiredText}>
                Please log in to book this membership
              </Text>
            </View>
          ) : (membershipData.user_subscription && membershipData.user_subscription.membership_id === membership.id) ? (
            <View style={styles.subscribedContainer}>
              <Button
                title="Already Subscribed"
                disabled
                style={styles.disabledButton}
              />
              <Text style={styles.subscribedText}>
                You are already subscribed to this plan
              </Text>
            </View>
          ) : (
            <Button
              title="Book Now"
              onPress={handleBooking}
              style={styles.bookButton}
            />
          )}
        </View>

        {renderBookingForm()}
      </View>

      {renderBranchModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannerContainer: {
    position: 'relative',
    height: 300,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breadcrumbText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  offerWidget: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'center',
  },
  originalPrice: {
    color: 'white',
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  offerPrice: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  offerDescription: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  trainersSection: {
    marginBottom: 24,
  },
  trainersList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trainersFlatList: {
    height: 250,
  },
  trainerCard: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  trainerImage: {
    width: 150,
    height: 150,
    borderRadius: 0,
    marginBottom: 0,
  },
  trainerName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  socialIcon: {
    marginHorizontal: 4,
    padding: 4,
  },
  subscriptionDetailsSection: {
    marginBottom: 24,
  },
  subscriptionDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  subscriptionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  subscriptionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  bookingSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  authRequiredContainer: {
    alignItems: 'center',
  },
  authRequiredButton: {
    backgroundColor: '#FF9800',
    marginBottom: 8,
  },
  authRequiredText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  subscribedContainer: {
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  subscribedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
  },
  bookingForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedBranch: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  selectedBranchLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedBranchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: 'white',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  branchList: {
    maxHeight: 300,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  branchInfo: {
    marginLeft: 12,
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  branchAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalCancelButton: {
    marginTop: 16,
    backgroundColor: '#f44336',
  },
  noBranchesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default MembershipDetailsScreen;
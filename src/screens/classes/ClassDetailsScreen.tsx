import React, { useEffect, useState } from 'react';
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
  Dimensions,
  Linking,
} from 'react-native';
import { useGymContext } from '../../contexts/GymContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { classService } from '../../services';
import { Button, Loader, ErrorMessage } from '../../components/ui';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fixImageUrl } from '../../constants/api';

const { width } = Dimensions.get('window');

interface ClassDetailsData {
  id: number;
  name: string;
  description: string;
  type: string;
  max_participants: number;
  status: string;
  image: string;
  trainers: any[];
  branches: any[];
  schedules: any[];
  pricings: any[];
}

const ClassDetailsScreen: React.FC = () => {
  const { selectedGym } = useGymContext();
  const { isAuthenticated } = useAuthContext();
  const { navigationParams, goBack, navigate } = useNavigationContext();
  const classId = navigationParams.classId;
  
  const [classData, setClassData] = useState<ClassDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId, selectedGym]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await classService.getClassDetails(classId, selectedGym?.slug || '');
      
      if (response.success && response.data) {
        console.log('Class details loaded:', response.data);
        setClassData(response.data);
        
        // Auto-select branch if only one exists
        if (response.data.branches && response.data.branches.length === 1) {
          setSelectedBranch(response.data.branches[0]);
        }
      } else {
        setError(response.message || 'Failed to load class details');
      }
    } catch (err) {
      console.error('Class details loading error:', err);
      setError('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to book this class.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigate('SignIn') }
        ]
      );
      return;
    }

    if (!classData) return;

    if (classData.branches && classData.branches.length > 1) {
      setShowBranchModal(true);
      return;
    }

    setBooking(true);
  };

  const handleBranchSelection = (branch: any) => {
    setSelectedBranch(branch);
    setShowBranchModal(false);
    setBooking(true);
  };

  const handlePayment = async () => {
    try {
      setBookingLoading(true);
      
      // Here you would implement the actual payment processing
      // For now, we'll just show a success message
      Alert.alert(
        'Booking Successful',
        `Your class has been booked successfully!${selectedBranch ? `\nBranch: ${selectedBranch.name}` : ''}\nPayment Method: ${selectedPaymentMethod.toUpperCase()}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setBooking(false);
              setSelectedBranch(null);
              setSelectedPaymentMethod('cash');
            }
          }
        ]
      );
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert('Booking Failed', 'Failed to book class. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const openMap = (branch: any) => {
    if (!branch.latitude || !branch.longitude) {
      Alert.alert('Location Not Available', 'Map location is not available for this branch.');
      return;
    }

    const url = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
    Linking.openURL(url).catch(err => {
      console.error('Failed to open map:', err);
      Alert.alert('Error', 'Failed to open map application.');
    });
  };

  const renderTrainer = ({ item }: { item: any }) => (
    <View style={styles.trainerCard}>
      <Image
        source={{ 
          uri: item.image ? fixImageUrl(item.image) : 'https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=T'
        }}
        style={styles.trainerImage}
        resizeMode="cover"
      />
      <Text style={styles.trainerName}>
        {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Trainer'}
      </Text>
      
      {item.specialization && (
        <Text style={styles.trainerSpecialization}>
          {item.specialization}
        </Text>
      )}
      
      {item.experience && (
        <Text style={styles.trainerExperience}>
          {item.experience} years experience
        </Text>
      )}

      {/* Physical Stats */}
      <View style={styles.trainerStats}>
        {item.age && (
          <View style={styles.statItem}>
            <Icon name="birthday-cake" size={14} color="#666" />
            <Text style={styles.statText}>{item.age} years old</Text>
          </View>
        )}
        {item.height && (
          <View style={styles.statItem}>
            <Icon name="arrows-v" size={14} color="#666" />
            <Text style={styles.statText}>{item.height} cm</Text>
          </View>
        )}
        {item.weight && (
          <View style={styles.statItem}>
            <Icon name="balance-scale" size={14} color="#666" />
            <Text style={styles.statText}>{item.weight} kg</Text>
          </View>
        )}
      </View>
      
      {item.brief_description && (
        <Text style={styles.trainerDescription}>
          {item.brief_description}
        </Text>
      )}
      
      <View style={styles.socialMediaContainer}>
        {item.facebook_url && (
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => console.log('Open Facebook:', item.facebook_url)}
          >
            <Icon name="facebook" size={20} color="#1877F2" />
          </TouchableOpacity>
        )}
        {item.twitter_url && (
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => console.log('Open Twitter:', item.twitter_url)}
          >
            <Icon name="twitter" size={20} color="#1DA1F2" />
          </TouchableOpacity>
        )}
        {item.instagram_url && (
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => console.log('Open Instagram:', item.instagram_url)}
          >
            <Icon name="instagram" size={20} color="#E4405F" />
          </TouchableOpacity>
        )}
        {item.youtube_url && (
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => console.log('Open YouTube:', item.youtube_url)}
          >
            <Icon name="youtube-play" size={20} color="#FF0000" />
          </TouchableOpacity>
        )}
        {item.linkedin_url && (
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => console.log('Open LinkedIn:', item.linkedin_url)}
          >
            <Icon name="linkedin" size={20} color="#0077B5" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderBranch = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.branchCard,
        selectedBranch?.id === item.id && styles.branchCardSelected
      ]}
      onPress={() => setSelectedBranch(item)}
    >
      <View style={styles.branchHeader}>
        <Icon name="map-marker" size={20} color="#007AFF" />
        <Text style={styles.branchName}>{item.name}</Text>
      </View>
      {item.address && (
        <Text style={styles.branchAddress}>{item.address}</Text>
      )}
      <TouchableOpacity 
        style={styles.mapButton}
        onPress={() => openMap(item)}
      >
        <Icon name="map" size={16} color="#007AFF" />
        <Text style={styles.mapButtonText}>View on Map</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderBranchModal = () => {
    if (!showBranchModal || !classData) return null;

    return (
      <Modal
        visible={showBranchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Branch</Text>
              <TouchableOpacity onPress={() => setShowBranchModal(false)}>
                <Icon name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={classData.branches}
              renderItem={renderBranch}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              style={styles.branchList}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowBranchModal(false)}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title="Continue"
                onPress={() => selectedBranch && handleBranchSelection(selectedBranch)}
                disabled={!selectedBranch}
                style={styles.continueButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderBookingForm = () => {
    if (!booking) return null;

    return (
      <View style={styles.bookingForm}>
        <Text style={styles.bookingTitle}>Complete Your Booking</Text>
        
        {/* Branch Selection */}
        {classData?.branches && classData.branches.length > 1 && (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Selected Branch:</Text>
            <Text style={styles.selectedBranchText}>
              {selectedBranch?.name || 'No branch selected'}
            </Text>
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Payment Method:</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'cash' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <Icon name="money" size={20} color={selectedPaymentMethod === 'cash' ? '#007AFF' : '#666'} />
              <Text style={[
                styles.paymentOptionText,
                selectedPaymentMethod === 'cash' && styles.paymentOptionTextSelected
              ]}>
                Cash
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'card' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('card')}
            >
              <Icon name="credit-card" size={20} color={selectedPaymentMethod === 'card' ? '#007AFF' : '#666'} />
              <Text style={[
                styles.paymentOptionText,
                selectedPaymentMethod === 'card' && styles.paymentOptionTextSelected
              ]}>
                Card/Visa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Process Payment Button */}
        <Button
          title={bookingLoading ? "Processing..." : "Process Payment"}
          onPress={handlePayment}
          disabled={bookingLoading}
          style={styles.processPaymentButton}
        />
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!classData) {
    return <ErrorMessage message="Class not found" />;
  }

  const classItem = classData;

  return (
    <ScrollView style={styles.container}>
      {/* Banner with Image and Navigation */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ 
            uri: classItem.image ? fixImageUrl(classItem.image) : 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Class'
          }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.breadcrumb}>
            <Text style={styles.bannerTitle}>{classItem.name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{classItem.description}</Text>

        {/* Schedules */}
        {classData.schedules && classData.schedules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Class Schedules</Text>
            <View style={styles.schedulesTextContainer}>
              {classData.schedules.map((schedule, index) => (
                <View key={schedule.id?.toString() || index} style={styles.scheduleTextItem}>
                  <View style={styles.scheduleTextHeader}>
                    <Icon name="calendar" size={16} color="#007AFF" />
                    <Text style={styles.scheduleDayText}>{schedule.day}</Text>
                  </View>
                  <Text style={styles.scheduleTimeText}>
                    {schedule.start_time} - {schedule.end_time}
                  </Text>
                  {schedule.duration && (
                    <Text style={styles.scheduleDurationText}>
                      Duration: {schedule.duration}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pricing */}
        {classData.pricings && classData.pricings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Options</Text>
            <View style={styles.pricingTextContainer}>
              {classData.pricings.map((pricing, index) => (
                <View key={pricing.id?.toString() || index} style={styles.pricingTextItem}>
                  <Text style={styles.pricingPriceText}>
                    EGP{pricing.price}
                  </Text>
                  {pricing.duration && (
                    <Text style={styles.pricingDurationText}>
                      Duration: {pricing.duration} session
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trainers */}
        {classData.trainers && classData.trainers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet Our Trainers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trainersList}
            >
              {classData.trainers.map((item, index) => (
                <View key={item.id?.toString() || index}>
                  {renderTrainer({ item })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Branches */}
        {classData.branches && classData.branches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Branches</Text>
            <View style={styles.branchesList}>
              {classData.branches.map((item, index) => (
                <View key={item.id?.toString() || index} style={styles.branchItem}>
                  {renderBranch({ item })}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Booking Section */}
        <View style={styles.bookingSection}>
          {!isAuthenticated ? (
            <View style={styles.authRequiredContainer}>
              <Button
                title="Login to Book"
                onPress={() => navigate('SignIn')}
                style={styles.loginButton}
              />
              <Text style={styles.authRequiredText}>
                Please log in to book this class
              </Text>
            </View>
          ) : (
            <Button
              title="Book This Class"
              onPress={handleBooking}
              style={styles.bookButton}
            />
          )}
          </View>

        {renderBookingForm()}
        {renderBranchModal()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  bannerContainer: {
    height: 250,
    position: 'relative',
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
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  breadcrumb: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  schedulesList: {
    paddingHorizontal: 4,
  },
  scheduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduleDuration: {
    fontSize: 12,
    color: '#666',
  },
  pricingList: {
    paddingHorizontal: 4,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  pricingDuration: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  trainersList: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  trainerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 280,
    minHeight: 450,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    justifyContent: 'flex-start',
  },
  trainerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  trainerSpecialization: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  trainerExperience: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  trainerDescription: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    flex: 1,
  },
  trainerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 2,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  schedulesTextContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  scheduleTextItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  scheduleTextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  scheduleTimeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 24,
  },
  scheduleDurationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24,
    marginTop: 2,
  },
  pricingTextContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pricingTextItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pricingTextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pricingNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  pricingPriceText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
    marginLeft: 24,
  },
  pricingDurationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24,
    marginTop: 2,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    marginHorizontal: 6,
    padding: 8,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  branchItem: {
    width: '48%',
    marginBottom: 12,
  },
  branchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  branchCardSelected: {
    borderColor: '#007AFF',
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  branchAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  mapButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  bookingSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  authRequiredContainer: {
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  authRequiredText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  bookingForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedBranchText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  paymentOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  paymentOptionTextSelected: {
    color: '#007AFF',
  },
  processPaymentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
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
    padding: 16,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  branchList: {
    maxHeight: 300,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 8,
  },
});

export default ClassDetailsScreen;
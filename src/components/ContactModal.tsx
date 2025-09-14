import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { ContactData, ContactFormData } from '../types';
import { contactService } from '../services';
import { useGymContext } from '../contexts/GymContext';
import { Card, Loader, ErrorMessage, Button } from './ui';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Contact Modal Component
 * Displays contact information, form, and map in a modal
 * Follows Single Responsibility Principle - handles only contact modal display
 */
export const ContactModal: React.FC<ContactModalProps> = ({ visible, onClose }) => {
  const { selectedGym } = useGymContext();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const loadContactData = async (): Promise<void> => {
    try {
      setError(null);
      if (!selectedGym?.slug) {
        setError('No gym selected');
        setIsLoading(false);
        return;
      }
      
      const data = await contactService.getContactInfo(selectedGym.slug);
      setContactData(data);
    } catch (err) {
      setError('Failed to load contact information. Please try again.');
      console.error('Contact data loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadContactData();
  };

  const handleInputChange = (field: keyof ContactFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Validation Error', 'Please enter your message');
      return false;
    }
    return true;
  };

  const handleSubmitForm = async (): Promise<void> => {
    if (!validateForm() || !selectedGym?.slug) {
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.submitContactForm(selectedGym.slug, formData);
      Alert.alert(
        'Success',
        'Your message has been sent successfully! We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
              });
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to send your message. Please try again.');
      console.error('Contact form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneCall = (): void => {
    if (contactData?.phone) {
      Linking.openURL(`tel:${contactData.phone}`);
    }
  };

  const handleEmail = (): void => {
    if (contactData?.contact_email) {
      Linking.openURL(`mailto:${contactData.contact_email}`);
    }
  };

  const handleWebsite = (): void => {
    if (contactData?.site_url) {
      Linking.openURL(contactData.site_url);
    }
  };

  const handleSocialMedia = (url: string): void => {
    if (url) {
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    if (visible) {
      loadContactData();
    }
  }, [visible, selectedGym]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Banner with Back Arrow */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=200&fit=crop' }}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerHeader}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.bannerTitle}>Contact Us</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={styles.bannerSubtitle}>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Text>
          </View>
        </ImageBackground>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {isLoading ? (
            <Loader variant="overlay" message="Loading contact information..." />
          ) : (
            <View style={styles.scrollContent}>
              {error && <ErrorMessage message={error} />}

              {contactData && (
                <>
                  {/* Contact Information */}
                  <Card style={styles.contactInfoCard}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    {/* Phone */}
                    <TouchableOpacity style={styles.contactItem} onPress={handlePhoneCall}>
                      <Icon name="phone" size={20} color="#007AFF" />
                      <Text style={styles.contactText}>{contactData.phone}</Text>
                    </TouchableOpacity>

                    {/* Email */}
                    <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                      <Icon name="envelope" size={20} color="#007AFF" />
                      <Text style={styles.contactText}>{contactData.contact_email}</Text>
                    </TouchableOpacity>

                    {/* Address */}
                    <View style={styles.contactItem}>
                      <Icon name="map-marker" size={20} color="#007AFF" />
                      <Text style={styles.contactText}>{contactData.address}</Text>
                    </View>

                    {/* Website */}
                    {contactData.site_url && (
                      <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                        <Icon name="globe" size={20} color="#007AFF" />
                        <Text style={styles.contactText}>Visit our website</Text>
                      </TouchableOpacity>
                    )}
                  </Card>

                  {/* Social Media */}
                  <Card style={styles.socialCard}>
                    <Text style={styles.sectionTitle}>Follow Us</Text>
                    <View style={styles.socialButtons}>
                      {contactData.facebook_url && (
                        <TouchableOpacity
                          style={[styles.socialButton, styles.facebookButton]}
                          onPress={() => handleSocialMedia(contactData.facebook_url)}
                        >
                          <Icon name="facebook" size={20} color="#FFFFFF" />
                          <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>
                      )}
                      
                      {contactData.instagram_url && (
                        <TouchableOpacity
                          style={[styles.socialButton, styles.instagramButton]}
                          onPress={() => handleSocialMedia(contactData.instagram_url)}
                        >
                          <Icon name="instagram" size={20} color="#FFFFFF" />
                          <Text style={styles.socialButtonText}>Instagram</Text>
                        </TouchableOpacity>
                      )}
                      
                      {contactData.x_url && (
                        <TouchableOpacity
                          style={[styles.socialButton, styles.twitterButton]}
                          onPress={() => handleSocialMedia(contactData.x_url)}
                        >
                          <Icon name="twitter" size={20} color="#FFFFFF" />
                          <Text style={styles.socialButtonText}>Twitter</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>

                  {/* Map */}
                  {contactData.site_map && (
                    <Card style={styles.mapCard}>
                      <Text style={styles.sectionTitle}>Find Us</Text>
                      <View style={styles.mapContainer}>
                        <View style={styles.mapPlaceholder}>
                          <Icon name="map-marker" size={48} color="#007AFF" />
                          <Text style={styles.mapTitle}>View Location on Map</Text>
                          <Text style={styles.mapDescription}>
                            Tap to open the location in your default map app
                          </Text>
                          <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => Linking.openURL(contactData.site_map)}
                          >
                            <Icon name="external-link" size={16} color="#FFFFFF" />
                            <Text style={styles.mapButtonText}>Open Map</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  )}

                  {/* Contact Form */}
                  <Card style={styles.formCard}>
                    <View style={styles.formHeader}>
                      <Icon name="envelope" size={24} color="#007AFF" />
                      <Text style={styles.sectionTitle}>Send us a Message</Text>
                    </View>
                    
                    <View style={styles.form}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name *</Text>
                        <View style={styles.inputContainer}>
                          <Icon name="user" size={16} color="#8E8E93" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            placeholder="Your full name"
                            placeholderTextColor="#8E8E93"
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <View style={styles.inputContainer}>
                          <Icon name="envelope" size={16} color="#8E8E93" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            placeholder="your.email@example.com"
                            placeholderTextColor="#8E8E93"
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone *</Text>
                        <View style={styles.inputContainer}>
                          <Icon name="phone" size={16} color="#8E8E93" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            placeholder="Your phone number"
                            placeholderTextColor="#8E8E93"
                            keyboardType="phone-pad"
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Message *</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                          <Icon name="comment" size={16} color="#8E8E93" style={styles.textAreaIcon} />
                          <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.message}
                            onChangeText={(value) => handleInputChange('message', value)}
                            placeholder="Tell us how we can help you..."
                            placeholderTextColor="#8E8E93"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                          />
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmitForm}
                        disabled={isSubmitting}
                      >
                        <Icon 
                          name={isSubmitting ? "spinner" : "paper-plane"} 
                          size={18} 
                          color="#FFFFFF" 
                          style={styles.submitIcon}
                        />
                        <Text style={styles.submitButtonText}>
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  banner: {
    height: 200,
    width: '100%',
  },
  
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  placeholder: {
    width: 40,
  },
  
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 16,
  },
  
  contactInfoCard: {
    marginBottom: 16,
  },
  
  socialCard: {
    marginBottom: 16,
  },
  
  mapCard: {
    marginBottom: 16,
  },
  
  formCard: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  
  contactText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  
  mapDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  mapButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  formHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 20,
  },
  
  form: {
    gap: 20,
  },
  
  inputGroup: {
    gap: 8,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  
  inputIcon: {
    marginRight: 12,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 12,
  },
  
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  
  textAreaIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  
  submitIcon: {
    marginRight: 8,
  },
  
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

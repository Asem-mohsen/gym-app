import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ContactStackParamList, ContactData, ContactFormData } from '../../types';
import { contactService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage, Button } from '../../components/ui';
import { fixImageUrl } from '../../constants/api';
import Icon from 'react-native-vector-icons/FontAwesome';

type ContactUsScreenNavigationProp = StackNavigationProp<
  ContactStackParamList,
  'ContactUs'
>;

interface Props {
  navigation: ContactUsScreenNavigationProp;
}

/**
 * Contact Us Screen Component
 * Displays contact information, form, and map
 * Follows Single Responsibility Principle - handles only contact display and form submission
 */
export const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
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
    loadContactData();
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading contact information..." />;
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

        {/* Header Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Get In Touch</Text>
          <Text style={styles.bannerSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </View>

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
                  <Text style={styles.mapPlaceholder}>
                    Map integration would go here
                  </Text>
                  <Text style={styles.mapNote}>
                    Google Maps embed: {contactData.site_map}
                  </Text>
                </View>
              </Card>
            )}

            {/* Contact Form */}
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Send us a Message</Text>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Your full name"
                    placeholderTextColor="#8E8E93"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Your phone number"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Message *</Text>
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

                <Button
                  title={isSubmitting ? "Sending..." : "Send Message"}
                  onPress={handleSubmitForm}
                  style={styles.submitButton}
                  disabled={isSubmitting}
                />
              </View>
            </Card>
          </>
        )}
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
  
  banner: {
    backgroundColor: '#007AFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  
  mapPlaceholder: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  mapNote: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  form: {
    gap: 16,
  },
  
  inputGroup: {
    gap: 8,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  submitButton: {
    marginTop: 8,
  },
});

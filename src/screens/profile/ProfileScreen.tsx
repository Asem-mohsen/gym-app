import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Button, Input, Loader, ErrorMessage } from '../../components/ui';

/**
 * Profile Screen Component
 * Displays user profile information and allows editing
 * Follows Single Responsibility Principle - handles only profile display and editing
 */
export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, logout, logoutFromAllSessions, logoutFromOtherSessions, isLoading, error } = useAuthContext();
  const { setSelectedGym } = useGymContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = (): void => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Logout Options',
      'Choose your logout preference:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout from this device',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
        {
          text: 'Logout from all devices',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutFromAllSessions();
            } catch (err) {
              Alert.alert('Error', 'Failed to logout from all devices. Please try again.');
            }
          },
        },
        {
          text: 'Logout from other devices',
          onPress: async () => {
            try {
              await logoutFromOtherSessions();
              Alert.alert('Success', 'Logged out from all other devices.');
            } catch (err) {
              Alert.alert('Error', 'Failed to logout from other devices. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = (): void => {
    Alert.alert(
      'Clear Cache',
      'This will clear your selected gym and return you to the gym selection screen. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await setSelectedGym(null);
              Alert.alert('Success', 'Cache cleared. You will be returned to gym selection.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return <Loader variant="overlay" message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {error && <ErrorMessage message={error} />}

        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>
            {isEditing ? formData.name : user?.name}
          </Text>
          <Text style={styles.userEmail}>
            {isEditing ? formData.email : user?.email}
          </Text>
        </Card>

        {/* Profile Information */}
        <Card style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                error={validationErrors.name}
                required
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={validationErrors.email}
                required
              />

              <Input
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                error={validationErrors.phone}
              />

              <View style={styles.editButtons}>
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleSave}
                  loading={isLoading}
                  style={styles.saveButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <Button
            title="Clear Cache & Return to Gym Selection"
            onPress={handleClearCache}
            variant="outline"
            style={styles.clearCacheButton}
          />
          
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
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
    alignItems: 'center',
    marginBottom: 16,
  },
  
  avatarContainer: {
    marginBottom: 16,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  infoCard: {
    marginBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  
  editForm: {
    marginTop: 8,
  },
  
  editButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  
  infoList: {
    marginTop: 8,
  },
  
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  
  actionsCard: {
    marginBottom: 16,
  },
  
  clearCacheButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  
  logoutButton: {
    marginTop: 8,
  },
});

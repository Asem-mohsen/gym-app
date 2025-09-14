import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGymContext } from '../../contexts/GymContext';
import { Button, Input, ErrorMessage } from '../../components/ui';
import { fixImageUrl } from '../../constants/api';

interface Props {
  onClose: () => void;
}

/**
 * Signup Screen Component
 * Follows Single Responsibility Principle - handles only signup functionality
 */
export const SignupScreen: React.FC<Props> = ({ onClose }) => {
  const { signup, error, clearError, isLoading } = useAuthContext();
  const { selectedGym } = useGymContext();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
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

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.password_confirmation.trim()) {
      errors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      if (clearError) {
        clearError();
      }
      await signup(formData, selectedGym?.slug);
      // Close modal on successful signup
      onClose();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Signup error:', err);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {selectedGym?.logo && (
              <Image 
                source={{ uri: fixImageUrl(selectedGym.logo) }} 
                style={styles.gymLogo}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={validationErrors.name}
              required
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={validationErrors.email}
              required
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number (optional)"
              keyboardType="phone-pad"
              error={validationErrors.phone}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
              error={validationErrors.password}
              required
            />

            <Input
              label="Confirm Password"
              value={formData.password_confirmation}
              onChangeText={(value) => handleInputChange('password_confirmation', value)}
              placeholder="Confirm your password"
              secureTextEntry
              error={validationErrors.password_confirmation}
              required
            />

            <ErrorMessage message={error || ''} visible={!!error} />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? Contact the gym to sign in.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  scrollContainer: {
    flexGrow: 1,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  gymLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  form: {
    width: '100%',
  },
  
  signupButton: {
    marginTop: 16,
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  
  footerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

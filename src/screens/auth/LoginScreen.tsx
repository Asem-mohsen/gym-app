import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
 * Login Screen Component
 * Follows Single Responsibility Principle - handles only login functionality
 */
export const LoginScreen: React.FC<Props> = ({ onClose }) => {
  const { login, error, clearError, isLoading } = useAuthContext();
  const { selectedGym } = useGymContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      if (clearError) {
        clearError();
      }
      await login(formData, selectedGym?.slug);
      // Close modal on successful login
      onClose();
    } catch (err: any) {
      // Error is handled by the auth context
      console.error('Login error:', err?.message || err?.error || err || 'Unknown error');
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
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
              error={validationErrors.password}
              required
            />

            <ErrorMessage message={error || ''} visible={!!error} />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? Contact the gym to sign up.</Text>
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
  
  loginButton: {
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

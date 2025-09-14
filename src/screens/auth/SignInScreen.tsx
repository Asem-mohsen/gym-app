import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGymContext } from '../../contexts/GymContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { Button, Input, ErrorMessage } from '../../components/ui';
import { fixImageUrl } from '../../constants/api';

/**
 * Standalone Sign In Screen
 * Displays login and signup forms without modal
 * Follows Single Responsibility Principle - handles only authentication display
 */
export const SignInScreen: React.FC = () => {
  const { login, signup, isLoading, error, clearError, isAuthenticated } = useAuthContext();
  const { selectedGym } = useGymContext();
  const { setActiveTab } = useNavigationContext();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    name: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Authentication guard - redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('Home');
    }
  }, [isAuthenticated, setActiveTab]);

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

    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone is required';
      }
      if (!formData.password_confirmation.trim()) {
        errors.password_confirmation = 'Password confirmation is required';
      } else if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match';
      }
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
    } catch (err: any) {
      console.error('Login error:', err?.message || err?.error || err || 'Unknown error');
    }
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      if (clearError) {
        clearError();
      }
      await signup({
        ...formData,
        phone: formData.phone || undefined,
      }, selectedGym?.slug);
    } catch (err: any) {
      console.error('Signup error:', err?.message || err?.error || err || 'Unknown error');
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchAuthMode = (): void => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', password_confirmation: '', name: '', phone: '' });
    setValidationErrors({});
    if (clearError) {
      clearError();
    }
  };

  if (!selectedGym) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Please select a gym first</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Gym Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: fixImageUrl(selectedGym?.logo || '') }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Auth Mode Toggle */}
          <View style={styles.authModeContainer}>
            <TouchableOpacity
              style={[styles.authModeButton, authMode === 'login' && styles.activeAuthMode]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.authModeText, authMode === 'login' && styles.activeAuthModeText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authModeButton, authMode === 'signup' && styles.activeAuthMode]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[styles.authModeText, authMode === 'signup' && styles.activeAuthModeText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && <ErrorMessage message={error} visible={!!error} />}

          {/* Form Fields */}
          {authMode === 'signup' && (
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={validationErrors.name}
              placeholder="Enter your full name"
            />
          )}

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            error={validationErrors.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {authMode === 'signup' && (
            <Input
              label="Phone"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              error={validationErrors.phone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          )}

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={validationErrors.password}
            placeholder="Enter your password"
            secureTextEntry
          />

          {authMode === 'signup' && (
            <Input
              label="Confirm Password"
              value={formData.password_confirmation}
              onChangeText={(value) => handleInputChange('password_confirmation', value)}
              error={validationErrors.password_confirmation}
              placeholder="Confirm your password"
              secureTextEntry
            />
          )}

          {/* Submit Button */}
          <Button
            title={authMode === 'login' ? 'Sign In' : 'Sign Up'}
            onPress={authMode === 'login' ? handleLogin : handleSignup}
            loading={isLoading}
            style={styles.submitButton}
          />

          {/* Switch Mode */}
          <TouchableOpacity onPress={switchAuthMode} style={styles.switchModeButton}>
            <Text style={styles.switchModeText}>
              {authMode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  authModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  authModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeAuthMode: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeAuthModeText: {
    color: '#007AFF',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

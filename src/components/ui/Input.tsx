import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

export type InputVariant = 'default' | 'outline' | 'filled';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

/**
 * Reusable Input Component
 * Follows Single Responsibility Principle - handles only input rendering
 * Follows Open/Closed Principle - can be extended with new variants
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  required = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    isFocused && styles.focused,
    error && styles.error,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    error && styles.errorLabel,
    labelStyle,
  ];

  const errorStyles = [
    styles.errorText,
    errorStyle,
  ];

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={labelStyles}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#8E8E93"
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={errorStyles}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  
  required: {
    color: '#FF3B30',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  
  // Variants
  default: {
    backgroundColor: '#FFFFFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
  },
  filled: {
    backgroundColor: '#F2F2F7',
    borderColor: 'transparent',
  },
  
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  
  inputWithRightIcon: {
    paddingRight: 8,
  },
  
  leftIcon: {
    paddingLeft: 12,
  },
  
  rightIcon: {
    paddingRight: 12,
  },
  
  focused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  
  error: {
    borderColor: '#FF3B30',
  },
  
  errorLabel: {
    color: '#FF3B30',
  },
  
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
});

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type LoaderSize = 'small' | 'large';
export type LoaderVariant = 'default' | 'overlay' | 'inline';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  message?: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  visible?: boolean;
}

/**
 * Reusable Loader Component
 * Follows Single Responsibility Principle - handles only loading state rendering
 * Follows Open/Closed Principle - can be extended with new variants
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  variant = 'default',
  message,
  color = '#007AFF',
  style,
  textStyle,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  const containerStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const messageStyle = [
    styles.message,
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={messageStyle}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  default: {
    padding: 20,
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  
  inline: {
    padding: 10,
    flexDirection: 'row',
  },
  
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ErrorMessageProps {
  message: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  visible?: boolean;
}

/**
 * Reusable Error Message Component
 * Follows Single Responsibility Principle - handles only error message rendering
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  style,
  textStyle,
  visible = true,
}) => {
  if (!visible || !message) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  
  text: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
});

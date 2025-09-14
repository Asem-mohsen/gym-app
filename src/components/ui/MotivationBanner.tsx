import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface MotivationBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonPress: () => void;
  backgroundImage?: any;
}

/**
 * Motivation Banner Component
 * Displays an inspirational banner with call-to-action button
 * Follows Single Responsibility Principle - handles only motivation banner display
 */
export const MotivationBanner: React.FC<MotivationBannerProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonPress,
  backgroundImage,
}) => {
  return (
    <ImageBackground
      source={backgroundImage || { uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=200&fit=crop' }}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            <Icon name="envelope" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  imageStyle: {
    // Fix sticky image issue by ensuring proper positioning
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

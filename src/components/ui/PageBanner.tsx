import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PageBannerProps {
  title: string;
  subtitle: string;
  image: any; // Image source
}

/**
 * Page Banner Component
 * Displays a banner at the top of pages with title, subtitle, and background image
 * Follows Single Responsibility Principle - handles only page banner display
 */
export const PageBanner: React.FC<PageBannerProps> = ({
  title,
  subtitle,
  image,
}) => {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width: screenWidth } = Dimensions.get('window');

interface HeroSlide {
  id: string;
  image: any; // Image source
  title: string;
  subtitle: string;
  actionText: string;
  actionIcon?: string; // Icon name for the action button
  onPress: () => void;
}

interface HeroBannerProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
}

/**
 * Hero Banner Component with Auto-Sliding
 * Displays a rotating banner with call-to-action buttons
 * Follows Single Responsibility Principle - handles only hero banner display
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides,
  autoPlay = true,
  interval = 7000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const handleSlidePress = (slide: HeroSlide) => {
    slide.onPress();
  };

  const renderSlide = (slide: HeroSlide, index: number) => (
    <TouchableOpacity
      key={slide.id}
      style={styles.slide}
      onPress={() => handleSlidePress(slide)}
      activeOpacity={0.9}
    >
      <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
      <View style={styles.slideOverlay}>
        <View style={styles.slideContent}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSlidePress(slide)}
          >
            {slide.actionIcon && (
              <Icon name={slide.actionIcon} size={20} color="#FFFFFF" style={styles.actionIcon} />
            )}
            <Text style={styles.actionButtonText}>{slide.actionText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  if (slides.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        {renderSlide(slides[currentIndex], currentIndex)}
      </View>
      {slides.length > 1 && renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sliderContainer: {
    height: 200,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slide: {
    flex: 1,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  inactiveDot: {
    backgroundColor: '#C7C7CC',
  },
});

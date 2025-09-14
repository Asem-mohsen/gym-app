import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = screenWidth * 0.7; // 70% of screen width

interface SliderItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: any;
  onPress?: () => void;
}

interface SliderProps {
  title: string;
  items: SliderItem[];
  renderItem?: (item: SliderItem) => React.ReactNode;
  onItemPress?: (item: SliderItem) => void;
  onViewAllPress?: () => void;
}

/**
 * Horizontal Slider Component
 * Displays items in a horizontal scrollable list
 * Follows Single Responsibility Principle - handles only slider display
 */
export const Slider: React.FC<SliderProps> = ({
  title,
  items,
  renderItem,
  onItemPress,
  onViewAllPress,
}) => {
  const handleItemPress = (item: SliderItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (onItemPress) {
      onItemPress(item);
    }
  };

  const defaultRenderItem = (item: SliderItem) => (
    <TouchableOpacity
      style={styles.sliderItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      {item.image && (
        <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
      )}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.itemSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            {renderItem ? renderItem(item) : defaultRenderItem(item)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  itemContainer: {
    width: itemWidth,
    marginRight: 12,
  },
  sliderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 200, // Ensure minimum height
    flex: 1,
  },
  itemImage: {
    width: '100%',
    height: 120,
  },
  itemContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
});

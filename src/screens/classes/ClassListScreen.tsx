import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClassStackParamList, Class } from '../../types';
import { classService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { Card, Loader, ErrorMessage } from '../../components/ui';

type ClassListScreenNavigationProp = StackNavigationProp<
  ClassStackParamList,
  'ClassList'
>;

interface Props {
  navigation: ClassListScreenNavigationProp;
}

/**
 * Class List Screen Component
 * Displays list of available classes
 * Follows Single Responsibility Principle - handles only class list display
 */
export const ClassListScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedGym } = useGymContext();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async (): Promise<void> => {
    try {
      setError(null);
      const data = await classService.getAllClasses(selectedGym?.slug);
      setClasses(data);
    } catch (err) {
      setError('Failed to load classes. Please try again.');
      console.error('Class loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadClasses();
  };

  const handleClassPress = (classItem: Class): void => {
    navigation.navigate('ClassDetails', { id: classItem.id });
  };

  // Helper function to safely render text that might be an object
  const getSafeText = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      // Handle translation objects like {en: "text", ar: "text"}
      if (value.en) {
        return value.en;
      } else if (value.name) {
        return value.name;
      } else {
        return JSON.stringify(value);
      }
    } else {
      return String(value || '');
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderClass = ({ item }: { item: Class }) => (
    <TouchableOpacity onPress={() => handleClassPress(item)}>
      <Card style={styles.classCard}>
        <View style={styles.classHeader}>
          <Text style={styles.className}>{getSafeText(item.name)}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${getSafeText(item.price)}</Text>
          </View>
        </View>
        
        <Text style={styles.classDescription}>{getSafeText(item.description)}</Text>
        
        <View style={styles.classDetails}>
          <Text style={styles.instructor}>Instructor: {getSafeText(item.instructor)}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.is_active ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.is_active ? styles.activeText : styles.inactiveText
              ]}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatDate(item.start_time)} • {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
        </View>

        <View style={styles.participantsContainer}>
          <Text style={styles.participantsText}>
            {item.current_participants}/{item.max_participants} participants
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No classes available</Text>
    </View>
  );

  useEffect(() => {
    loadClasses();
  }, [selectedGym]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading classes..." />;
  }

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} />}
      
      <FlatList
        data={classes}
        renderItem={renderClass}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  listContainer: {
    padding: 16,
  },
  
  classCard: {
    marginBottom: 16,
  },
  
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  
  priceContainer: {
    alignItems: 'flex-end',
  },
  
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  classDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 22,
  },
  
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  instructor: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  statusContainer: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  activeText: {
    color: '#4CAF50',
  },
  
  inactiveText: {
    color: '#F44336',
  },
  
  timeContainer: {
    marginBottom: 8,
  },
  
  timeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  participantsContainer: {
    alignItems: 'flex-start',
  },
  
  participantsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

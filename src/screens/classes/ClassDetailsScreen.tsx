import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClassStackParamList, Class } from '../../types';
import { classService } from '../../services';
import { Card, Loader, ErrorMessage, Button } from '../../components/ui';

type ClassDetailsScreenNavigationProp = StackNavigationProp<
  ClassStackParamList,
  'ClassDetails'
>;

type ClassDetailsScreenRouteProp = RouteProp<
  ClassStackParamList,
  'ClassDetails'
>;

interface Props {
  navigation: ClassDetailsScreenNavigationProp;
  route: ClassDetailsScreenRouteProp;
}

/**
 * Class Details Screen Component
 * Displays detailed information about a specific class
 * Follows Single Responsibility Principle - handles only class details display
 */
export const ClassDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const [classItem, setClassItem] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClass = async (): Promise<void> => {
    try {
      setError(null);
      const data = await classService.getClassById(id);
      setClassItem(data);
    } catch (err) {
      setError('Failed to load class details. Please try again.');
      console.error('Class details loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadClass();
  };

  const handleBookClass = (): void => {
    // TODO: Implement booking functionality
    console.log('Book class:', classItem?.id);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    loadClass();
  }, [id]);

  if (isLoading) {
    return <Loader variant="overlay" message="Loading class details..." />;
  }

  if (!classItem) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Class not found" />
      </View>
    );
  }

  const isFullyBooked = classItem.current_participants >= classItem.max_participants;
  const canBook = classItem.is_active && !isFullyBooked;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {error && <ErrorMessage message={error} />}

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Text style={styles.className}>{classItem.name}</Text>
          <Text style={styles.classDescription}>{classItem.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${classItem.price}</Text>
            <Text style={styles.priceUnit}>per class</Text>
          </View>
        </Card>

        {/* Schedule Card */}
        <Card style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.dateText}>{formatDate(classItem.start_time)}</Text>
          <Text style={styles.timeText}>
            {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
          </Text>
        </Card>

        {/* Instructor Card */}
        <Card style={styles.instructorCard}>
          <Text style={styles.sectionTitle}>Instructor</Text>
          <Text style={styles.instructorName}>{classItem.instructor}</Text>
        </Card>

        {/* Participants Card */}
        <Card style={styles.participantsCard}>
          <Text style={styles.sectionTitle}>Class Capacity</Text>
          <Text style={styles.participantsText}>
            {classItem.current_participants} / {classItem.max_participants} participants
          </Text>
          
          {isFullyBooked && (
            <Text style={styles.fullyBookedText}>This class is fully booked</Text>
          )}
        </Card>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[
            styles.statusBadge,
            classItem.is_active ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              classItem.is_active ? styles.activeText : styles.inactiveText
            ]}>
              {classItem.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Card>

        {/* Book Button */}
        {canBook && (
          <View style={styles.bookContainer}>
            <Button
              title="Book This Class"
              onPress={handleBookClass}
              style={styles.bookButton}
            />
          </View>
        )}

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <Text style={styles.infoText}>
            • Please arrive 10 minutes before class starts{'\n'}
            • Bring a water bottle and towel{'\n'}
            • Wear comfortable workout clothes{'\n'}
            • Cancellation must be made 2 hours before class{'\n'}
            • No refunds for no-shows
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  content: {
    padding: 16,
  },
  
  headerCard: {
    marginBottom: 16,
  },
  
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  
  classDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 16,
  },
  
  priceContainer: {
    alignItems: 'flex-start',
  },
  
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  priceUnit: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  scheduleCard: {
    marginBottom: 16,
  },
  
  instructorCard: {
    marginBottom: 16,
  },
  
  participantsCard: {
    marginBottom: 16,
  },
  
  statusCard: {
    marginBottom: 16,
  },
  
  infoCard: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  timeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  instructorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  
  participantsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  
  fullyBookedText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  activeText: {
    color: '#4CAF50',
  },
  
  inactiveText: {
    color: '#F44336',
  },
  
  bookContainer: {
    marginBottom: 24,
  },
  
  bookButton: {
    marginHorizontal: 0,
  },
  
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

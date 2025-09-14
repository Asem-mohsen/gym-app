import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClassStackParamList, Class } from '../../types';
import { classService } from '../../services';
import { useGymContext } from '../../contexts/GymContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { Card, Loader, ErrorMessage, PageBanner, Button } from '../../components/ui';
import { heroImages, classImages } from '../../assets/images/placeholders';
import { fixImageUrl } from '../../constants/api';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const { navigate } = useNavigationContext();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [classTypes, setClassTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassType, setSelectedClassType] = useState<string>('');

  const loadClasses = async (): Promise<void> => {
    try {
      setError(null);
      const response = await classService.getAllClasses(selectedGym?.slug);
      
      // Handle the new API response structure
      if (response && typeof response === 'object' && 'classes' in response) {
        setClasses(response.classes || []);
        setClassTypes(response.class_types || []);
      } else {
        // Fallback for old API structure
        setClasses(Array.isArray(response) ? response : []);
        setClassTypes([]);
      }
      
      setFilteredClasses(response.classes || response || []);
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

  const filterClasses = () => {
    let filtered = classes;

    // Filter by search query (class name or branch)
    if (searchQuery.trim()) {
      filtered = filtered.filter(classItem => {
        const className = getSafeText(classItem.name).toLowerCase();
        const branchNames = classItem.branches?.map(branch => 
          getSafeText(branch.name || branch).toLowerCase()
        ).join(' ') || '';
        
        return className.includes(searchQuery.toLowerCase()) || 
               branchNames.includes(searchQuery.toLowerCase());
      });
    }

    // Filter by class type
    if (selectedClassType) {
      filtered = filtered.filter(classItem => {
        const classType = getSafeText(classItem.class_type || classItem.type).toLowerCase();
        return classType === selectedClassType.toLowerCase();
      });
    }

    setFilteredClasses(filtered);
  };

  // Update filtered classes when search query or class type changes
  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedClassType, classes]);

  const handleClassPress = (classItem: Class): void => {
    navigate('Classes', { classId: classItem.id });
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

  const renderClass = ({ item }: { item: Class }) => {
    // Get duration from schedules array or calculate from start/end time
    const getDuration = () => {
      if (item.schedules && item.schedules.length > 0) {
        return item.schedules[0].duration || 'N/A';
      }
      // Fallback calculation
      if (item.start_time && item.end_time) {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        return `${durationMinutes} minutes`;
      }
      return 'N/A';
    };

    return (
      <TouchableOpacity onPress={() => handleClassPress(item)}>
        <Card style={styles.classCard}>
          {/* Class Image */}
          <Image 
            source={item.image ? { uri: fixImageUrl(item.image) } : classImages.default} 
            style={styles.classImage} 
            resizeMode="cover" 
          />
          
          <View style={styles.classContent}>
            <View style={styles.classHeader}>
              <Text style={styles.className}>{getSafeText(item.name)}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {item.pricings && item.pricings.length > 0 
                    ? `EGP${getSafeText(item.pricings[0].price)}`
                    : 'N/A'
                  }
                </Text>
                {item.pricings && item.pricings.length > 0 && (
                  <Text style={styles.durationText}>
                    / {getSafeText(item.pricings[0].duration)}
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={styles.classDescription}>{getSafeText(item.description)}</Text>
            
            {/* Trainers Information */}
            <View style={styles.trainerContainer}>
              <Icon name="person" size={16} color="#007AFF" />
              <Text style={styles.trainerText}>
                Trainers: {item.trainers && item.trainers.length > 0 
                  ? item.trainers.map(trainer => getSafeText(trainer.name || trainer)).join(', ')
                  : 'TBA'
                }
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.classDetails}>
              <View style={styles.durationContainer}>
                <Icon name="schedule" size={16} color="#007AFF" />
                <Text style={styles.durationText}> Duration: {getDuration()}</Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    item.status === 'active' ? styles.activeText : styles.inactiveText
                  ]}>
                    {item.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Schedule Information */}
            <View style={styles.scheduleContainer}>
              <Icon name="event" size={16} color="#007AFF" />
              <Text style={styles.scheduleText}>
                {item.schedules && item.schedules.length > 0 
                  ? item.schedules.map(schedule => 
                      `${getSafeText(schedule.day)} ${getSafeText(schedule.start_time)}-${getSafeText(schedule.end_time)}`
                    ).join(', ')
                  : `${formatDate(item.start_time)} • ${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
                }
              </Text>
            </View>


            {/* Branches Information */}
            {item.branches && item.branches.length > 0 && (
              <View style={styles.branchesContainer}>
                <Icon name="location-on" size={16} color="#007AFF" />
                <Text style={styles.branchesText}>
                  Available at: {item.branches.map(branch => getSafeText(branch.name || branch)).join(', ')}
                </Text>
              </View>
            )}

            {/* Additional Schedules if available */}
            {item.schedules && item.schedules.length > 1 && (
              <View style={styles.additionalSchedulesContainer}>
                <Text style={styles.additionalSchedulesTitle}>All Schedules:</Text>
                {item.schedules.map((schedule: any, index: number) => (
                  <Text key={index} style={styles.additionalScheduleText}>
                    • {getSafeText(schedule.day)} {getSafeText(schedule.start_time)}-{getSafeText(schedule.end_time)} ({getSafeText(schedule.duration)})
                  </Text>
                ))}
              </View>
            )}

            {/* View Details Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="View Details & Book"
                onPress={() => handleClassPress(item)}
                style={styles.viewDetailsButton}
                textStyle={styles.viewDetailsButtonText}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
      <PageBanner
        title="Group Classes"
        subtitle="Join our amazing group fitness classes led by certified trainers and achieve your fitness goals together"
        image={heroImages.classes}
      />
      
      {error && <ErrorMessage message={error} />}
      
      {/* Search and Filter Section */}
      <View style={styles.searchFilterContainer}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes or branches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Class Type Filter */}
        {classTypes.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedClassType === '' && styles.filterChipActive
              ]}
              onPress={() => setSelectedClassType('')}
            >
              <Text style={[
                styles.filterChipText,
                selectedClassType === '' && styles.filterChipTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {classTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedClassType === type && styles.filterChipActive
                ]}
                onPress={() => setSelectedClassType(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedClassType === type && styles.filterChipTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <FlatList
        data={filteredClasses}
        renderItem={renderClass}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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
  
  searchFilterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
  },
  
  filterContainer: {
    marginTop: 4,
  },
  
  filterContent: {
    paddingRight: 16,
  },
  
  filterChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  
  filterChipTextActive: {
    color: 'white',
  },
  
  branchesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  branchesText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  
  listContainer: {
    padding: 16,
  },
  
  classCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  classImage: {
    width: '100%',
    height: 150,
  },
  
  classContent: {
    padding: 16,
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
  
  trainerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  trainerText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  durationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  scheduleText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  
  additionalSchedulesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  
  additionalSchedulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  additionalScheduleText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  
  moreSchedulesText: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
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
  
  buttonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

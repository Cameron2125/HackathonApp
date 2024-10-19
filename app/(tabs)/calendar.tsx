// app/calendar.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Button, Card, useTheme } from 'react-native-paper';
import { 
  format, 
  addDays, 
  isSameDay, 
  startOfToday, 
  subDays 
} from 'date-fns';

interface Event {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
}

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [days, setDays] = useState<Date[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const events: Event[] = [
    {
      id: '1',
      name: 'Math Class',
      startTime: new Date(selectedDate.setHours(9, 0, 0, 0)),
      endTime: new Date(selectedDate.setHours(10, 0, 0, 0)),
    },
    {
      id: '2',
      name: 'Lunch Break',
      startTime: new Date(selectedDate.setHours(12, 0, 0, 0)),
      endTime: new Date(selectedDate.setHours(13, 0, 0, 0)),
    },
  ];

  useEffect(() => {
    const initialDays = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 15 - i));
    setDays(initialDays);

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 15, animated: false });
    }, 0);
  }, []);

  const handleViewChange = (selectedView: 'Day' | 'Week' | 'Month') => {
    setView(selectedView);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  const renderDay = ({ item }: { item: Date }) => (
    <TouchableOpacity onPress={() => handleDayPress(item)}>
      <Text
        style={[
          styles.dayText,
          isSameDay(item, selectedDate) && styles.selectedDayText,
        ]}
      >
        {format(item, 'EEE d')}
      </Text>
    </TouchableOpacity>
  );

  const loadMoreDays = useCallback(() => {
    const lastDay = days[days.length - 1];
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(lastDay, i + 1));
    setDays([...days, ...newDays]);
  }, [days]);

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;

      // Load more days only when near the right edge
      if (contentOffset.x + layoutMeasurement.width >= contentSize.width - 50) {
        loadMoreDays();
      }
    },
    [loadMoreDays]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* View Selector */}
        <View style={styles.selector}>
          {['Day', 'Week', 'Month'].map((option) => (
            <Button
              key={option}
              mode={view === option ? 'contained' : 'outlined'}
              onPress={() => handleViewChange(option as 'Day' | 'Week' | 'Month')}
              style={[
                styles.selectorButton,
                view === option && { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={[
                styles.selectorText,
                view === option && { color: 'white', fontWeight: 'bold' },
              ]}
            >
              {option}
            </Button>
          ))}
        </View>

        {/* Month Title */}
        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>

        {/* Infinite Scrolling Days */}
        <FlatList
          ref={flatListRef}
          data={days}
          horizontal
          keyExtractor={(item) => item.toISOString()}
          renderItem={renderDay}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          contentContainerStyle={styles.daysContainer}
          getItemLayout={(_, index) => ({
            length: 60,
            offset: 60 * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 100);
          }}
        />

        {/* Calendar Layout with Time Column and Events */}
        <View style={styles.calendar}>
          <View style={styles.timesColumn}>
            {Array.from({ length: 24 }, (_, i) => (
              <Text key={i} style={styles.timeText}>
                {`${i}:00`}
              </Text>
            ))}
          </View>
          <ScrollView style={styles.eventsColumn}>
            {events.map((event) => (
              <Card key={event.id} style={styles.eventCard}>
                <Text style={styles.eventText}>{event.name}</Text>
                <Text style={styles.eventTime}>
                  {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  container: {
    padding: 16,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectorButton: {
    flex: 1,
    borderRadius: 0,
  },
  selectorText: {
    fontSize: 16,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  daysContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 18,
    marginHorizontal: 12,
  },
  selectedDayText: {
    fontWeight: 'bold',
    color: 'red',
  },
  calendar: {
    flexDirection: 'row',
    marginTop: 16,
  },
  timesColumn: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingRight: 8,
  },
  timeText: {
    height: 60,
    textAlign: 'right',
    paddingRight: 8,
    fontSize: 14,
    color: '#555',
  },
  eventsColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  eventCard: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#1e88e5',
    borderRadius: 8,
  },
  eventText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventTime: {
    color: 'white',
    fontSize: 12,
  },
});

export default CalendarPage;

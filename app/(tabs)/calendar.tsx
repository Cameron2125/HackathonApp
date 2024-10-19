// app/calendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Button, Card, useTheme } from 'react-native-paper';
import { format, addDays, subDays, isSameDay, startOfToday, addHours } from 'date-fns';

interface Event {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
}

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollRef = useRef<ScrollView>(null);

  const events: Event[] = [
    {
      id: '1',
      name: 'Math Class',
      startTime: addHours(startOfToday(), 9),
      endTime: addHours(startOfToday(), 10),
    },
    {
      id: '2',
      name: 'Lunch Break',
      startTime: addHours(startOfToday(), 12),
      endTime: addHours(startOfToday(), 13),
    },
  ];

  const handleViewChange = (selectedView: 'Day' | 'Week' | 'Month') => {
    setView(selectedView);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  const generateDays = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 40 * 3, animated: true }); // Center the current day
    }
  }, []);

  const times = Array.from({ length: 24 }, (_, i) => `${i}:00`);

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

        {/* Horizontal Scrollable Days */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
          contentContainerStyle={styles.daysContainer}
        >
          {generateDays().map((day) => (
            <TouchableOpacity key={day.toISOString()} onPress={() => handleDayPress(day)}>
              <Text
                style={[
                  styles.dayText,
                  isSameDay(day, selectedDate) && styles.selectedDayText,
                ]}
              >
                {format(day, 'EEE d')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Calendar Layout */}
        <ScrollView contentContainerStyle={styles.calendarContainer}>
          <View style={styles.calendar}>
            <View style={styles.timesColumn}>
              {times.map((time) => (
                <Text key={time} style={styles.timeText}>
                  {time}
                </Text>
              ))}
            </View>
            <View style={styles.eventsColumn}>
              {events.map((event) => (
                <Card key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventText}>{event.name}</Text>
                  <Text style={styles.eventTime}>
                    {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
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
    color: 'red',
    marginBottom: 8,
    textAlign: 'left',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 50, // Ensure enough height
    alignItems: 'center', // Align vertically in the center
  },
  dayText: {
    fontSize: 18,
    color: '#333',
    marginHorizontal: 12, // Provide space between days
    lineHeight: 24, // Prevent cutting off text
  },
  selectedDayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  calendarContainer: {
    flexGrow: 1,
  },
  calendar: {
    flexDirection: 'row',
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

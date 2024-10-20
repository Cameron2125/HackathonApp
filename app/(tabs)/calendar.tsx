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
import { Button, Card, Title, useTheme } from 'react-native-paper';
import { 
  format, 
  addDays, 
  isSameDay, 
  startOfToday, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek 
} from 'date-fns';

interface Event {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  date: Date;
}
const DayView: React.FC<{
  selectedDate: Date;
  days: Date[];
  flatListRef: React.RefObject<FlatList>;
  renderDay: ({ item }: { item: Date }) => JSX.Element;
  handleScroll: (event: any) => void;
  events: Event[];
  timeOfDay: Date;
}> = ({
  selectedDate,
  days,
  flatListRef,
  renderDay,
  handleScroll,
  events,
  timeOfDay,
}) => {
  // Filter events based on the selected date
  const filteredEvents = events.filter(event =>
    isSameDay(event.startTime, selectedDate) // Assuming startTime is a Date object
  );

  return (
    <>
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
      />

      {/* Calendar Layout with Time Column and Events */}
      <ScrollView
        style={styles.calendarScrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.calendar}>
          {/* Time Column */}
          <View style={styles.timesColumn}>
            {Array.from({ length: 24 }, (_, i) => (
              <Text key={i} style={styles.timeText}>
                {`${i}:00`}
              </Text>
            ))}
            {/* Current Time Bar / Indicator */}
          </View>

          {/* Events Column */}
          <View style={styles.eventsColumn}>
            {filteredEvents.map((event) => {
              const startHour = event.startTime.getHours();
              const startMinute = event.startTime.getMinutes();
              const eventTop = (startHour + startMinute / 60) * 60; // Calculate the position based on time

              return (
                <Card
                  key={event.id}
                  style={[styles.eventCard, { top: eventTop }]} // Position the event based on start time
                >
                  <Text style={styles.eventText}>{event.name}</Text>
                  <Text style={styles.eventTime}>
                    {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                  </Text>
                </Card>
              );
            })}
            <View
              style={[
                styles.currentTimeBar,
                {
                  top: (timeOfDay.getHours() + timeOfDay.getMinutes() / 60) * 60,
                },
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};
const WeekView: React.FC<{
  selectedDate: Date; // The date representing the current week
  days: Date[]; // The array of dates for the week
  flatListRef: React.RefObject<FlatList>;
  renderDay: ({ item }: { item: Date }) => JSX.Element;
  handleScroll: (event: any) => void;
  events: Event[]; // List of all events
  timeOfDay: Date; // Current time for display
}> = ({
  selectedDate,
  flatListRef,
  renderDay,
  handleScroll,
  events,
  timeOfDay,
}) => {
  const weekStart = startOfWeek(selectedDate); // Get the start of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)); // Create an array of days in the week

  return (
    <>
      {/* Infinite Scrolling Days */}
      <FlatList
        ref={flatListRef}
        data={weekDays}
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
      />

      {/* Calendar Layout with Time Column and Events */}
      <ScrollView
        style={styles.calendarScrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.calendar}>
          {/* Time Column */}
          <View style={styles.timesColumn}>
            {Array.from({ length: 24 }, (_, i) => (
              <Text key={i} style={styles.timeText}>
                {`${i}:00`}
              </Text>
            ))}
          </View>

          {/* Events for each day in the week */}
          <View style={styles.weekEventsContainer}>
            {weekDays.map((day) => (
              <View key={day.toISOString()} style={styles.dayColumn}>
                <Text style={styles.weekDayText}>{format(day, 'EEE d')}</Text>
                
                {/* Filter and display events for the current day */}
                {events
                  .filter(event => isSameDay(event.startTime, day)) // Filter events by startTime for this day
                  .map(event => {
                    const startHour = event.startTime.getHours();
                    const startMinute = event.startTime.getMinutes();
                    const eventTop = (startHour + startMinute / 60) * 60; // Calculate position based on time

                    return (
                      <Card
                        key={event.id}
                        style={[styles.eventCard, { top: eventTop }]} // Position the event based on start time
                      >
                        <Text style={styles.eventText}>{event.name}</Text>
                        <Text style={styles.eventTime}>
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </Text>
                      </Card>
                    );
                  })}

                {/* Current Time Indicator */}
                <View
                  style={[
                    styles.currentTimeBar,
                    {
                      top: (timeOfDay.getHours() + timeOfDay.getMinutes() / 60) * 60,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const MonthView: React.FC<{
  selectedDate: Date;
  events: Event[];
  handleDayPress: (date: Date) => void;
}> = ({ selectedDate, events, handleDayPress }) => {
  const start = startOfWeek(startOfMonth(selectedDate));
  const end = endOfWeek(endOfMonth(selectedDate));

  const days: Date[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    days.push(day);
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.monthViewContainer}>
      {/* Day Labels */}
      <View style={styles.monthDayLabelsContainer}>
        {dayLabels.map((label, index) => (
          <Text key={index} style={styles.monthDayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Month Grid */}
      <View style={styles.monthGrid}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.toISOString()}
            onPress={() => handleDayPress(day)}
            style={styles.monthDayCell}
          >
            {/* Day Number with circular background for selected day */}
            <View
              style={[
                styles.dayNumberContainer,
                isSameDay(day, selectedDate) && styles.selectedDayNumberContainer,
              ]}
            >
              <Text
                style={[
                  styles.monthDayNumber,
                  isSameDay(day, selectedDate) && styles.selectedDayNumber,
                ]}
              >
                {day.getDate()}
              </Text>
            </View>

            {/* Events for this day */}
            {events
              .filter((event) => isSameDay(event.startTime, day))
              .map((event) => (
                <View key={event.id} style={styles.monthEventCard}>
                  <Text style={styles.monthEventText}>{event.name}</Text>
                </View>
              ))}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};




const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day'); //Made default Day - Henry
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [timeOfDay, setTimeOfDay] = useState(new Date()); //added a current time state var - Henry
  const [days, setDays] = useState<Date[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const events: Event[] = [
    {
      id: '1',
      name: 'Math Class',
      startTime: new Date('2024-10-20T09:00:00'), // Use hardcoded or cloned Date
      endTime: new Date('2024-10-20T10:00:00'),
      date: new Date('2024-10-20'),
    },
    {
      id: '2',
      name: 'Lunch Break',
      startTime: new Date('2024-10-21T12:00:00'),
      endTime: new Date('2024-10-21T13:00:00'),
      date: new Date('2024-10-21'),
    },
  ];

  useEffect(() => {
    const initialDays = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 15 - i));
    setDays(initialDays);

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 15, animated: false });
    }, 0);

    const interval = setInterval(() => { //update time of day every 60 seconds - Henry
      setTimeOfDay(new Date());
    }, 60000);

    return () => clearInterval(interval);
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
      <Title style={styles.title}>Calendar</Title>
      <View style={styles.container}>
        {/* View Selector */}
        <View style={styles.selector}>
          {['Day', 'Week', 'Month'].map((option) => (
            <Button
              key={option}
              mode={view === option ? 'contained' : 'text'}
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
  
        {/* Conditionally render Day, Week, or Month view */}
        {view === 'Day' && (
          <DayView
            selectedDate={selectedDate}
            days={days}
            flatListRef={flatListRef}
            renderDay={renderDay}
            handleScroll={handleScroll}
            events={events}
            timeOfDay={timeOfDay}
          />
        )}
        {view === 'Week' && (
          <WeekView
            selectedDate = {selectedDate}
            days={days}
            flatListRef={flatListRef}
            renderDay={renderDay}
            handleScroll={handleScroll}
            events={events}
            timeOfDay={timeOfDay}
            />
        )}
        {view === 'Month' && (
          <View style={{ height: '100%' }}> 
          <MonthView
            selectedDate={selectedDate}
            events={events}
            handleDayPress={handleDayPress}
          />
        </View>
        )}
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
    paddingTop: 0,
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
  
  calendarScrollView: {
    flexGrow: 1, // Ensure the scroll view can grow if needed
    marginTop: 0,
  },

  currentTimeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4, // Adjust the height as necessary
    backgroundColor: 'red', // Choose your desired color
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
    color: 'black',
    fontWeight: 'bold',
  },
  eventTime: {
    color: 'white',
    fontSize: 12,
  },

  weekEventsContainer: {
    flexDirection: 'row', // Align days horizontally
    flex: 1,
  },
  dayColumn: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e88e5',
  },
  monthViewContainer: {
    flex: 1,
    padding: 10,
  },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.28%', // 7 days in a week
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },

  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  dayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12, // Adjust font size for day labels
    fontWeight: 'bold',
  },

  monthDayNumber: {
    fontSize: 14, // Adjusted font size for day numbers
    fontWeight: 'bold',
  },

  monthViewContainer: {
    flex: 1, // Ensure it takes up all available space
    padding: 16,
  },
  monthDayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  monthDayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%', // Approximately 1/7 of the width (7 days)
    height: '40.0%', // Increase this to make the boxes taller
    justifyContent: 'flex-start', // Align items to the start
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 4,
  },

  monthEventCard: {
    backgroundColor: '#1e88e5',
    borderRadius: 4,
    padding: 4,
    marginTop: 2,
    marginBottom: 2,
    width: '100%', // Make it take full width of the cell
  },
  monthEventText: {
    color: 'white',
    fontSize: 12,
  },

  selectedMonthDayCell: {
    backgroundColor: 'red', // Circle background color for selected day
    borderRadius: 100, // Makes the background circular
  },

  selectedDayNumber: {
    color: 'white', // Text color for the selected day
  },

  selectedDayNumberContainer: {
    backgroundColor: 'red', // Red circle for selected day
  },
  monthDayNumber1: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayNumberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, // Size of the circle
    height: 40,
    borderRadius: 20, // Makes it a perfect circle
  },


});

export default CalendarPage;

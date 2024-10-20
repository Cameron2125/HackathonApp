// app/add-class.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { TextInput, Button, Title, HelperText, Chip } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const days = ['M', 'T', 'W', 'Th', 'F'];

export default function AddClass() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [classType, setClassType] = useState('');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  useEffect(() => {
    const isValid =
      name.trim() !== '' &&
      selectedDays.length > 0 &&
      startTime !== null &&
      endTime !== null &&
      classType.trim() !== '';
    setIsFormValid(isValid);
  }, [name, selectedDays, startTime, endTime, classType]);

  const handleAddClass = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      await addDoc(collection(db, 'Classes'), {
        UID: user.uid,
        name,
        daysOfWeek: selectedDays,
        startTime,
        endTime,
        classType,
        createdAt: new Date(),
      });

      alert('Class added successfully!');
      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (hours: number, minutes: number) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Add Class</Title>

        <TextInput
          label="Class Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <View style={styles.daysContainer}>
          <Title style={styles.daysTitle}>Select Days</Title>
          <View style={styles.daysRow}>
            {days.map((day) => (
              <Chip
                key={day}
                mode="flat"
                style={[
                  styles.dayChip,
                  selectedDays.includes(day) && styles.selectedDayChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedDays.includes(day) && styles.selectedChipText,
                ]}
                onPress={() => handleToggleDay(day)}
              >
                {day}
              </Chip>
            ))}
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={() => setShowStartTimePicker(true)}
          style={styles.timeButton}
        >
          {startTime ? `Start Time: ${startTime}` : 'Select Start Time'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => setShowEndTimePicker(true)}
          style={styles.timeButton}
        >
          {endTime ? `End Time: ${endTime}` : 'Select End Time'}
        </Button>

        <TimePickerModal
          visible={showStartTimePicker}
          onDismiss={() => setShowStartTimePicker(false)}
          onConfirm={({ hours, minutes }) => {
            setStartTime(formatTime(hours, minutes));
            setShowStartTimePicker(false);
          }}
          hours={0}
          minutes={0}
          label="Select Start Time"
        />

        <TimePickerModal
          visible={showEndTimePicker}
          onDismiss={() => setShowEndTimePicker(false)}
          onConfirm={({ hours, minutes }) => {
            setEndTime(formatTime(hours, minutes));
            setShowEndTimePicker(false);
          }}
          hours={0}
          minutes={0}
          label="Select End Time"
        />

        <TextInput
          label="Class Type"
          value={classType}
          onChangeText={setClassType}
          style={styles.input}
        />

        {error && <HelperText type="error">{error}</HelperText>}

        <Button
          mode="contained"
          onPress={handleAddClass}
          disabled={!isFormValid}
          style={styles.button}
        >
          Add Class
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e88e5',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  daysContainer: {
    marginBottom: 12,
  },
  daysTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayChip: {
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  selectedDayChip: {
    backgroundColor: '#1e88e5',
  },
  chipText: {
    color: '#000',
  },
  selectedChipText: {
    color: '#fff',
  },
  timeButton: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

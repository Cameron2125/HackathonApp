// app/add-misc.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { TextInput, Button, Title, HelperText, Portal, Provider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';

export default function AddMisc() {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const isValid =
      name.trim() !== '' &&
      selectedDate !== null &&
      description.trim() !== '' &&
      length.trim() !== '';
    setIsFormValid(isValid);
  }, [name, selectedDate, description, length]);

  const handleAddMiscTask = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      await addDoc(collection(db, 'MiscTasks'), {
        UID: user.uid,
        name,
        dueDate: selectedDate?.toISOString(),
        description,
        anticipatedLength: length,
        completed: false,
        createdAt: new Date(),
      });

      alert('Task added successfully!');
      router.replace('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDateConfirm = (params: { date?: Date }) => {
    if (params.date) {
      setSelectedDate(params.date); // Directly use the Date type
      setShowDatePicker(false);
      setShowTimePicker(true); // Open time picker after selecting the date
    }
  };

  const handleTimeConfirm = ({ hours, minutes }: { hours: number; minutes: number }) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      setSelectedDate(newDate);
    }
    setShowTimePicker(false);
  };

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Title style={styles.title}>Add Miscellaneous Task</Title>

          <TextInput
            label="Task Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            {selectedDate
              ? `Due: ${selectedDate.toLocaleString()}`
              : 'Select Due Date & Time'}
          </Button>

          <Portal>
            <DatePickerModal
              mode="single"
              visible={showDatePicker}
              onDismiss={() => setShowDatePicker(false)}
              date={selectedDate || new Date()}
              onConfirm={handleDateConfirm}
              label="Select Due Date"
              locale="en"
            />

            <TimePickerModal
              visible={showTimePicker}
              onDismiss={() => setShowTimePicker(false)}
              onConfirm={handleTimeConfirm}
              label="Select Due Time"
              hours={0}
              minutes={0}
            />
          </Portal>

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />

          <TextInput
            label="Anticipated Length"
            value={length}
            onChangeText={setLength}
            style={styles.input}
          />

          {error && <HelperText type="error">{error}</HelperText>}

          <Button
            mode="contained"
            onPress={handleAddMiscTask}
            disabled={!isFormValid}
            style={styles.button}
          >
            Add Task
          </Button>
        </ScrollView>
      </SafeAreaView>
    </Provider>
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
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

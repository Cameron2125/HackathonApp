import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import {
  TextInput,
  Button,
  Title,
  HelperText,
  Portal,
  Provider,
  Modal,
  Text,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';

interface Class {
  id: string;
  name: string;
}

export default function AddAssignment() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [description, setDescription] = useState('');
  const [length, setLength] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuggestedTimeModal, setShowSuggestedTimeModal] = useState(false);

  const suggestedTime = '1:00 PM, Saturday, 19th October'; // Hardcoded for now

  const fetchClasses = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const classesQuery = query(collection(db, 'Classes'), where('UID', '==', user.uid));
      const querySnapshot = await getDocs(classesQuery);

      const fetchedClasses: Class[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const isValid =
      name.trim() !== '' &&
      selectedDate !== null &&
      selectedClass !== '' &&
      description.trim() !== '' &&
      length.trim() !== '';
    setIsFormValid(isValid);
  }, [name, selectedDate, selectedClass, description, length]);

  const handleAddAssignment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      await addDoc(collection(db, 'Assignments'), {
        UID: user.uid,
        name,
        dueDate: selectedDate?.toISOString(),
        className: selectedClass,
        description,
        anticipatedLength: length,
        completed: false,
        createdAt: new Date(),
      });

      alert('Assignment added successfully!');
      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setShowTimePicker(true); // Open time picker after date selection
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
          <Title style={styles.title}>Add Assignment</Title>

          <TextInput
            label="Assignment Name"
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
              onConfirm={(params) => handleDateConfirm(params.date)}
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

            {/* Suggested Time Modal */}
            <Modal
              visible={showSuggestedTimeModal}
              onDismiss={() => setShowSuggestedTimeModal(false)}
              contentContainerStyle={styles.modalContent}
            >
              <Text style={styles.modalText}>
                Suggested Time to Complete: {suggestedTime}
              </Text>
              <Button onPress={() => setShowSuggestedTimeModal(false)}>Close</Button>
            </Modal>
          </Portal>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={(itemValue) => setSelectedClass(itemValue)}
            >
              <Picker.Item label="Select Class" value="" />
              {classes.map((classData) => (
                <Picker.Item key={classData.id} label={classData.name} value={classData.name} />
              ))}
            </Picker>
          </View>

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
            onPress={handleAddAssignment}
            disabled={!isFormValid}
            style={styles.button}
          >
            Add Assignment
          </Button>

          <Button
            mode="outlined"
            onPress={() => setShowSuggestedTimeModal(true)}
            style={styles.button}
          >
            Show Suggested Work Time
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
  pickerContainer: {
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
});


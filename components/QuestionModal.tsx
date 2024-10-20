import React, { useState } from 'react';
import { View, Modal, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

interface QuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onQuestionAdded: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ visible, onClose, onQuestionAdded }) => {
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('Please enter a question.');
      return;
    }

    try {
      const newQuestionData = {
        CID: '100', // Replace with dynamic CID if needed
        Question: newQuestion,
        Answered: false,
      };
      await addDoc(collection(db, 'Questions'), newQuestionData);
      setNewQuestion('');
      onClose();
      onQuestionAdded(); // Refresh the question list
    } catch (error) {
      console.error('Error adding question:', error);
      Alert.alert('Failed to add question. Please try again.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Post Question</Text>

          <TextInput
            placeholder="Enter your question"
            value={newQuestion}
            onChangeText={setNewQuestion}
            style={styles.input}
            multiline
            numberOfLines={4}
            textAlignVertical="top" // Ensures text starts at the top
          />

          <View style={styles.buttonContainer}>
            <Button title="Post" onPress={handleAddQuestion} />
            <Button title="Cancel" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 100, // Ensures it's large enough for multiline input
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default QuestionModal;

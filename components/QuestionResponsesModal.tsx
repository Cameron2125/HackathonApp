import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import QuestionItem from './QuestionItem';
import MessageItem from './MessageItem';

interface Message {
  MID: string;
  QID: string;
  Message: string;
  Likes: number;
}

interface Question {
  QID: string;
  CID: string;
  Question: string;
  Answered: boolean;
  ResponseMID?: string;
  Upvotes?: number;
  Downvotes?: number;
}

interface QuestionResponsesModalProps {
  visible: boolean;
  question: Question | null;
  onClose: () => void;
}

const QuestionResponsesModal: React.FC<QuestionResponsesModalProps> = ({
  visible,
  question,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  //console.log(question?.QID)
  useEffect(() => {
    if (question) {
      fetchMessages(question.QID);
    }
    else{
        //console.log("Error in 63")
    }
  }, [question, visible]);

  const fetchMessages = async (QID: string) => {
    setLoading(true);
    try {
      const messagesQuery = query(
        collection(db, 'Messages'), 
        where('QID', '==', QID)
      );
      const querySnapshot = await getDocs(messagesQuery);
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        MID: doc.id,
        ...doc.data(),
      })) as Message[];

      if (fetchedMessages.length === 0) {
      } else {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMockMessages = async (QID: string) => {
    try {
      const mockMessages = [
        { QID, Message: 'This is a great question!', Likes: 3 },
        { QID, Message: 'I have the same question!', Likes: 1 },
        { QID, Message: 'Let me help you with this.', Likes: 2 },
      ];

      const batch = mockMessages.map(async (msg) =>
        await addDoc(collection(db, 'Messages'), msg)
      );

      await Promise.all(batch); // Wait for all mock messages to be added
      fetchMessages(QID); // Fetch the newly added messages
    } catch (error) {
      console.error('Error adding mock messages:', error);
    }
  };

  const handleRemoveMessage = async (MID: string) => {
    try {
      await deleteDoc(doc(db, 'Messages', MID));
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.MID !== MID)
      );
      Alert.alert('Message removed.');
    } catch (error) {
      console.error('Error removing message:', error);
    }
  };

  if (!question) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <QuestionItem
                  question={question}
                  onRemove={() => { } } showChildren={false}        />

        {loading ? (
          <ActivityIndicator size="large" style={styles.loading} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.MID}
            renderItem={({ item }) => (
              <MessageItem message={item} onRemove={handleRemoveMessage} />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No responses yet</Text>
            }
            contentContainerStyle={styles.content}
          />
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuestionResponsesModal;

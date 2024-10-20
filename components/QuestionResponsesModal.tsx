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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  addDoc,
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
  const [posting, setPosting] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (question) {
      fetchMessages(question.QID);
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

      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    setPosting(true);
    try {
      const messageData = {
        QID: question?.QID,
        Message: newMessage,
        Likes: 0,
      };
      const docRef = await addDoc(collection(db, 'Messages'), messageData);

      setMessages((prevMessages) => [
        ...prevMessages,
        { MID: docRef.id, ...messageData },
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
    } finally {
      setPosting(false);
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (!question) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>←</Text>
              </TouchableOpacity>
            </View>

            <QuestionItem question={question} onRemove={() => {}} showChildren={false} />

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
                contentContainerStyle={styles.flatListContent}
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your reply..."
                value={newMessage}
                onChangeText={setNewMessage}
                returnKeyType="send"
                onSubmitEditing={handleAddMessage}
              />
              <TouchableOpacity
                onPress={handleAddMessage}
                style={styles.replyButton}
                disabled={posting}
              >
                {posting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.replyButtonText}>Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
 // Added padding to avoid overlap
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 8,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 24,
  },
  flatListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  replyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default QuestionResponsesModal;

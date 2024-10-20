import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import QuestionResponsesModal from './QuestionResponsesModal';

interface Message {
  MID: string;
  QID: string;
  Message: string;
  Likes: number;
}

interface QuestionItemProps {
  question: {
    QID: string;
    CID: string;
    Question: string;
    Answered: boolean;
    ResponseMID?: string;
    Upvotes?: number;
    Downvotes?: number;
  };
  onRemove: (QID: string) => void;
  showChildren: Boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, onRemove, showChildren = true }) => {
  const [upvotes, setUpvotes] = useState<number>(question.Upvotes ?? 0);
  const [downvotes, setDownvotes] = useState<number>(question.Downvotes ?? 0);
  const [userVote, setUserVote] = useState<'upvoted' | 'downvoted' | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const voteDifference = upvotes - downvotes;

  const handleUpvote = async () => {
    if (userVote === 'upvoted') return;
    if (userVote === 'downvoted') setDownvotes(downvotes - 1);
    setUpvotes(upvotes + 1);
    setUserVote('upvoted');
    await updateVotes(upvotes + 1, downvotes - (userVote === 'downvoted' ? 1 : 0));
  };

  const handleDownvote = async () => {
    if (userVote === 'downvoted') return;
    if (userVote === 'upvoted') setUpvotes(upvotes - 1);
    setDownvotes(downvotes + 1);
    setUserVote('downvoted');
    await updateVotes(upvotes - (userVote === 'upvoted' ? 1 : 0), downvotes + 1);
  };

  const updateVotes = async (newUpvotes: number, newDownvotes: number) => {
    try {
      await updateDoc(doc(db, 'Questions', question.QID), { Upvotes: newUpvotes, Downvotes: newDownvotes });
      if (newDownvotes >= newUpvotes + 5) {
        await deleteDoc(doc(db, 'Questions', question.QID));
        Alert.alert('Question removed due to low votes.');
        onRemove(question.QID);
      }
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const openResponsesModal = async () => {
    setLoading(true);
    setOpenModal(true);
    try {
      const q = query(collection(db, 'Messages'), where('QID', '==', question.QID));
      const querySnapshot = await getDocs(q);
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

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.Question}</Text>
      <Text style={styles.status}>{question.Answered ? 'Answered' : 'Unanswered'}</Text>

      <View style={styles.voteContainer}>
        <Text style={[styles.voteDifference, voteDifference >= 0 ? styles.positive : styles.negative]}>
          {voteDifference}
        </Text>

        <TouchableOpacity onPress={handleUpvote} style={[styles.voteButton, userVote === 'upvoted' && styles.activeVoteButton]}>
          <Text style={styles.voteText}>👍 {upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDownvote} style={[styles.voteButton, userVote === 'downvoted' && styles.activeVoteButton]}>
          <Text style={styles.voteText}>👎 {downvotes}</Text>
        </TouchableOpacity>
      </View>
      {showChildren && 
        <TouchableOpacity style={styles.button} onPress={openResponsesModal}>
        <Text style={styles.buttonText}>View Responses</Text>
      </TouchableOpacity>
      }
      
      <QuestionResponsesModal
            visible={openModal}
            question={question}
            onClose={() => setOpenModal(false)}
        />
      <Modal visible={false} animationType="slide" onRequestClose={() => setOpenModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.questionText}>{question.Question}</Text>

          {loading ? (
            <ActivityIndicator size="large" style={styles.loading} />
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.MID}
              renderItem={({ item }) => <Text style={styles.messageText}>{item.Message}</Text>}
              ListEmptyComponent={<Text style={styles.emptyText}>No responses yet</Text>}
              contentContainerStyle={styles.content}
            />
          )}

          <TouchableOpacity onPress={() => setOpenModal(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    paddingTop: 0,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#6c757d', marginVertical: 4 },
  voteContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 8 },
  voteDifference: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  positive: { color: 'green' },
  negative: { color: 'red' },
  voteButton: { marginHorizontal: 4, padding: 8, backgroundColor: '#f1f3f5', borderRadius: 4 },
  activeVoteButton: { backgroundColor: '#d1e7dd' },
  voteText: { fontSize: 16, fontWeight: 'bold' },
  button: { marginTop: 8, backgroundColor: '#007bff', paddingVertical: 8, borderRadius: 4 },
  buttonText: { color: '#fff', textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 20, fontSize: 16 },
  closeButton: { backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center', margin: 16 },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default QuestionItem;

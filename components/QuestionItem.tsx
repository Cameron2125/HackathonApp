// components/QuestionItem.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

interface QuestionItemProps {
  question: {
    QID: string;
    CID: string;
    Question: string;
    Answered: boolean;
    ResponseMID?: string;
    Upvotes: number;
    Downvotes: number;
  };
  onRemove: (QID: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, onRemove }) => {
  const [upvotes, setUpvotes] = useState(question.Upvotes);
  const [downvotes, setDownvotes] = useState(question.Downvotes);

  const voteDifference = upvotes - downvotes;

  const handleUpvote = async () => {
    const newUpvotes = upvotes + 1;
    setUpvotes(newUpvotes);
    await updateVotes(newUpvotes, downvotes);
  };

  const handleDownvote = async () => {
    const newDownvotes = downvotes + 1;
    setDownvotes(newDownvotes);
    await updateVotes(upvotes, newDownvotes);
  };

  const updateVotes = async (newUpvotes: number, newDownvotes: number) => {
    try {
      await updateDoc(doc(db, 'Questions', question.QID), {
        Upvotes: newUpvotes,
        Downvotes: newDownvotes,
      });
      checkForRemoval(newUpvotes, newDownvotes);
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const checkForRemoval = async (upvotes: number, downvotes: number) => {
    if (downvotes >= upvotes + 5) {
      try {
        await deleteDoc(doc(db, 'Questions', question.QID));
        Alert.alert('Question removed due to low votes.');
        onRemove(question.QID);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.Question}</Text>
      <Text style={styles.status}>
        {question.Answered ? 'Answered' : 'Unanswered'}
      </Text>

      {/* Vote Section */}
      <View style={styles.voteContainer}>
        <Text
          style={[
            styles.voteDifference,
            voteDifference >= 0 ? styles.positive : styles.negative,
          ]}
        >
          {voteDifference}
        </Text>

        <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
          <Text style={styles.voteText}>👍 {upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
          <Text style={styles.voteText}>👎 {downvotes}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Responses</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 4,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 8,
  },
  voteDifference: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  voteButton: {
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
  },
  voteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default QuestionItem;

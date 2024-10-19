// pages/CommunityPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { db } from '../../config/firebaseConfig';
import QuestionItem from '../../components/QuestionItem';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';

interface Question {
  QID?: string; // Optional since Firestore will generate the ID
  CID: string;
  Question: string;
  Answered: boolean;
  ResponseMID?: string;
}

const mockQuestions: Question[] = [
  { CID: '100', Question: 'What is the best study resource?', Answered: false },
  { CID: '100', Question: 'Any tips for first-year students?', Answered: true },
  { CID: '100', Question: 'What’s the best place to eat on campus?', Answered: false },
];

const CommunityPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const uploadMockQuestions = async () => {
    try {
      for (const question of mockQuestions) {
        await addDoc(collection(db, 'Questions'), question);
      }
      Alert.alert('Mock questions uploaded!');
    } catch (error) {
      console.error('Error uploading mock questions:', error);
    }
  };

  const checkAndUploadQuestions = useCallback(async () => {
    try {
      const questionsQuery = query(collection(db, 'Questions'), limit(1));
      const querySnapshot = await getDocs(questionsQuery);

      if (querySnapshot.empty) {
        console.log('No questions found. Uploading mock questions...');
        await uploadMockQuestions();
      }
    } catch (error) {
      console.error('Error checking questions:', error);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Questions'));
      const fetchedQuestions: Question[] = querySnapshot.docs.map((doc) => ({
        QID: doc.id,
        ...doc.data(),
      })) as Question[];
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await checkAndUploadQuestions(); // Ensure mock data exists
      await fetchQuestions(); // Fetch questions from Firestore
    })();
  }, [checkAndUploadQuestions, fetchQuestions]);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.QID!}
        renderItem={({ item }) => <QuestionItem question={item} />}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityPage;

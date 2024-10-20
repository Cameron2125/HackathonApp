import React, { useState, useEffect, useCallback } from 'react';
import { 
  FlatList, ActivityIndicator, SafeAreaView, StyleSheet, Alert, View, Text, ScrollView, TouchableOpacity, Button 
} from 'react-native';
import { FAB, Title } from 'react-native-paper';
import { db } from '../../config/firebaseConfig';
import QuestionItem from '../../components/QuestionItem';
import QuestionModal from '../../components/QuestionModal';
import { collection, getDocs, query, where, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 

interface Question {
  QID: string;
  CID: string;
  Question: string;
  Answered: boolean;
}

interface Community {
  CID: string;
  Name: string;
  Major: string;
  Year: string;
}

const CommunityPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedCID, setSelectedCID] = useState<string | null>(null); // Track selected community

  const auth = getAuth();
  const uid = auth.currentUser?.uid || '';

  const fetchUserData = useCallback(async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.error('User not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [uid]);

  const fetchOrCreateCommunities = useCallback(async () => {
    if (!userData) return;

    const { school, industryInterest: major, gradeLevel: year } = userData;
    const communityNames = [
      school.toLowerCase(),
      major.toLowerCase(),
      `${major.toLowerCase()} ${year.toLowerCase()}`,
    ];

    const communitiesCollection = collection(db, 'Communities');
    const loadedCommunities: Community[] = [];

    try {
      for (const name of communityNames) {
        const communityQuery = query(communitiesCollection, where('Name', '==', name));
        const querySnapshot = await getDocs(communityQuery);

        if (querySnapshot.empty) {
          const newCommunity = { Name: name, Major: major, Year: year };
          const docRef = await addDoc(communitiesCollection, newCommunity);
          loadedCommunities.push({ CID: docRef.id, ...newCommunity });
        } else {
          const communityData = querySnapshot.docs[0].data() as Community;
          loadedCommunities.push({ CID: querySnapshot.docs[0].id, ...communityData });
        }
      }

      setSelectedCID(loadedCommunities?.[0]?.CID || null);
      setCommunities(loadedCommunities);
    } catch (error) {
      console.error('Error fetching or creating communities:', error);
    }
  }, [userData]);

  const fetchQuestions = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Questions'));
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({
        QID: doc.id,
        ...doc.data(),
      })) as Question[];

      // Remove duplicates based on CID and QID
      const uniqueQuestions = Array.from(
        new Map(fetchedQuestions.map((q) => [`${q.CID}-${q.QID}`, q])).values()
      );

      setQuestions(uniqueQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData) {
      fetchOrCreateCommunities();
      fetchQuestions();
    }
  }, [userData, fetchOrCreateCommunities, fetchQuestions]);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
        <Title style={styles.title}>Community Forum</Title>
      <FlatList
        data={questions}
        keyExtractor={(item, index) => `${item.CID}-${item.QID}-${index}`} // Ensure unique keys
        renderItem={({ item }) => <QuestionItem question={item} />}
        contentContainerStyle={styles.content}
      />

      <QuestionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onQuestionAdded={fetchQuestions}
        uid={uid}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => setModalVisible(true)}
      />

      <View style={styles.communityContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {communities.map((community) => (
            <TouchableOpacity
              key={community.CID}
              style={[
                styles.communityItem,
                selectedCID === community.CID && styles.selectedCommunityItem, // Apply darker style if selected
              ]}
              onPress={() => setSelectedCID(community.CID)} // Set selected community
            >
              <Text style={styles.communityText}>{community.Name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
    paddingTop: 0,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
  },
  communityContainer: {
    marginTop: 16,
    paddingVertical: 10,
    paddingLeft: 16,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityItem: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCommunityItem: {
    backgroundColor: '#c0c0c0', // Darker color for selected community
  },
  communityText: {
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e88e5',
  },
});

export default CommunityPage;

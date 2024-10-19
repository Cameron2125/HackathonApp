// app/home.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { Title, Button, FAB, Portal, Provider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import ClassCard from '../../components/classCards'; 
import AssignmentCard from '../../components/assignmentCards'; 

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  className: string;
  completed: boolean;
  type: 'assignment';
}

interface Class {
  id: string;
  name: string;
  timeOfDay: string;
  daysOfWeek: string[];
  classType: string;
  type: 'class';
}

type CombinedItem = Assignment | Class;

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const fetchItemsForNextWeek = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      // Fetch classes
      const classesQuery = query(collection(db, 'Classes'), where('UID', '==', user.uid));
      const classSnapshot = await getDocs(classesQuery);
      const fetchedClasses: Class[] = classSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'class',
      })) as Class[];

      // Fetch assignments
      const assignmentsQuery = query(collection(db, 'Assignments'), where('UID', '==', user.uid));
      const assignmentSnapshot = await getDocs(assignmentsQuery);
      const fetchedAssignments: Assignment[] = assignmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'assignment',
      })) as Assignment[];

      // Combine and filter for the next 7 days
      const combinedItems = filterItemsForNextWeek([...fetchedClasses, ...fetchedAssignments]);
      setItems(combinedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItemsForNextWeek = (items: CombinedItem[]) => {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86400000));
    const dayAbbreviations = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

    return items.filter((item) => {
      if (item.type === 'class') {
        // Check if class occurs in the next 7 days
        return next7Days.some((date) =>
          item.daysOfWeek.includes(dayAbbreviations[date.getDay()])
        );
      } else {
        // Check if assignment is due in the next 7 days
        const dueDate = new Date(item.dueDate);
        return next7Days.some((date) => date.toDateString() === dueDate.toDateString());
      }
    });
  };

  useEffect(() => {
    fetchItemsForNextWeek();
  }, []);

  const handleFabPress = (route: string) => {
    router.push(route);
    setIsFabOpen(false);
  };

  const renderItem = ({ item }: { item: CombinedItem }) => {
    if (item.type === 'class') {
      return <ClassCard classData={item} />;
    } else {
      return (
        <AssignmentCard
          assignment={item}
          toggleComplete={async (id, completed) => {
            try {
              const assignmentRef = doc(db, 'Assignments', id);
              await updateDoc(assignmentRef, { completed });
              setItems((prev) =>
                prev.map((assignment) =>
                  assignment.id === id ? { ...assignment, completed } : assignment
                )
              );
            } catch (error) {
              console.error('Error updating assignment:', error);
            }
          }}
        />
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Title style={styles.title}>Classes and Assignments for the Next Week</Title>
          {items.length === 0 ? (
            <Title>No upcoming items found.</Title>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}

          <Button onPress={() => router.replace('/login')} style={styles.button}>
            Logout
          </Button>

          <Portal>
            <FAB.Group
                open={isFabOpen}
                icon={isFabOpen ? 'close' : 'plus'}
                color="white"
                style={styles.fabGroup}
                actions={[
                {
                    icon: 'book-open',
                    label: 'Add Class',
                    onPress: () => handleFabPress('add-class'),
                },
                {
                    icon: 'plus',
                    label: 'Add Assignment',
                    onPress: () => handleFabPress('add-assignment'),
                },
                {
                    icon: 'clipboard-list',
                    label: 'Add Misc Task',
                    onPress: () => handleFabPress('add-misc'), // Route to the new misc task page
                },
                ]}
                onStateChange={({ open }) => setIsFabOpen(open)}
            />
        </Portal>

        </View>
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
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e88e5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
  fabGroup: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
});

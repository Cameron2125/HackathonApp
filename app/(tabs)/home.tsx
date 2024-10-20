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
  startTime: string;
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


  useEffect(() => {
    console.log('Items have changed:', items);
  }, [items]);

  const dayAbbreviations = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

// Helper: Create Date object from `daysOfWeek` and `startTime`.
const createClassDate = (day: string, time: string) => {
  const today = new Date(); // Use current week
  const dayIndex = dayAbbreviations.indexOf(day); // Get day index

  // Set the date to the desired day of the week
  const classDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + ((7 + dayIndex - today.getDay()) % 7), // Adjust to the correct weekday
    ...time.split(':').map(Number) // Set hours and minutes
  );
  return classDate;
};
/**
 * Function to sort combined items (classes and assignments) by date/time.
 */
const sortItems = (items: (Class | Assignment)[]): (Class | Assignment)[] => {
    return items.sort((a, b) => {
      let dateA: Date, dateB: Date;
  
      if (a.type === 'class') {
        dateA = createClassDate(a.daysOfWeek[0], a.startTime);
      } else {
        dateA = new Date(a.dueDate);
      }
  
      if (b.type === 'class') {
        dateB = createClassDate(b.daysOfWeek[0], b.startTime);
      } else {
        dateB = new Date(b.dueDate);
      }
  
      return dateA.getTime() - dateB.getTime(); // Sort by earliest date/time
    });
  };

  const fetchItemsForNextWeek = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
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
      const combinedItems = sortItems(filterItemsForNextWeek([...fetchedClasses, ...fetchedAssignments]));
      console.log("COMBINED ITEMSs")
      console.log(combinedItems)
      setItems(combinedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
 * Given a class object, generate individual instances for each day in `daysOfWeek`.
 * @param classItem - Class object with `daysOfWeek` and other properties.
 * @returns Array of individual class instances, one per day in `daysOfWeek`.
 */
const splitClassByDays = (classItem: Class) => {
  // Map each day to a class instance, and return a flat array of class objects.
  return classItem.daysOfWeek.map((day) => ({
    ...classItem,
    daysOfWeek: [day], // Ensure only a single day is included.
  }));
};
  
  

  const filterItemsForNextWeek = (items: CombinedItem[]) => {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86400000));
    const dayAbbreviations = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

    //console.log("test1")
    return items.flatMap((item): CombinedItem[] => {
        if (item.type === 'class') {
          return splitClassByDays(item); // This returns an array of class objects
        } else {
          return [item]; // Wrap assignment in an array to maintain consistency
        }
      });
  };

  useEffect(() => {
    if (items.length == 0){
        fetchItemsForNextWeek();
    }
    
  }, []);

  const handleFabPress = (route: string) => {
    router.push(route);
    setIsFabOpen(false);
  };
//a
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
      <Title style={styles.title}>Classes and Assignments for the Next Week</Title>
        <View style={styles.container}>
         
          {items.length === 0 ? (
            <Title>No upcoming items found.</Title>
          ) : (
            <FlatList
                data={items}
                keyExtractor={(item) =>
                    item.type === 'class'
                    ? `${item.id}-${item.daysOfWeek.join('-')}` // Unique key for class items
                    : item.id // Use only id for non-class items
                }
                renderItem={renderItem}
                />

          )}

          <Button onPress={() => router.push('/')} style={styles.button}>
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
    fabContainer: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        borderRadius: 28, // Optional: Make it more rounded
        backgroundColor: '#f0f4f7', // Background color
        padding: 8, // Optional: Add padding for better visual appearance
      },
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
    marginBottom: 0,
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

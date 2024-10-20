// components/AssignmentCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Paragraph, Checkbox, Title, useTheme } from 'react-native-paper';

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  className: string;
  completed: boolean;
}

interface AssignmentCardProps {
  assignment: Assignment;
  toggleComplete: (id: string, completed: boolean) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, toggleComplete }) => {
  const theme = useTheme(); // Use theme for styling

  const handleToggle = () => {
    toggleComplete(assignment.id, !assignment.completed);
  };

  return (
    <Card style={styles.card}>
      <Card.Title titleStyle = {styles.title} title={assignment.name} />
      <Card.Content>
        <Paragraph style={styles.text}>
          Due Date: {new Date(assignment.dueDate).toDateString()}
        </Paragraph>
        <Paragraph style={styles.text}>Class: {assignment.className}</Paragraph>
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={assignment.completed ? 'checked' : 'unchecked'}
            onPress={handleToggle}
            color={theme.colors.primary} // Ensure visible checkbox color
          />
          <Paragraph style={styles.text}>
            {assignment.completed ? 'Completed' : 'Mark as Complete'}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: 'blue',
  },
  title: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold', // Bold font weight
    color: '#1E1E1E', // Darker shade for better contrast
  },
  text: {
    fontSize: 16,
    color: '#212121', // Dark grey
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default AssignmentCard;

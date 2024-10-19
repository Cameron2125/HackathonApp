// components/AssignmentCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Paragraph, Checkbox, Title } from 'react-native-paper';

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
  const handleToggle = () => {
    toggleComplete(assignment.id, !assignment.completed);
  };

  return (
    <Card style={styles.card}>
      <Card.Title title={assignment.name} />
      <Card.Content>
        <Paragraph>Due Date: {new Date(assignment.dueDate).toDateString()}</Paragraph>
        <Paragraph>Class: {assignment.className}</Paragraph>
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={assignment.completed ? 'checked' : 'unchecked'}
            onPress={handleToggle}
          />
          <Paragraph>{assignment.completed ? 'Completed' : 'Mark as Complete'}</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default AssignmentCard;

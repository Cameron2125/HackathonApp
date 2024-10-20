import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';

interface Class {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  classType: string;
}

interface ClassCardProps {
  classData: Class;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  return (
    <Card style={styles.card}>
      <Card.Title title={classData.name} subtitle={classData.classType} />
      <Card.Content>
        <Paragraph>
          Time: {classData.startTime} - {classData.endTime}
        </Paragraph>
        <Paragraph>Days: {classData.daysOfWeek.join(', ')}</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});

export default ClassCard;

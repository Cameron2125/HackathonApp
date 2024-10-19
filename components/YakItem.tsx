// components/YakItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

interface YakItemProps {
  text: string;
  timestamp: Date;
  votes: number;
  commentCount: number;
  onUpvote: () => void;
  onDownvote: () => void;
  onComment: () => void;
}

const YakItem: React.FC<YakItemProps> = ({
  text,
  timestamp,
  votes,
  commentCount,
  onUpvote,
  onDownvote,
  onComment,
}) => {
  return (
    <View style={styles.container}>
      {/* Post Content */}
      <Text style={styles.text}>{text}</Text>

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </Text>

      {/* Interaction Bar */}
      <View style={styles.interactionBar}>
        {/* Voting Section */}
        <View style={styles.voteContainer}>
          <TouchableOpacity onPress={onUpvote}>
            <Text style={styles.voteButton}>🔼</Text>
          </TouchableOpacity>
          <Text style={styles.voteCount}>{votes}</Text>
          <TouchableOpacity onPress={onDownvote}>
            <Text style={styles.voteButton}>🔽</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Button */}
        <TouchableOpacity onPress={onComment} style={styles.commentButton}>
          <Text style={styles.commentText}>{`${commentCount} Comments`}</Text>
        </TouchableOpacity>
      </View>
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
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#1e88e5',
    fontWeight: 'bold',
  },
});

export default YakItem;

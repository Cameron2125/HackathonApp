import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

interface MessageItemProps {
  message: {
    MID: string;
    QID: string;
    Message: string;
    Likes?: number;
    Dislikes?: number;
  };
  onRemove: (MID: string) => void; // Callback for parent to handle removal if needed
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onRemove }) => {
  const [likes, setLikes] = useState<number>(message.Likes ?? 0);
  const [dislikes, setDislikes] = useState<number>(message.Dislikes ?? 0);
  const [userVote, setUserVote] = useState<'liked' | 'disliked' | null>(null); // Track user vote

  const voteDifference = likes - dislikes;

  const handleLike = async () => {
    if (userVote === 'liked') return; // Prevent multiple likes

    let newLikes = likes;
    let newDislikes = dislikes;

    if (userVote === 'disliked') {
      // Switch from dislike to like
      newDislikes -= 1;
      setDislikes(newDislikes);
    }

    newLikes += 1;
    setLikes(newLikes);
    setUserVote('liked');

    await updateVotes(newLikes, newDislikes);
  };

  const handleDislike = async () => {
    if (userVote === 'disliked') return; // Prevent multiple dislikes

    let newLikes = likes;
    let newDislikes = dislikes;

    if (userVote === 'liked') {
      // Switch from like to dislike
      newLikes -= 1;
      setLikes(newLikes);
    }

    newDislikes += 1;
    setDislikes(newDislikes);
    setUserVote('disliked');

    await updateVotes(newLikes, newDislikes);
  };

  const updateVotes = async (newLikes: number, newDislikes: number) => {
    try {
      await updateDoc(doc(db, 'Messages', message.MID), {
        Likes: newLikes,
        Dislikes: newDislikes,
      });
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>{message.Message}</Text>

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

        <TouchableOpacity
          onPress={handleLike}
          style={[
            styles.voteButton,
            userVote === 'liked' && styles.activeVoteButton,
          ]}
        >
          <Text style={styles.voteText}>👍 {likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDislike}
          style={[
            styles.voteButton,
            userVote === 'disliked' && styles.activeVoteButton,
          ]}
        >
          <Text style={styles.voteText}>👎 {dislikes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  activeVoteButton: {
    backgroundColor: '#d1e7dd',
  },
  voteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessageItem;

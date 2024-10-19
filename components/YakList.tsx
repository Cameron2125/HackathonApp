// components/YakList.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, StyleSheet } from 'react-native';
import YakItem from './YakItem';

interface Yak {
  id: string;
  text: string;
  timestamp: Date;
  votes: number;
  commentCount: number;
}

interface YakListProps {
  initialData: Yak[];
  loadMoreYaks: () => Promise<Yak[]>; // Function to load more Yaks
}

const YakList: React.FC<YakListProps> = ({ initialData, loadMoreYaks }) => {
  const [yaks, setYaks] = useState(initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleUpvote = (id: string) => console.log(`Upvoted Yak ${id}`);
  const handleDownvote = (id: string) => console.log(`Downvoted Yak ${id}`);
  const handleComment = (id: string) => console.log(`Open comments for Yak ${id}`);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refreshing logic
    const newYaks = await loadMoreYaks();
    setYaks([...newYaks, ...yaks]); // Prepend new yaks
    setRefreshing(false);
  }, [yaks, loadMoreYaks]);

  const handleLoadMore = async () => {
    if (loadingMore) return; // Prevent multiple triggers

    setLoadingMore(true);
    const newYaks = await loadMoreYaks();
    setYaks([...yaks, ...newYaks]); // Append new yaks to the list
    setLoadingMore(false);
  };

  return (
    <FlatList
      data={yaks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <YakItem
          text={item.text}
          timestamp={item.timestamp}
          votes={item.votes}
          commentCount={item.commentCount}
          onUpvote={() => handleUpvote(item.id)}
          onDownvote={() => handleDownvote(item.id)}
          onComment={() => handleComment(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.loadingIndicator} size="large" />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    marginVertical: 16,
  },
});

export default YakList;

// components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Optional for icons (Expo)

interface HeaderProps {
  title: string;
  onRefresh?: () => void; // Optional refresh action
  onSettingsPress?: () => void; // Optional settings button
}

const Header: React.FC<HeaderProps> = ({ title, onRefresh, onSettingsPress }) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      <View style={styles.actions}>
        {/* Optional Refresh Button */}
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.button}>
            <MaterialIcons name="refresh" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Optional Settings Button */}
        {onSettingsPress && (
          <TouchableOpacity onPress={onSettingsPress} style={styles.button}>
            <MaterialIcons name="settings" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: 16,
  },
});

export default Header;

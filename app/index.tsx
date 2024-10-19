// app/index.js
import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Title, Caption } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home'); // Navigate to Home screen after login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupRedirect = () => {
    router.push('../signup'); // Navigate to Signup screen
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Scheduler</Title>
      <Caption style={styles.caption}>Manage your time efficiently</Caption>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Button onPress={handleSignupRedirect} style={styles.linkButton}>
        Create an Account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e88e5',
  },
  caption: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  linkButton: {
    width: '100%',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'; // Added KeyboardAvoidingView and ScrollView
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
      router.push('/home'); // Navigate to Home screen after login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupRedirect = () => {
    router.push('../signup'); // Navigate to Signup screen
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust the layout when the keyboard is open
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    paddingTop: 10,
  },
  caption: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
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

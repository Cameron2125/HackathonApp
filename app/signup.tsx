// app/signup.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker'; // Install Picker
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('Freshman'); // Default selection
  const [industryInterest, setIndustryInterest] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        school,
        gradeLevel,
        industryInterest,
        createdAt: new Date(),
      });

      alert('Account created successfully!');
      router.replace('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Title style={styles.title}>Create an Account</Title>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="School"
          value={school}
          onChangeText={setSchool}
          style={styles.input}
        />

        <Text style={styles.label}>Grade Level</Text>
        <Picker
          selectedValue={gradeLevel}
          onValueChange={(itemValue) => setGradeLevel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Freshman" value="Freshman" />
          <Picker.Item label="Sophomore" value="Sophomore" />
          <Picker.Item label="Junior" value="Junior" />
          <Picker.Item label="Senior" value="Senior" />
        </Picker>

        <TextInput
          label="Industry Interest (Optional)"
          value={industryInterest}
          onChangeText={setIndustryInterest}
          style={styles.input}
        />
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

        {error && <HelperText type="error">{error}</HelperText>}

        <Button mode="contained" onPress={handleSignup} style={styles.button}>
          Sign Up
        </Button>
        <Button onPress={() => router.push('/login')} style={styles.linkButton}>
          Back to Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    backgroundColor: '#f0f4f7',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e88e5',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  picker: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 10,
  },
});

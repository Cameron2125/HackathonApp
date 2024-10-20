// config/firebaseConfig.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkuoND5jCNev6iX8xD9hbKDTcxL6USZ7M",
  authDomain: "hackathon-ed63d.firebaseapp.com",
  projectId: "hackathon-ed63d",
  storageBucket: "hackathon-ed63d.appspot.com",
  messagingSenderId: "942648810655",
  appId: "1:942648810655:web:62d74e6b946ddac6e1d6aa",
  measurementId: "G-S04CE0QX8Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
// export const auth = getAuth(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);

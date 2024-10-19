// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkuoND5jCNev6iX8xD9hbKDTcxL6USZ7M",
  authDomain: "hackathon-ed63d.firebaseapp.com",
  projectId: "hackathon-ed63d",
  storageBucket: "hackathon-ed63d.appspot.com",
  messagingSenderId: "942648810655",
  appId: "1:942648810655:web:62d74e6b946ddac6e1d6aa",
  measurementId: "G-S04CE0QX8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
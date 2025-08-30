// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxqfC26syRlO8CECYEoiihjnmllof50og",
  authDomain: "foodie-47857.firebaseapp.com",
  projectId: "foodie-47857",
  storageBucket: "foodie-47857.firebasestorage.app",
  messagingSenderId: "88618355277",
  appId: "1:88618355277:ios:82b4a4161379de340cea04",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;

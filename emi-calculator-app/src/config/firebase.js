import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyCp5ORNztWEc7KU3Y3cPmENJslU02nbmZw',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'emi-calcy.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'emi-calcy',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'emi-calcy.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '603179355192',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:603179355192:web:df8d929bae93406718aacd',
};

// Initialize Firebase App (only once)
let app;
let auth;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
    
    // Initialize Auth with persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('Firebase auth initialized with persistence');
  } else {
    app = getApp();
    auth = getAuth(app);
    console.log('Firebase app already initialized, reusing instance');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // If there's an error, try to get existing instances
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    console.log('Recovered from error using existing Firebase instance');
  } else {
    throw error;
  }
}

export { app, firebaseConfig, auth };

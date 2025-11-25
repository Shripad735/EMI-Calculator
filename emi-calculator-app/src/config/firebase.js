import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
} else {
  app = getApp();
  console.log('Firebase app already initialized');
}

// Get Auth instance - must be called after app initialization
let auth;
try {
  auth = getAuth(app);
  console.log('Firebase auth initialized');
} catch (error) {
  console.error('Firebase auth initialization error:', error);
  // Create a fallback - this shouldn't happen but prevents crashes
  auth = getAuth();
}

export { app, firebaseConfig, auth };

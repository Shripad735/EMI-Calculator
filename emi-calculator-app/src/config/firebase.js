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
// This must happen before any Firebase service is used
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Auth instance
const auth = getAuth(app);

console.log('Firebase initialized:', {
  appName: app.name,
  hasAuth: !!auth,
  appsCount: getApps().length
});

export { app, firebaseConfig, auth };

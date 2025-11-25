// Import both v9 modular and v8 compat APIs
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Import compat for expo-firebase-recaptcha
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

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

// Initialize Firebase v9 modular (for your code)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firebase v8 compat (for expo-firebase-recaptcha)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase compat initialized for expo-firebase-recaptcha');
} else {
  console.log('Firebase compat already initialized');
}

console.log('Firebase initialized:', {
  v9AppName: app.name,
  v9HasAuth: !!auth,
  v9AppsCount: getApps().length,
  v8AppsCount: firebase.apps.length
});

export { app, firebaseConfig, auth };

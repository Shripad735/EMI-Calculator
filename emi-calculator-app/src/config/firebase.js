import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp5ORNztWEc7KU3Y3cPmENJslU02nbmZw",
  authDomain: "emi-calcy.firebaseapp.com",
  projectId: "emi-calcy",
  storageBucket: "emi-calcy.firebasestorage.app",
  messagingSenderId: "603179355192",
  appId: "1:603179355192:web:df8d929bae93406718aacd",
  measurementId: "G-HNS33WGBWJ"
};

// Initialize Firebase (only if not already initialized)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

// Enable testing mode for development (allows OTP testing without real SMS)
// Remove this line in production
if (__DEV__) {
  auth.settings = auth.settings || {};
  auth.settings.appVerificationDisabledForTesting = true;
}

export { app, firebaseConfig, auth };

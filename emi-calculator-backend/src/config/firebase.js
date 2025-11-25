const admin = require('firebase-admin');

/**
 * Firebase Admin SDK Configuration
 * Used to verify Firebase ID tokens from phone authentication
 * 
 * Supports two methods:
 * 1. Environment variables (for Vercel/production)
 * 2. Service account JSON file (for local development)
 */

// Initialize only if not already initialized
if (!admin.apps.length) {
  let credential;

  // Method 1: Use individual environment variables (recommended for Vercel)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('Firebase Admin: Using environment variables');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'emi-calcy',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }
  // Method 2: Use GOOGLE_APPLICATION_CREDENTIALS file path (local development)
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Firebase Admin: Using service account file');
    credential = admin.credential.applicationDefault();
  }
  // Method 3: Try to load serviceAccountKey.json from project root
  else {
    try {
      const serviceAccount = require('../../serviceAccountKey.json');
      console.log('Firebase Admin: Using serviceAccountKey.json file');
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.warn('Firebase Admin: No credentials found, token verification will fail');
      credential = null;
    }
  }

  // Initialize Firebase Admin
  if (credential) {
    admin.initializeApp({
      credential: credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'emi-calcy',
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'emi-calcy',
    });
    console.warn('Firebase Admin initialized without credentials');
  }
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<object>} Decoded token with user info
 */
async function verifyFirebaseToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  admin,
  verifyFirebaseToken,
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { config } from '../constants/config';

// Check if auth is available
const isAuthAvailable = () => {
  return auth !== null && auth !== undefined;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Load stored authentication data
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(config.tokenKey);
      const storedUser = await AsyncStorage.getItem(config.userKey);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to phone number
  const sendOTP = async (phoneNumber, recaptchaRef) => {
    try {
      // Check if Firebase auth is available
      if (!isAuthAvailable()) {
        return {
          success: false,
          error: 'Authentication service is not available. Please try again later.',
        };
      }
      
      console.log('Sending OTP to:', phoneNumber);
      
      // Format phone number with country code if not present
      const formattedNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber}`;

      console.log('Formatted number:', formattedNumber);

      // Check if this is a test phone number
      const testNumbers = ['+918180094312', '8180094312'];
      const isTestNumber = testNumbers.includes(formattedNumber) || testNumbers.includes(phoneNumber);
      
      if (isTestNumber) {
        console.log('Test phone number detected - OTP should be: 123321');
      }

      // For WebRecaptcha, we need to trigger verification first
      let recaptchaVerifier = recaptchaRef;
      
      // If recaptchaRef has a verify method (WebRecaptcha component), use it
      if (recaptchaRef && typeof recaptchaRef.verify === 'function') {
        console.log('Using WebRecaptcha component for verification');
        // The WebRecaptcha will handle the verification internally
        // We create a custom verifier object that Firebase can use
        recaptchaVerifier = {
          type: 'recaptcha',
          verify: async () => {
            return await recaptchaRef.verify();
          }
        };
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        recaptchaVerifier
      );
      
      console.log('OTP sent successfully, verification ID:', confirmation.verificationId);
      setVerificationId(confirmation.verificationId);
      return { success: true, confirmation };
    } catch (error) {
      console.error('Error sending OTP:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      // Provide more specific error messages
      let errorMessage = getErrorMessage(error.code);
      if (error.code === 'auth/invalid-app-credential' || error.message?.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA verification failed. For testing, please configure reCAPTCHA in Firebase Console or use the test number: 8180094312 with OTP: 123321';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };


  // Verify OTP and sign in with backend
  const verifyOTP = async (otp, confirmation) => {
    try {
      if (!confirmation && !verificationId) {
        return { success: false, error: 'Please request OTP first' };
      }

      let result;

      // Use confirmation object if available
      if (confirmation && confirmation.confirm) {
        result = await confirmation.confirm(otp);
      } else if (verificationId) {
        // Fallback to credential method
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        result = await signInWithCredential(auth, credential);
      } else {
        return { success: false, error: 'Please request OTP first' };
      }

      // Get Firebase ID token to send to backend
      const firebaseToken = await result.user.getIdToken();

      // Sync with backend - create/login user in MongoDB
      const response = await axios.post(`${config.apiUrl}/auth/login-phone`, {
        firebaseToken,
      });

      const { token: authToken, user: authUser } = response.data;

      // Store auth data
      await AsyncStorage.setItem(config.tokenKey, authToken);
      await AsyncStorage.setItem(config.userKey, JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);

      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);

      // Handle backend errors
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Verification failed',
        };
      }

      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  };

  // Update user profile (name)
  const updateProfile = async (name) => {
    try {
      // Try to update on backend if we have a token
      if (token) {
        try {
          const response = await axios.put(
            `${config.apiUrl}/auth/profile`,
            { name },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedUser = response.data.user;
          await AsyncStorage.setItem(config.userKey, JSON.stringify(updatedUser));
          setUser(updatedUser);
          return { success: true };
        } catch (backendError) {
          console.log('Backend update failed, saving locally:', backendError.message);
          // Fall through to local update
        }
      }
      
      // Fallback to local storage only
      const updatedUser = { ...user, name };
      await AsyncStorage.setItem(config.userKey, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Firebase (ignore errors if not signed in or auth not available)
      if (isAuthAvailable()) {
        try {
          await signOut(auth);
          console.log('Firebase signout successful');
        } catch (firebaseError) {
          console.log('Firebase signout skipped:', firebaseError.message);
        }
      }

      // Clear stored data
      await AsyncStorage.removeItem(config.tokenKey);
      await AsyncStorage.removeItem(config.userKey);
      console.log('AsyncStorage cleared');

      // Clear state
      setUser(null);
      setToken(null);
      setVerificationId(null);
      
      console.log('Logout successful - state cleared');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear state even if there's an error
      setUser(null);
      setToken(null);
      setVerificationId(null);
      console.log('Logout completed with errors but state cleared');
    }
  };

  // Get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please enter a valid number.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please check and try again.';
      case 'auth/code-expired':
        return 'OTP has expired. Please request a new one.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sendOTP,
        verifyOTP,
        updateProfile,
        logout,
        verificationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

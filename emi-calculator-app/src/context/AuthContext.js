import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { config } from '../constants/config';

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
  const sendOTP = async (phoneNumber, recaptchaVerifier) => {
    try {
      // Format phone number with country code if not present
      const formattedNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        recaptchaVerifier
      );
      setVerificationId(confirmation.verificationId);
      return { success: true, confirmation };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
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
      // Update on backend if we have a token
      if (token) {
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
      } else {
        // Fallback to local storage only
        const updatedUser = { ...user, name };
        await AsyncStorage.setItem(config.userKey, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear stored data
      await AsyncStorage.removeItem(config.tokenKey);
      await AsyncStorage.removeItem(config.userKey);

      setUser(null);
      setToken(null);
      setVerificationId(null);
    } catch (error) {
      console.error('Error logging out:', error);
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

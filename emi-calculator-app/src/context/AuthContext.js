import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { config } from '../constants/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const sendOTP = async (phoneNumber) => {
    try {
      console.log('Sending OTP to:', phoneNumber);
      
      const response = await axios.post(`${config.apiUrl}/auth/send-otp`, {
        phone: phoneNumber,
      });

      console.log('Send OTP response:', response.data);

      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to send OTP',
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send OTP. Please try again.',
      };
    }
  };

  // Verify OTP and login
  const verifyOTP = async (phoneNumber, otp, name = '') => {
    try {
      console.log('Verifying OTP for:', phoneNumber);
      
      const response = await axios.post(`${config.apiUrl}/auth/verify-otp`, {
        phone: phoneNumber,
        otp,
        name,
      });

      console.log('Verify OTP response:', response.data);

      if (response.data.success) {
        const { token: authToken, user: authUser } = response.data;

        // Store auth data
        await AsyncStorage.setItem(config.tokenKey, authToken);
        await AsyncStorage.setItem(config.userKey, JSON.stringify(authUser));

        setToken(authToken);
        setUser(authUser);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Verification failed',
          attemptsRemaining: response.data.attemptsRemaining,
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Verification failed. Please try again.',
        attemptsRemaining: error.response?.data?.attemptsRemaining,
      };
    }
  };

  // Resend OTP
  const resendOTP = async (phoneNumber) => {
    try {
      console.log('Resending OTP to:', phoneNumber);
      
      const response = await axios.post(`${config.apiUrl}/auth/resend-otp`, {
        phone: phoneNumber,
      });

      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to resend OTP',
        };
      }
    } catch (error) {
      console.error('Error resending OTP:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP. Please try again.',
      };
    }
  };

  // Update user profile (name)
  const updateProfile = async (name) => {
    try {
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

      // Clear stored data
      await AsyncStorage.removeItem(config.tokenKey);
      await AsyncStorage.removeItem(config.userKey);
      console.log('AsyncStorage cleared');

      // Clear state
      setUser(null);
      setToken(null);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear state even if there's an error
      setUser(null);
      setToken(null);
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
        resendOTP,
        updateProfile,
        logout,
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

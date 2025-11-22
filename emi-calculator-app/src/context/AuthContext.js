import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { config } from '../constants/config';

/**
 * @typedef {import('../types').User} User
 * @typedef {import('../types').AuthResponse} AuthResponse
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user
 * @property {string | null} token
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(name: string, email: string, password: string) => Promise<void>} signup
 * @property {() => Promise<void>} logout
 * @property {boolean} loading
 */

const AuthContext = createContext(/** @type {AuthContextType | undefined} */ (undefined));

/**
 * AuthProvider component that manages authentication state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from AsyncStorage on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Load stored authentication data from AsyncStorage
   */
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(config.tokenKey);
      const storedUser = await AsyncStorage.getItem(config.userKey);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem(config.tokenKey);
          await AsyncStorage.removeItem(config.userKey);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      // Clear potentially corrupted data
      try {
        await AsyncStorage.removeItem(config.tokenKey);
        await AsyncStorage.removeItem(config.userKey);
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function that calls backend API
   * @param {string} email
   * @param {string} password
   * @throws {Error} If login fails
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      const { token: authToken, user: authUser } = response.data;

      // Validate response data
      if (!authToken || !authUser) {
        throw new Error('Invalid response from server');
      }

      // Store token and user in AsyncStorage first
      try {
        await AsyncStorage.setItem(config.tokenKey, authToken);
        await AsyncStorage.setItem(config.userKey, JSON.stringify(authUser));
      } catch (storageError) {
        console.error('Error storing auth data:', storageError);
        throw new Error('Failed to save login information. Please try again.');
      }

      // Update state after successful storage
      setToken(authToken);
      setUser(authUser);
    } catch (error) {
      // Re-throw with a more user-friendly message
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  /**
   * Signup function that calls backend API
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @throws {Error} If signup fails
   */
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/signup`, {
        name,
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      const { token: authToken, user: authUser } = response.data;

      // Validate response data
      if (!authToken || !authUser) {
        throw new Error('Invalid response from server');
      }

      // Store token and user in AsyncStorage first
      try {
        await AsyncStorage.setItem(config.tokenKey, authToken);
        await AsyncStorage.setItem(config.userKey, JSON.stringify(authUser));
      } catch (storageError) {
        console.error('Error storing auth data:', storageError);
        throw new Error('Failed to save signup information. Please try again.');
      }

      // Update state after successful storage
      setToken(authToken);
      setUser(authUser);
    } catch (error) {
      // Re-throw with a more user-friendly message
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (error.response) {
        // Handle validation errors with field-specific messages
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.email) {
          throw new Error(errorData.errors.email);
        }
        throw new Error(errorData.message || 'Signup failed. Please try again.');
      } else if (error.request) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  /**
   * Logout function that clears token and user data
   */
  const logout = async () => {
    try {
      // Clear AsyncStorage first
      await AsyncStorage.removeItem(config.tokenKey);
      await AsyncStorage.removeItem(config.userKey);
      
      // Clear state after successful storage clear
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if storage clear fails, clear the state
      setToken(null);
      setUser(null);
      throw new Error('Logout completed but failed to clear stored data');
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the AuthContext
 * @returns {AuthContextType}
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

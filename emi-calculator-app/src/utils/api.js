import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';

/**
 * @typedef {import('../types').AuthResponse} AuthResponse
 * @typedef {import('../types').Plan} Plan
 */

/**
 * Create axios instance with base URL configuration
 */
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to include auth token
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@emi_calculator_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('Request timeout. Please try again.');
        timeoutError.isTimeout = true;
        throw timeoutError;
      } else if (error.message === 'Network Error') {
        const networkError = new Error('Unable to connect to server. Please check your internet connection.');
        networkError.isNetworkError = true;
        throw networkError;
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }

    // Handle HTTP errors
    const { status, data } = error.response;

    // Handle token expiration - clear token and flag for redirect
    if (status === 401) {
      try {
        await AsyncStorage.removeItem('@emi_calculator_token');
        await AsyncStorage.removeItem('@emi_calculator_user');
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
      
      const authError = new Error(data.message || 'Your session has expired. Please login again.');
      authError.isAuthError = true;
      authError.requiresLogin = true;
      throw authError;
    }

    switch (status) {
      case 400:
        throw new Error(data.message || 'Invalid request. Please check your input.');
      case 403:
        throw new Error(data.message || 'You do not have permission to perform this action.');
      case 404:
        throw new Error(data.message || 'The requested resource was not found.');
      case 500:
      case 503:
        throw new Error(data.message || 'Server error. Please try again later.');
      default:
        throw new Error(data.message || 'An error occurred. Please try again.');
    }
  }
);

/**
 * API functions for all endpoints
 */

/**
 * Signup a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<AuthResponse>} Authentication response with token and user
 */
export const signup = async (name, email, password) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<AuthResponse>} Authentication response with token and user
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all plans for the authenticated user
 * @returns {Promise<{plans: Plan[]}>} Array of user's saved plans
 */
export const getPlans = async () => {
  try {
    const response = await apiClient.get('/plans');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save a new EMI calculation plan
 * @param {Object} planData - Plan data to save
 * @param {number} planData.loanAmount - Loan amount in rupees
 * @param {number} planData.interestRate - Annual interest rate as percentage
 * @param {number} planData.tenure - Tenure in months
 * @param {string} [planData.loanType] - Type of loan (Home, Personal, Vehicle)
 * @param {number} planData.emi - Calculated EMI amount
 * @param {number} planData.totalInterest - Total interest payable
 * @param {number} planData.totalAmountPayable - Total amount payable
 * @returns {Promise<{plan: Plan}>} Saved plan with ID
 */
export const savePlan = async (planData) => {
  try {
    const response = await apiClient.post('/plans', planData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a saved plan by ID
 * @param {string} planId - ID of the plan to delete
 * @returns {Promise<{message: string}>} Success message
 */
export const deletePlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/plans/${planId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';

/**
 * Save a calculation to history (backend)
 * @param {Object} calculation - Calculation data to save { type, data, result }
 * @param {string} token - Auth token (optional, will fetch from storage if not provided)
 */
export const saveToHistory = async (calculation, token = null) => {
  try {
    // Get token if not provided
    const authToken = token || await AsyncStorage.getItem(config.tokenKey);
    
    if (!authToken) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${config.apiUrl}/calculations`,
      calculation,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.calculation;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
};

/**
 * Get all calculation history from backend
 * @param {string} token - Auth token (optional, will fetch from storage if not provided)
 * @returns {Array} Array of calculations
 */
export const getHistory = async (token = null) => {
  try {
    const authToken = token || await AsyncStorage.getItem(config.tokenKey);
    
    if (!authToken) {
      return [];
    }

    const response = await axios.get(`${config.apiUrl}/calculations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data.calculations || [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

/**
 * Delete a specific calculation from history
 * @param {string} id - Calculation ID to delete
 * @param {string} token - Auth token (optional, will fetch from storage if not provided)
 */
export const deleteFromHistory = async (id, token = null) => {
  try {
    const authToken = token || await AsyncStorage.getItem(config.tokenKey);
    
    if (!authToken) {
      throw new Error('Authentication required');
    }

    await axios.delete(`${config.apiUrl}/calculations/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    console.error('Error deleting from history:', error);
    throw error;
  }
};

/**
 * Clear all calculation history (not implemented on backend - would delete all)
 * For now, this is a no-op
 */
export const clearHistory = async () => {
  console.warn('clearHistory is not implemented for backend storage');
};

/**
 * Get history filtered by calculator type
 * @param {string} type - Calculator type (fd, rd, sip, gst)
 * @param {string} token - Auth token (optional, will fetch from storage if not provided)
 * @returns {Array} Filtered array of calculations
 */
export const getHistoryByType = async (type, token = null) => {
  try {
    const authToken = token || await AsyncStorage.getItem(config.tokenKey);
    
    if (!authToken) {
      return [];
    }

    const response = await axios.get(`${config.apiUrl}/calculations?type=${type}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data.calculations || [];
  } catch (error) {
    console.error('Error getting history by type:', error);
    return [];
  }
};

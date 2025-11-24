import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calculation_history';

/**
 * Save a calculation to history
 * @param {Object} calculation - Calculation data to save
 */
export const saveToHistory = async (calculation) => {
  try {
    const history = await getHistory();
    const newCalculation = {
      ...calculation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newCalculation, ...history];
    
    // Keep only last 100 calculations
    const limitedHistory = updatedHistory.slice(0, 100);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    return newCalculation;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
};

/**
 * Get all calculation history
 * @returns {Array} Array of calculations
 */
export const getHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

/**
 * Delete a specific calculation from history
 * @param {string} id - Calculation ID to delete
 */
export const deleteFromHistory = async (id) => {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting from history:', error);
    throw error;
  }
};

/**
 * Clear all calculation history
 */
export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

/**
 * Get history filtered by calculator type
 * @param {string} type - Calculator type (emi, fd, rd, sip, gst, compare)
 * @returns {Array} Filtered array of calculations
 */
export const getHistoryByType = async (type) => {
  try {
    const history = await getHistory();
    return history.filter((item) => item.type === type);
  } catch (error) {
    console.error('Error getting history by type:', error);
    return [];
  }
};

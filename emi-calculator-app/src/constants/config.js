import Constants from 'expo-constants';

// Application configuration
export const config = {
  apiUrl: 
    process.env.EXPO_PUBLIC_API_URL || 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
    'https://emi-calculator-backend.vercel.app',
  tokenKey: '@emi_calculator_token',
  userKey: '@emi_calculator_user',
};

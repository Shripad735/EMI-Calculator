import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SavedPlansScreen from '../screens/SavedPlansScreen';
import CompareLoanScreen from '../screens/CompareLoanScreen';
import HistoryScreen from '../screens/HistoryScreen';
import FDCalculatorScreen from '../screens/FDCalculatorScreen';
import RDCalculatorScreen from '../screens/RDCalculatorScreen';
import SIPCalculatorScreen from '../screens/SIPCalculatorScreen';
import GSTCalculatorScreen from '../screens/GSTCalculatorScreen';
import TVMCalculatorScreen from '../screens/TVMCalculatorScreen';
import PPFCalculatorScreen from '../screens/PPFCalculatorScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

/**
 * AuthStack - Navigation stack for unauthenticated users
 * Contains: Dashboard, All Calculators, Login (Phone OTP)
 */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CompareLoan" component={CompareLoanScreen} />
      <Stack.Screen name="FDCalculator" component={FDCalculatorScreen} />
      <Stack.Screen name="RDCalculator" component={RDCalculatorScreen} />
      <Stack.Screen name="SIPCalculator" component={SIPCalculatorScreen} />
      <Stack.Screen name="GSTCalculator" component={GSTCalculatorScreen} />
      <Stack.Screen name="TVMCalculator" component={TVMCalculatorScreen} />
      <Stack.Screen name="PPFCalculator" component={PPFCalculatorScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

/**
 * MainStack - Navigation stack for authenticated users
 * Contains: Dashboard, All Calculators, SavedPlans, History, Profile
 */
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CompareLoan" component={CompareLoanScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="FDCalculator" component={FDCalculatorScreen} />
      <Stack.Screen name="RDCalculator" component={RDCalculatorScreen} />
      <Stack.Screen name="SIPCalculator" component={SIPCalculatorScreen} />
      <Stack.Screen name="GSTCalculator" component={GSTCalculatorScreen} />
      <Stack.Screen name="TVMCalculator" component={TVMCalculatorScreen} />
      <Stack.Screen name="PPFCalculator" component={PPFCalculatorScreen} />
      <Stack.Screen name="SavedPlans" component={SavedPlansScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

/**
 * AppNavigator - Root navigator that switches between AuthStack and MainStack
 * based on authentication state
 */
export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

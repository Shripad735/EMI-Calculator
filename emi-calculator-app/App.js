import { StatusBar } from 'expo-status-bar';
// Initialize Firebase FIRST before any other imports that might use it
import './src/config/firebase';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { isLoggedIn, restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator isLoggedIn={isLoggedIn} />
    </>
  );
}

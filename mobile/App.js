import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

function RootApp() {
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

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}

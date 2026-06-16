import { createContext, useContext, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('fp_token', data.token);
    await SecureStore.setItemAsync('fp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('fp_token');
    await SecureStore.deleteItemAsync('fp_user');
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync('fp_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, restoreSession, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

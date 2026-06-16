import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setToken, clearToken } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setToken(data.token);
    await SecureStore.setItemAsync('fp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    await SecureStore.deleteItemAsync('fp_user');
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync('fp_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return { user, login, logout, restoreSession, isLoggedIn: !!user };
}

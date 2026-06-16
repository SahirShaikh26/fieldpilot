import { useState, useCallback } from 'react';
import api from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fp_user')); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fp_token', data.token);
    localStorage.setItem('fp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    setUser(null);
  }, []);

  return { user, login, logout, isLoggedIn: !!user };
}

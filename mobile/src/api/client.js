import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your deployed Railway URL for production
// During dev on the same WiFi, use your laptop's local IP: http://192.168.x.x:4000/api
const BASE_URL = 'https://fieldpilot-api-production-1652.up.railway.app/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (cfg) => {
  const token = await SecureStore.getItemAsync('fp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const setToken = (token) => SecureStore.setItemAsync('fp_token', token);
export const clearToken = () => SecureStore.deleteItemAsync('fp_token');

export default api;

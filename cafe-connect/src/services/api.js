import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/')) return `http://localhost:3000${url}`;
  if (url.startsWith('http://localhost:5000')) return url.replace('http://localhost:5000', 'http://localhost:3000');
  return url;
};

export default api;

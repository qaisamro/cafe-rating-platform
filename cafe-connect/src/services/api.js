import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return '/api';
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.launchAsset?.url?.replace(/\/.*/, '') ||
    Constants.manifest?.debuggerHost ||
    'localhost:8080';
  const host = hostUri.split(':')[0];
  const port = hostUri.split(':')[1] || '8080';
  return `http://${host}:${port}/api`;
};

const BASE_URL = getBaseUrl();

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

export const getMetroHost = () => {
  if (Platform.OS === 'web') return '';
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    'localhost:8080';
  const host = hostUri.split(':')[0];
  const port = hostUri.split(':')[1] || '8080';
  return `http://${host}:${port}`;
};

export const imgUrl = (url) => {
  if (!url) return null;
  if (Platform.OS === 'web') {
    if (url.startsWith('/')) return url;
    if (url.startsWith('http://localhost:3000')) return url.replace('http://localhost:3000', '');
    if (url.startsWith('http://localhost:5000')) return url.replace('http://localhost:5000', '');
    return url;
  }
  const metroHost = getMetroHost();
  if (url.startsWith('/')) return `${metroHost}${url}`;
  if (url.startsWith('http://localhost:3000')) return url.replace('http://localhost:3000', metroHost);
  if (url.startsWith('http://localhost:5000')) return url.replace('http://localhost:5000', metroHost);
  return url;
};

export default api;

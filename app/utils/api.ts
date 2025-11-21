import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.0.190:1337/api';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get a 401, the token is invalid - clear it
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Token invalid, clearing stored token...');
      await SecureStore.deleteItemAsync('userToken');
      
      // If we're not already on the login page, we could redirect
      // But for now, just clear the token so user can log in again
    }
    return Promise.reject(error);
  }
);

export default api;
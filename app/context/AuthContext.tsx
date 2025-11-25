import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const API_URL = 'https://api-daystar.onrender.com/api'; // Your Express backend

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (idToken: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, password?: string) => Promise<User>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  loginWithEmail: async () => {},
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  updateProfile: async (name: string, password?: string) => {
    // Default implementation - should never be called
    throw new Error('AuthContext not initialized');
  },
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const updateProfile = async (name: string, password?: string) => {
    try {
      const response = await api.put('/auth/profile', {
        name,
        password: password || undefined
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error: any) {
      console.error('Update profile failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      
      if (storedToken) {
        // Verify token with backend
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        if (response.data.success && response.data.valid) {
          setToken(storedToken);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (idToken: string) => {
    try {
      // Send Google ID token to your Express backend
      const response = await axios.post(`${API_URL}/auth/google`, {
        idToken: idToken
      });

      if (response.data.success) {
        const jwtToken = response.data.token;
        const userData = response.data.user;
        
        // Store JWT token securely
        await SecureStore.setItemAsync('userToken', jwtToken);
        
        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const jwtToken = response.data.token;
        const userData = response.data.user;

        await SecureStore.setItemAsync('userToken', jwtToken);

        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error('Email login failed:', error);
      const errorMessage = error.response?.data?.error || "Login failed. Please try again."
      throw new Error(errorMessage);
    }
  };

  const checkPassword = async (password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/checkPassword`, {
        password
      })

      if (response.data.success) {
        return new String('Password meets all requirements!');
      } else {
        return new String(response.data.details);
      }
    } catch (error: any) {
      console.log('Password check error: ', error);
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name
      });

      if (response.data.success) {
        const jwtToken = response.data.token;
        const userData = response.data.user;
        
        await SecureStore.setItemAsync('userToken', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      // Don't log to console - just format the error message
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle password validation errors with details
        if (data.details) {
          // Format the validation errors nicely
          const details = data.details;
          const errors = Object.values(details)
            .filter((err: any) => err !== null)
            .join('\n• ');
          errorMessage = errors ? `Password requirements:\n• ${errors}` : data.errors || errorMessage;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, loginWithEmail, signup, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
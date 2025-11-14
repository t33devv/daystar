import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:1337/api'; // Your Express backend

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

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
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
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, loginWithEmail, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
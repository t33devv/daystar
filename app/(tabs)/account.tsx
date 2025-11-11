import { Entypo, MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import { GOOGLE_CONFIG } from '../config/auth';

WebBrowser.maybeCompleteAuthSession();


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    redirectUri: 'https://auth.expo.io/@anonymous/Daystar'
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleSignIn(authentication.idToken);
      }
    } else if (response?.type === 'error') {
      setLoading(false);
      console.error('Auth error:', response.error);
      Alert.alert('Authentication Error', 'Failed to authenticate with Google');
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      await login(idToken);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Login Failed', 'Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = () => {
    setLoading(true);
    promptAsync();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-100">
        {/* Taller Gradient Header */}
        <LinearGradient
          colors={['#FCD34D', '#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: SCREEN_HEIGHT * 0.31 }}
          className="rounded-b-[40px] items-center pt-20"
        >
          <View className="items-center mt-[20%] mx-8">
            {/* Welcome Text */}
            <Text className=" text-5xl font-bold mb-3 text-center">
              Welcome to Daystar
            </Text>
            <Text className=" text-center text-lg">
              Sign in to sync your habits across devices
            </Text>
          </View>
        </LinearGradient>

        <View className="flex-1 -mt-12 mx-6">
          <View className="bg-white rounded-3xl shadow-md p-6">
            
            {/* Tab Switcher */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
              <TouchableOpacity
                onPress={() => setActiveTab('login')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'login' ? 'bg-white' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === 'login' ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('signup')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'signup' ? 'bg-white' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === 'signup' ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <MaterialIcons name="email" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Entypo name="lock" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              className="bg-gray-900 rounded-xl py-4 shadow-sm"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {activeTab == "login" ? "Sign In" : "Register"}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="mt-4">
              {activeTab == "login" ? (
                <Text className="text-gray-600 text-center">
                  Forgot password?
                </Text>
              ) : null}
            </TouchableOpacity>

            {/* Divider with OR */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 font-medium">OR</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Google Sign In Button */}
            {loading ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#F59E0B" />
              </View>
            ) : (
              <TouchableOpacity 
                onPress={handleGooglePress}
                disabled={!request}
                className="bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <MaterialIcons name="login" size={22} color="#4285F4" />
                <Text className="text-gray-900 text-center font-semibold text-lg ml-3">
                  Continue with Google
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput, // Make sure this is imported
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';



WebBrowser.maybeCompleteAuthSession();

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const checkPasswordStrength = (password: string, activeTab: 'login' | 'signup') => {
  if (activeTab === 'signup') {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);


  }
}

const Login = () => {

  const { login, loginWithEmail, signup, isAuthenticated } = useAuth();  // ← Add new methods
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');  // ← Add name field for signup
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);  // Separate loading for email auth

  const redirectUri = 'https://auth.expo.io/@anonymous/Daystar';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }

    
    
  }, [isAuthenticated]);

  // NEW: Handle email/password login
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setEmailLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Remove the client-side password length check - let backend handle it
    // The backend will return a proper error message

    setEmailLoading(true);
    try {
      await signup(email.trim(), password, name.trim() || 'User');
      router.replace('/(tabs)');
    } catch (error: any) {
      // Show the error message from backend (which includes password requirements)
      Alert.alert('Signup Failed', error.message || 'Could not create account. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f3f4f6' }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#FCD34D', '#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: SCREEN_HEIGHT * 0.31 }}
          className="rounded-b-[40px] items-center pt-20"
        >
          <View className="items-center mt-[20%] mx-8">
            <Text className="text-5xl font-bold mb-3 text-center">
              Welcome to Daystar
            </Text>
            <Text className="text-center text-lg">
              Sign in to sync your habits across devices
            </Text>
          </View>
        </LinearGradient>

        <View className="-mt-12 mx-6 pb-8">
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

            {/* Name Input (only for signup) */}
            {activeTab === 'signup' && (
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Name</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <MaterialIcons name="person" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Your name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

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
                  editable={!emailLoading}
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
                  editable={!emailLoading}
                />
              </View>
            </View>

            { activeTab === 'signup' ? (
              <View className="mb-4">
                <Text className="text-sm text-gray-600">
                  { password.length >= 6 ? null : 'Password must be at least 6 characters long \n' }
                  { /[A-Z]/.test(password) ? null : ('Password must contain at least 1 uppercase letter \n') }
                  { /[a-z]/.test(password) ? null : ('Password must contain at least 1 lowercase letter \n') }
                </Text>
              </View>
            ) : null}

            {/* Sign In/Register Button */}
            <TouchableOpacity 
              onPress={activeTab === 'login' ? handleEmailLogin : handleEmailSignup}
              disabled={emailLoading}
              className="bg-gray-900 rounded-xl py-4 shadow-sm"
              activeOpacity={0.8}
            >
              {emailLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  {activeTab === "login" ? "Sign In" : "Register"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="mt-4">
              {activeTab === "login" ? (
                <Text className="text-gray-600 text-center">
                  Forgot password?
                </Text>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
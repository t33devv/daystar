import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SCREEN_HEIGHT = require('react-native').Dimensions.get('window').height;

const Account = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/(tabs)/login' as any);
    }
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    await logout();
    router.push({ pathname: '/(tabs)/login' } as any);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  // If NOT logged in, redirect to login
  if (!isAuthenticated) {
    return null;
  }

  // If logged in, show account info
  return (
    <View className="flex-1 bg-gray-50">

      {/* User Info Card */}
      <View className="px-8 mt-[30%]">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="items-center mb-6">
            {/* Profile Picture */}
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
                <MaterialIcons name="person" size={48} color="#9CA3AF" />
              </View>
            )}
            
            {/* User Name */}
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.name || 'User'}
            </Text>
            
            {/* Email */}
            <Text className="text-gray-600">{user?.email}</Text>
          </View>
        </View>

        {/* Account Options */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => router.push('/settings' as any)}
          >
            <MaterialIcons name="settings" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-900 font-medium">Settings</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" className="ml-auto" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
            <MaterialIcons name="notifications" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-900 font-medium">Notifications</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" className="ml-auto" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-4">
            <MaterialIcons name="help" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-900 font-medium">Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" className="ml-auto" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-xl py-4 shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Account;
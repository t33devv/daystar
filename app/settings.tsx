import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from './context/AuthContext';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    // If password is provided, check if they match
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile(name.trim(), password || undefined);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <MaterialIcons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900">Settings</Text>
          </View>

          {/* Settings Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Name Input */}
            <View className="mb-6">
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
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">New Password (optional)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <MaterialIcons name="lock" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Leave blank to keep current password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
              <Text className="text-sm text-gray-600 mt-4">
                                { password.length >= 6 ? null : 'Password must be at least 6 characters long \n' }
                                { /[A-Z]/.test(password) ? null : ('Password must contain at least 1 uppercase letter \n') }
                                { /[a-z]/.test(password) ? null : ('Password must contain at least 1 lowercase letter \n') }
                              </Text>
            </View>

            {/* Confirm Password Input */}
            {password ? (
              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">Confirm New Password</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <MaterialIcons name="lock" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>
            ) : null}

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              className="bg-gray-900 rounded-xl py-4 shadow-sm"
              activeOpacity={0.8}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Update Profile
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Settings;
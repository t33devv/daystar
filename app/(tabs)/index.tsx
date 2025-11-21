import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Add this import
import api from '../utils/api';

interface Habit {
  id: number;
  title: string;
  description: string;
  icon: string;
  colour: string;
  created_at: string;
}

const Habits = () => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Add this
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checkingIn, setCheckingIn] = useState<number | null>(null); // Track which habit is being checked in

  // Icon options
  const icons = ['💪', '📚', '🏃', '🧘', '💧', '🎨', '✍️', '🎵', '🌱', '⭐', '🎯'];

  // Color options
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange 2
  ];

  const fetchHabits = async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/habits');
      if (response.data.success) {
        setHabits(response.data.habits || []);
      }
    } catch (error: any) {
      // Only log/show error if user is authenticated
      // If 401 and not authenticated, it's expected - don't show error
      if (isAuthenticated && error.response?.status !== 401) {
        console.error('Fetch habits error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load habits when component mounts AND user is authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchHabits();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]); // Add dependencies

  // NEW: Open modal for editing
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitName(habit.title);
    setDescription(habit.description || '');
    setSelectedIcon(habit.icon);
    setSelectedColor(habit.colour);
    setShowModal(true);
  };

  // NEW: Open modal for creating
  const handleCreateNew = () => {
    setEditingHabit(null);
    setHabitName('');
    setDescription('');
    setSelectedIcon('💪');
    setSelectedColor('#3B82F6');
    setShowModal(true);
  };

  // NEW: Close modal and reset
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHabit(null);
    setHabitName('');
    setDescription('');
    setSelectedIcon('💪');
    setSelectedColor('#3B82F6');
  };

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/habits', {
        title: habitName.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
        colour: selectedColor,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Habit created successfully!');
        handleCloseModal();
        await fetchHabits();
      }
    } catch (error: any) {
      console.error('Create habit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create habit. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  // NEW: Handle updating habit
  const handleUpdateHabit = async () => {
    if (!habitName.trim() || !editingHabit) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setUpdating(true);
    try {
      const response = await api.put(`/habits/${editingHabit.id}`, {
        title: habitName.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
        colour: selectedColor,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Habit updated successfully!');
        handleCloseModal();
        await fetchHabits();
      }
    } catch (error: any) {
      console.error('Update habit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update habit. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckIn = async (habitId: number) => {
    setCheckingIn(habitId);
    try {
      // Get current date in user's local timezone (YYYY-MM-DD format)
      const now = new Date();
      const localDate = now.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      
      const response = await api.post(`/habits/${habitId}/checkin`, {
        localDate: localDate
      });
      
      if (response.data.success) {
        // Refresh habits to get updated streak
        await fetchHabits();
        Alert.alert('Success', `Great job! Your streak is now ${response.data.habit.streak} days! 🔥`);
      }
    } catch (error: any) {
      Alert.alert(
        'Try again later',
        error.response?.data?.error || 'Failed to check in. Please try again.'
      );
    } finally {
      setCheckingIn(null);
    }
  };

  const activeHabits = habits.length;
  const bestStreak = Math.max(...habits.map(h => h.streak || 0), 0);
  const totalCheckIns = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
  const hasHabits = habits.length > 0;

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        persistentScrollbar={true}
        style={{flex:1}}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#FCD34D', '#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${hasHabits ? 'h-[40%]' : 'h-[25%]'} rounded-3xl pt-[2rem]`}
        >
          <View className="absolute top-1 right-2 w-44 h-44 bg-yellow-400/30 rounded-full -mr-16 -mt-16" />
          <View className="absolute bottom-2 left-3 w-40 h-40 bg-yellow-500/30 rounded-full -ml-20 -mb-20" />

          <View className="pt-[5rem] ml-9 mr-9">
            <View className="flex-row items-center mt-3">
              <Text className="text-5xl font-bold text-gray-900">
                Daystar
              </Text>
            </View>
            <Text className={hasHabits ? "text-gray-900 mt-4 mb-7 text-lg" : "text-gray-900 mt-4 mb-12 text-lg"}>
              Build lasting habits, one day at a time ✨
            </Text>
            {hasHabits ? (
              <View className="flex-row mb-8">
                <View 
                  className="h-28 flex-1 mr-3 rounded-2xl p-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Text className="text-5xl font-bold text-black mb-2">{activeHabits}</Text>
                  <Text className="text-black/90 text-xs font-semibold">Active Habits</Text>
                </View>
                  
                <View 
                  className="h-28 flex-1 mr-3 rounded-2xl p-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Text className="text-5xl font-bold text-black mb-2">{bestStreak}</Text>
                  <Text className="text-black/90 text-xs font-semibold">Best Streak</Text>
                </View>

                <View 
                  className="h-28 flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Text className="text-5xl font-bold text-black mb-2">{totalCheckIns}</Text>
                  <Text className="text-black/90 text-xs font-semibold">Total Check-ins</Text>
                </View>
              </View>
            ) : null}
          </View>
        </LinearGradient>
        
        {/* Content Section */}
        <View className="mt-8 ml-9 mr-9">
          <TouchableOpacity 
            className="bg-gray-900 px-4 py-3 mb-2 rounded-lg flex-row items-center justify-center transition duration-300" 
            activeOpacity={0.9}
            onPress={handleCreateNew}
          >
            <Entypo name="plus" size={20} color="white" />
            <Text className="text-white font-semibold ml-3">
              Add New Habit
            </Text>
          </TouchableOpacity>
          
          {loading ? (
            <View className="mt-8 flex items-center justify-center">
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          ) : !hasHabits ? (
            <View className="mt-[6rem] flex items-center justify-center">
              <MaterialCommunityIcons name="star-shooting-outline" size={90} color="gray" />
              <Text className="color-gray-600 mt-4 text-[1.2rem]">
                No habits yet.
              </Text>
              <Text className="color-gray-600 mt-2 text-[1.2rem] text-center">
                Create your first habit to start building your streaks!
              </Text>
            </View>
          ) : (
            <View className="mt-6">
              {habits.map((habit) => (
                <View
                  key={habit.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: habit.colour,
                  }}
                >
                  {/* Header with Gear Icon */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-start flex-1">
                      {/* Icon */}
                      <View
                        className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                        style={{ backgroundColor: habit.colour + '15' }}
                      >
                        <Text style={{ fontSize: 28 }}>{habit.icon}</Text>
                      </View>
                      
                      {/* Habit Info */}
                      <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">
                          {habit.title}
                        </Text>
                        {habit.description && (
                          <Text className="text-gray-600 text-sm">
                            {habit.description}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Gear Button */}
                    <TouchableOpacity
                      onPress={() => handleEditHabit(habit)}
                      className="p-2"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="settings" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Streak Info - Show actual streak */}
                  <View className="flex-row items-center mb-5 mt-2">
                    <MaterialCommunityIcons name="fire" size={20} color={habit.colour} />
                    <Text className="text-2xl font-bold text-gray-900 ml-2">
                      {habit.streak || 0} {habit.streak === 1 ? 'day' : 'days'}
                    </Text>
                    <Text className="text-gray-500 text-base ml-3 mt-1">Best: {habit.streak || 0}</Text>
                  </View>

                  {/* Check-in Button */}
                  <TouchableOpacity
                    onPress={() => handleCheckIn(habit.id)}
                    disabled={checkingIn === habit.id}
                    className="rounded-xl py-3 mt-2 flex-row items-center justify-center"
                    style={{ 
                      backgroundColor: habit.colour,
                      opacity: checkingIn === habit.id ? 0.6 : 1
                    }}
                    activeOpacity={0.8}
                  >
                    {checkingIn === habit.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <MaterialIcons name="camera-alt" size={22} color="white" />
                        <Text className="text-white font-bold text-base ml-2">Check in</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create/Edit New Habit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-4"
          onPress={handleCloseModal}
        >
          <Pressable 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
            onPress={(e) => e.stopPropagation()}
            style={{ maxHeight: '90%' }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                className="p-2"
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={true}
              indicatorStyle="black"
              persistentScrollbar={true}
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Habit Name Input */}
              <View className="px-6 pt-6">
                <Text className="text-gray-700 mb-2 font-medium">Habit Name</Text>
                <TextInput
                  placeholder="e.g., Morning Workout"
                  placeholderTextColor="#9CA3AF"
                  value={habitName}
                  onChangeText={setHabitName}
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    color: '#111827',
                    fontSize: 16,
                  }}
                />
              </View>

              {/* Description Input */}
              <View className="px-6 pt-4">
                <Text className="text-gray-700 mb-2 font-medium">Description (optional)</Text>
                <TextInput
                  placeholder="What does this habit mean to you?"
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    color: '#111827',
                    fontSize: 16,
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                />
              </View>

              {/* Choose an Icon */}
              <View className="px-6 pt-6">
                <Text className="text-gray-700 mb-4 font-medium">Choose an Icon</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {icons.map((icon, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedIcon(icon)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        marginBottom: 12,
                        backgroundColor: selectedIcon === icon ? '#111827' : '#F3F4F6',
                        borderWidth: 2,
                        borderColor: selectedIcon === icon ? '#111827' : '#E5E7EB',
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{icon}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Choose a Color */}
              <View className="px-6 pt-6">
                <Text className="text-gray-700 mb-4 font-medium">Choose a Color</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {colors.map((color, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedColor(color)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        marginRight: 16,
                        marginBottom: 16,
                        backgroundColor: color,
                        borderWidth: 2,
                        borderColor: selectedColor === color ? '#111827' : '#E5E7EB',
                      }}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Create/Update Habit Button */}
            <View className="px-6 pb-6 pt-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={editingHabit ? handleUpdateHabit : handleCreateHabit}
                className="bg-gray-900 rounded-xl py-4"
                activeOpacity={0.8}
                disabled={!habitName.trim() || creating || updating}
                style={{ opacity: habitName.trim() && !creating && !updating ? 1 : 0.5 }}
              >
                {creating || updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Habits;
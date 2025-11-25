import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface CheckIn {
  id: number;
  check_in_date: string;
  image_url: string | null;
  created_at: string;
}

const HabitDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [habit, setHabit] = useState<any>(null);

  const getImageUrl = (imageUrl?: string | null): string | null => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const baseUrl = 'https://api-daystar.onrender.com/api';
    return `${baseUrl}${imageUrl}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch habit details
        const habitsResponse = await api.get('/habits');
        const habitData = habitsResponse.data.habits.find((h: any) => h.id === parseInt(id));
        setHabit(habitData);

        // Fetch check-ins
        const checkInsResponse = await api.get(`/habits/${id}/checkins`);
        if (checkInsResponse.data.success) {
          setCheckIns(checkInsResponse.data.checkIns);
        }
      } catch (error) {
        console.error('Error fetching habit details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Habit not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={[habit.colour || '#FCD34D', habit.colour || '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-16 pb-8 px-6"
      >
        <View className="ml-5 mb-5">
            <TouchableOpacity
                onPress={() => router.back()}
                className="mb-4 flex-row items-center mt-16"
                activeOpacity={0.7}
            >
            <View 
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
                <MaterialIcons name="arrow-back" size={24} color="white" />
            </View>
            </TouchableOpacity>
            
            <View className="flex-row items-center mb-2">
            <Text style={{ fontSize: 32 }} className="mr-3">{habit.icon}</Text>
            <Text className="text-3xl font-bold text-white">{habit.title}</Text>
            </View>
            {habit.description && (
            <Text className="text-white/90 text-base mt-2">{habit.description}</Text>
            )}
            <View className="flex-row items-center mt-4">
            <MaterialIcons name="local-fire-department" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
                {habit.streak || 0} day streak 🔥
            </Text>
            </View>
        </View>
        
      </LinearGradient>

      {/* Check-ins List */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {checkIns.length === 0 ? (
          <View className="items-center justify-center py-20">
            <MaterialIcons name="photo-library" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4">No check-ins yet</Text>
            <Text className="text-gray-400 text-sm mt-2">Start checking in to see your progress!</Text>
          </View>
        ) : (
          <View className="px-3">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Your Journey ({checkIns.length} {checkIns.length === 1 ? 'day' : 'days'})
            </Text>
            {checkIns.map((checkIn) => (
              <View
                key={checkIn.id}
                className="bg-white rounded-2xl mb-4 shadow-sm"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: habit.colour,
                }}
              >
                <View className="p-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    {formatDate(checkIn.check_in_date)}
                  </Text>
                  {checkIn.image_url && getImageUrl(checkIn.image_url) && (
                    <View className="rounded-xl overflow-hidden mt-2" style={{ borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <Image
                        source={{ uri: getImageUrl(checkIn.image_url)! }}
                        style={{ width: '100%', height: 300 }}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HabitDetail;
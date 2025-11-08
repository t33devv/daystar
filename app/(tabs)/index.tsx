import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Habits = () => {
  const [isHabits, setIsHabits] = useState(false);

  const [activeHabits, setActiveHabits] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);

  let statsBoxStyle = "bg-blue-100 h-26 flex-1 mr-4 rounded-2xl p-5 flex items-top pt-4";
  let statsBoxTextStyle = "text-2xl font-bold";

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#FCD34D', '#FBBF24', '#F59E0B']} // Yellow gradient colors
        start={{ x: 0, y: 0 }} // Top-left
        end={{ x: 1, y: 1 }} // Bottom-right
        className={`${isHabits ? 'h-[40%]' : 'h-[25%]'} rounded-3xl pt-[2rem]`}
      >
        <View className="absolute top-1 right-2 w-44 h-44 bg-yellow-400/30 rounded-full -mr-16 -mt-16" />
        <View className="absolute bottom-2 left-3 w-40 h-40 bg-yellow-500/30 rounded-full -ml-20 -mb-20" />


        <View className="pt-[5rem] ml-9 mr-9">
          <View className="flex-row items-center mt-3">
            <Text className="text-5xl font-bold text-gray-900">
              Daystar
            </Text>
          </View>
          <Text className="text-gray-900 mt-4 mb-12 text-lg">
            Build lasting habits, one day at a time ✨
          </Text>
          { isHabits ? (
            <View className="flex-row mt-10">
              <View className={statsBoxStyle}>
                <View>
                  <Text className={statsBoxTextStyle}>{activeHabits}</Text>
                  <Text>Active Habits</Text>
                </View>
              </View>
                
              <View className={statsBoxStyle}>
                <View>
                  <Text className={statsBoxTextStyle}>{bestStreak}</Text>
                  <Text>Best Streak</Text>
                </View>
              </View>

              <View className="bg-blue-100 h-26 flex-1 rounded-2xl p-5 pt-4">
                <View>
                  <Text className={statsBoxTextStyle}>{totalCheckIns}</Text>
                  <Text>Total Check-ins</Text>
                </View>
              </View>
            </View>
          ) : (
            null
          )}
        </View>
      </LinearGradient>
      <View className="flex-1 mt-8 ml-9 mr-9">
        <TouchableOpacity className="bg-gray-900 px-4 py-3 rounded-lg flex-row items-center justify-center transition duration-300" activeOpacity={0.9}>
          <Entypo name="plus" size={20} color="white" />
          <Text className="text-white font-semibold ml-3">
            Add New Habit
          </Text>
        </TouchableOpacity>
        {!isHabits ? (
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
          <View>
            {/* Render list of habits here */}
          </View>
        )}
      </View>
    </View>
  )
}

export default Habits
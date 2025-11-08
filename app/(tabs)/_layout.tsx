import React from 'react';

import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View } from 'react-native';

const _layout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#f8f8f8',
                    height: 100,
                    paddingBottom: 20,
                    paddingTop: 15,
                },
                tabBarItemStyle: {
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Habits",
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <FontAwesome name="calendar-check-o" size={size} color={color} />
                        </View>
                        
                    ),
                }}
                
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}

export default _layout;
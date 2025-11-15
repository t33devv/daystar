import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const _layout = () => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/(tabs)/login' as any);
        }
    }, [isAuthenticated, loading]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        );
    }

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
                    href: !isAuthenticated ? null : '/(tabs)/account',
                }}
            />
            <Tabs.Screen
                name="login"
                options={{
                    title: "Login",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="log-in" size={size} color={color} />
                    ),
                    // Hide login tab when logged in
                    href: !isAuthenticated ? '/(tabs)/login' : null,
                }}
            />,
        </Tabs>
    );
}

export default _layout;
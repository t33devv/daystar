import { Stack } from "expo-router";
import { AuthProvider } from './context/AuthContext';
import './globals.css';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // still respected on Android
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,     // new iOS 18+ requirement
    shouldShowList: true        // new iOS 18+ requirement
  }),
});

function useNotificationSetup() {
  useEffect(() => {
    const register = async () => {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    };
    register();
  }, []);
}

export default function RootLayout() {
  useNotificationSetup()
  
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="habit/[id]" />
      </Stack>
    </AuthProvider>
  );
}
import { Stack } from "expo-router";
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
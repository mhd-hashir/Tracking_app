import FontAwesome from '@expo/vector-icons/FontAwesome';
import '../services/LocationTask';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}



// Imports moved to top


function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <MainLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login' as any);
    } else if (user) {
      // Redirect based on role
      if (user.role === 'OWNER') {
        router.replace('/(owner)' as any);
      } else if (user.role === 'ADMIN') {
        router.replace('/(admin)' as any);
      } else {
        // Employee
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(owner)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

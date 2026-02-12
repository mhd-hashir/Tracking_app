import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth, API_URL } from '@/context/AuthContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkBroadcasts = async () => {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        const res = await fetch(`${API_URL}/system/broadcasts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.broadcasts && data.broadcasts.length > 0) {
            const latest = data.broadcasts[0];
            const lastSeen = await SecureStore.getItemAsync('last_broadcast_id');

            if (latest.id !== lastSeen) {
              Alert.alert('📢 New Announcement', latest.message, [
                { text: 'OK', onPress: () => SecureStore.setItemAsync('last_broadcast_id', latest.id) }
              ]);
            }
          }
        }
      } catch (e) {
        console.log('Broadcast check failed', e);
      }
    };

    checkBroadcasts();
    // Poll every minute
    const interval = setInterval(checkBroadcasts, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
    </Tabs>
  );
}

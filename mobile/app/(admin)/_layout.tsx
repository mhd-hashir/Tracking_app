
import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#1e293b',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Admin Console' }} />
            <Stack.Screen name="owners" options={{ title: 'Manage Owners' }} />
            <Stack.Screen name="add-owner" options={{ title: 'Add New Owner' }} />
            <Stack.Screen name="owner/[id]" options={{ title: 'Owner Details' }} />
            <Stack.Screen name="logs" options={{ title: 'System Logs' }} />
            <Stack.Screen name="broadcasts" options={{ title: 'Broadcasts' }} />
        </Stack>
    );
}

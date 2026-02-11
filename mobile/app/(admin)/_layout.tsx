
import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="owners" />
            <Stack.Screen name="add-owner" />
            <Stack.Screen name="owner/[id]" />
            <Stack.Screen name="logs" />
            <Stack.Screen name="broadcasts" />
        </Stack>
    );
}

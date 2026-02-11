
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../context/AuthContext';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
        console.error('Location task error:', error);
        return;
    }

    if (data) {
        const { locations } = data;
        // locations is an array of Location objects
        // We can batch them or send the last one.
        // For simplicity, send the last one.
        const location = locations[locations.length - 1];

        try {
            const token = await SecureStore.getItemAsync('session_token');
            if (!token) return; // No user, don't send

            await fetch(`${API_URL}/tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    timestamp: location.timestamp,
                })
            });

        } catch (err) {
            console.error('Failed to sync location', err);
        }
    }
});

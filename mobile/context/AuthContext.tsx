
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import { Platform } from 'react-native';

// Adjust this to your machine's IP if testing on a physical device!
// For Android Emulator, 10.0.2.2 points to localhost of the host machine.
// Using localhost for Web Testing, and Vercel Production for mobile
const API_URL = Platform.OS === 'web'
    ? 'http://localhost:3000/api/mobile'
    : 'https://tracking-app-hazel.vercel.app/api/mobile';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isOnDuty: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
    updateUser: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const storedUser = await SecureStore.getItemAsync('user_data');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                // Ideally verify token with backend here, or just trust storage for offline-first feeling
                // We can silently re-verify in background.
            }
        } catch (e) {
            console.error('Failed to load session', e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            await SecureStore.setItemAsync('session_token', data.token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));

            setUser(data.user);
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('session_token');
        await SecureStore.deleteItemAsync('user_data');
        setUser(null);
        router.replace('/login');
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            SecureStore.setItemAsync('user_data', JSON.stringify(updated));
            return updated;
        });
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export { API_URL };

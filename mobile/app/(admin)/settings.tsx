
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, Globe } from 'lucide-react-native';

export default function SettingsScreen() {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/mobile/system/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.settings) {
                setDomain(data.settings.defaultDomain);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!domain) {
            Alert.alert('Error', 'Domain cannot be empty');
            return;
        }

        // Frontend validation: remove https://
        let cleanDomain = domain.replace(/^https?:\/\//, '');
        // User request: remove https:// from input.

        setSaving(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/mobile/system/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ defaultDomain: cleanDomain })
            });

            const data = await response.json();
            if (response.ok) {
                setDomain(data.settings.defaultDomain);
                Alert.alert('Success', 'Settings updated successfully');
            } else {
                Alert.alert('Error', data.error || 'Failed to update');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4f46e5" />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Global Settings' }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Globe size={32} color="#4f46e5" />
                    </View>

                    <Text style={styles.cardTitle}>Application Domain</Text>
                    <Text style={styles.description}>
                        Set the forced email domain for new owner accounts.
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Forced Email Domain</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="@company.com"
                            value={domain}
                            onChangeText={setDomain}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={styles.hint}>Do not include https://</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Save size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    formGroup: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    hint: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 6,
        fontStyle: 'italic',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#4f46e5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

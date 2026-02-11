
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, User, Lock, Store } from 'lucide-react-native';

export default function AddEmployeeScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [domain, setDomain] = useState('...');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDomain();
    }, []);

    const fetchDomain = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setDomain(data.domain);
            }
        } catch (error) {
            console.error('Failed to fetch domain settings', error);
        }
    };

    const handleSubmit = async () => {
        if (!name || !username || !password) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    username,
                    password
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', `Employee added: ${username}@${domain}`, [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.error || 'Failed to create employee');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Add New Employee' }} />

            <View style={styles.form}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <Text style={styles.label}>Username *</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="john.doe"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <View style={styles.domainBadge}>
                        <Text style={styles.domainText}>@{domain}</Text>
                    </View>
                </View>

                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Secret123"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Create Employee Account</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingLeft: 12,
        overflow: 'hidden'
    },
    input: { flex: 1, padding: 14, fontSize: 16, color: '#333' },
    domainBadge: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderLeftWidth: 1,
        borderLeftColor: '#cbd5e1'
    },
    domainText: { color: '#64748b', fontWeight: '500' },
    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, gap: 8, marginTop: 40
    },
    disabledButton: { opacity: 0.7 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, Trash2, User, Lock, Mail, ToggleLeft, Clock } from 'lucide-react-native';

export default function EditEmployeeScreen() {
    const router = useRouter();
    const { id, employee: initialEmpJson } = useLocalSearchParams();
    const [empData, setEmpData] = useState<any>(initialEmpJson ? JSON.parse(initialEmpJson as string) : null);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isOnDuty, setIsOnDuty] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (empData) {
            setName(empData.name || '');
            setIsOnDuty(empData.isOnDuty || false);
        } else if (id) {
            // Fetch if not passed via params (reliable fallback)
            fetchEmployee();
        }
    }, [empData]);

    const fetchEmployee = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const res = await fetch(`${API_URL}/owner/employees/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmpData(data.employee);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdate = async () => {
        if (!name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    password: password || undefined, // Only send if changed
                    isOnDuty
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Employee updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error('Failed to update employee');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Employee',
            'Are you sure? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const token = await SecureStore.getItemAsync('session_token');
                            const response = await fetch(`${API_URL}/owner/employees/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (response.ok) {
                                router.back();
                            } else {
                                throw new Error('Failed to delete employee');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (!empData) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Employee' }} />

            <View style={styles.form}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Employee Name"
                    />
                </View>

                <Text style={styles.label}>Reset Password (Optional)</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="New Password"
                        secureTextEntry
                    />
                </View>

                <Text style={styles.label}>Status (On/Off Duty)</Text>
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Is On Duty?</Text>
                    <Switch
                        value={isOnDuty}
                        onValueChange={setIsOnDuty}
                        trackColor={{ false: "#767577", true: "#818cf8" }}
                        thumbColor={isOnDuty ? "#4f46e5" : "#f4f3f4"}
                    />
                </View>

                {/* Read Only Email */}
                <Text style={styles.label}>Email (Cannot be changed)</Text>
                <View style={[styles.inputContainer, { backgroundColor: '#f1f5f9' }]}>
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                        style={[styles.input, { color: '#64748b' }]}
                        value={empData.email}
                        editable={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.logsButton]}
                    onPress={() => router.push({ pathname: '/(owner)/employee-logs', params: { id } })}
                >
                    <Clock size={20} color="#4f46e5" />
                    <Text style={styles.logsText}>View Duty History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleUpdate}
                    disabled={submitting || deleting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Update Employee</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, deleting && styles.disabledButton]}
                    onPress={handleDelete}
                    disabled={submitting || deleting}
                >
                    {deleting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Trash2 size={20} color="#fff" />
                            <Text style={styles.submitText}>Delete Account</Text>
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
        paddingHorizontal: 12,
        height: 50,
    },
    input: { flex: 1, padding: 10, fontSize: 16, color: '#333' },
    switchContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0'
    },
    switchLabel: { fontSize: 16, color: '#334155' },
    logsButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#eef2ff', padding: 16, borderRadius: 12, gap: 8, marginTop: 20
    },
    logsText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 16 },
    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, gap: 8, marginTop: 30
    },
    deleteButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#dc2626', padding: 16, borderRadius: 12, gap: 8, marginTop: 12
    },
    disabledButton: { opacity: 0.7 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

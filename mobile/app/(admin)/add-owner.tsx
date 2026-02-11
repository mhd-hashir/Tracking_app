
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import { User, Mail, Lock, Phone, Save } from 'lucide-react-native';

export default function AddOwner() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [planType, setPlanType] = useState('FREE');
    const [status, setStatus] = useState('ACTIVE');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/owners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    mobile,
                    planType,
                    subscriptionStatus: status
                })
            });


            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Owner account created', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.error || 'Failed to create owner');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Add New Owner' }} />

            <View style={styles.form}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Business Owner Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="owner@business.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="TempPassword123"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                    <Phone size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="+91 98765 43210"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                    />
                </View>

                <Text style={styles.label}>Plan Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={planType}
                        onValueChange={(itemValue) => setPlanType(itemValue)}
                    >
                        <Picker.Item label="Free" value="FREE" />
                        <Picker.Item label="Pro" value="PRO" />
                        <Picker.Item label="Enterprise" value="ENTERPRISE" />
                    </Picker>
                </View>

                <Text style={styles.label}>Subscription Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                    >
                        <Picker.Item label="Active" value="ACTIVE" />
                        <Picker.Item label="Inactive" value="INACTIVE" />
                        <Picker.Item label="Suspended" value="SUSPENDED" />
                    </Picker>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Create Account</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        marginTop: 40,
    },
    disabledButton: { opacity: 0.7 },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
    }
});

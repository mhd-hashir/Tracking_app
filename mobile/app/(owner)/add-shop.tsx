
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { MapPin, Save } from 'lucide-react-native';

export default function AddShopScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [dueAmount, setDueAmount] = useState('');

    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleGetLocation = async () => {
        setGettingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to tag this shop.');
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to get location');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) {
            Alert.alert('Error', 'Shop Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/shops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    address,
                    mobile,
                    dueAmount: dueAmount ? parseFloat(dueAmount) : 0,
                    latitude: location?.lat || null,
                    longitude: location?.lng || null
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Shop added successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.error || 'Failed to create shop');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Add New Shop', headerBackTitle: 'Cancel' }} />

            <View style={styles.form}>
                <Text style={styles.label}>Shop Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Al-Madina Supermarket"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Street, City..."
                    value={address}
                    onChangeText={setAddress}
                />

                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    keyboardType="phone-pad"
                    value={mobile}
                    onChangeText={setMobile}
                />

                <Text style={styles.label}>Initial Due Amount (₹)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={dueAmount}
                    onChangeText={setDueAmount}
                />

                <Text style={styles.label}>Location</Text>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleGetLocation}
                    disabled={gettingLocation}
                >
                    {gettingLocation ? <ActivityIndicator color="#4f46e5" /> : (
                        <>
                            <MapPin size={20} color="#4f46e5" />
                            <Text style={styles.locationText}>
                                {location
                                    ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                                    : 'Use Current Location'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Save Shop</Text>
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
    input: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#333',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eef2ff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c7d2fe',
        borderStyle: 'dashed',
        gap: 8,
    },
    locationText: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 40,
        marginBottom: 40,
    },
    disabledButton: { opacity: 0.7 },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

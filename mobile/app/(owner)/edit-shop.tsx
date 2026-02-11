
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, Trash2, MapPin, Navigation, Store, Phone, DollarSign } from 'lucide-react-native';
import * as Location from 'expo-location';
import LocationPicker from '../../components/LocationPicker';

export default function EditShopScreen() {
    const router = useRouter();
    const { id, shop: initialShopJson } = useLocalSearchParams();
    const [shopData, setShopData] = useState<any>(initialShopJson ? JSON.parse(initialShopJson as string) : null);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [dueAmount, setDueAmount] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [gettingLocation, setGettingLocation] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (shopData) {
            setName(shopData.name);
            setAddress(shopData.address || '');
            setMobile(shopData.mobile || '');
            setDueAmount(shopData.dueAmount?.toString() || '0');
            setLatitude(shopData.latitude?.toString() || '');
            setLongitude(shopData.longitude?.toString() || '');
        }
    }, [shopData]);

    const handleGetLocation = async () => {
        setGettingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to tag this shop.');
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLatitude(loc.coords.latitude.toString());
            setLongitude(loc.coords.longitude.toString());
        } catch (error) {
            Alert.alert('Error', 'Failed to get location');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleUpdate = async () => {
        if (!name) {
            Alert.alert('Error', 'Shop name is required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/shops/${shopData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    address,
                    mobile,
                    dueAmount: parseFloat(dueAmount),
                    latitude: parseFloat(latitude) || null,
                    longitude: parseFloat(longitude) || null
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Shop updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error('Failed to update shop');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Shop',
            'Are you sure you want to delete this shop? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const token = await SecureStore.getItemAsync('session_token');
                            const response = await fetch(`${API_URL}/owner/shops/${shopData.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (response.ok) {
                                router.back();
                            } else {
                                throw new Error('Failed to delete shop');
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

    if (!shopData) return <ActivityIndicator />;

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Shop' }} />

            <View style={styles.form}>
                <Text style={styles.label}>Shop Name *</Text>
                <View style={styles.inputContainer}>
                    <Store size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter shop name"
                    />
                </View>

                <Text style={styles.label}>Address</Text>
                <View style={styles.inputContainer}>
                    <MapPin size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Enter address"
                        multiline
                    />
                </View>

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                    <Phone size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={mobile}
                        onChangeText={setMobile}
                        placeholder="Contact number"
                        keyboardType="phone-pad"
                    />
                </View>

                <Text style={styles.label}>Due Amount (₹)</Text>
                <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        value={dueAmount}
                        onChangeText={setDueAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                    />
                </View>

                <Text style={styles.label}>Location</Text>

                <LocationPicker
                    visible={showPicker}
                    initialLocation={(latitude && longitude) ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null}
                    onClose={() => setShowPicker(false)}
                    onSelect={(loc) => {
                        setLatitude(loc.lat.toString());
                        setLongitude(loc.lng.toString());
                        setShowPicker(false);
                    }}
                />

                <View style={styles.locationContainer}>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setShowPicker(true)}
                    >
                        <MapPin size={20} color="#4f46e5" />
                        <Text style={styles.locationText}>
                            {(latitude && longitude)
                                ? `Selected: ${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`
                                : 'Select on Map'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gpsButton}
                        onPress={handleGetLocation}
                        disabled={gettingLocation}
                    >
                        {gettingLocation ? <ActivityIndicator color="#4f46e5" /> : <Navigation size={20} color="#4f46e5" />}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleUpdate}
                    disabled={submitting || deleting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Update Shop</Text>
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
                            <Text style={styles.submitText}>Delete Shop</Text>
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
    inputBorder: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#fff' },
    locationContainer: { flexDirection: 'row', gap: 10 },
    locationButton: {
        flex: 1,
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
    gpsButton: {
        width: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    locationText: { color: '#4f46e5', fontWeight: '600' },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
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

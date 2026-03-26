import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, Check, User as UserIcon, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

interface Employee { id: string; name: string; email: string; }
interface Shop { id: string; name: string; address: string; }

export default function EditRouteScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [day, setDay] = useState('MONDAY');
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [selectedShops, setSelectedShops] = useState<string[]>([]); // Ordered IDs

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');

            // Fetch All Data needed
            const [empRes, shopRes, routeRes] = await Promise.all([
                fetch(`${API_URL}/owner/employees`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/owner/shops`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/owner/routes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const empData = await empRes.json();
            const shopData = await shopRes.json();
            const routeData = await routeRes.json();

            if (empRes.ok) setEmployees(empData.employees || []);
            if (shopRes.ok) setShops(shopData.shops || []);

            if (routeRes.ok && routeData.route) {
                const r = routeData.route;
                setName(r.name);
                setDay(r.dayOfWeek || 'MONDAY');
                setSelectedEmployee(r.assignedToId);
                // Extract shop IDs from stops
                if (r.stops) {
                    setSelectedShops(r.stops.map((s: any) => s.shopId));
                }
            }

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load route data');
        } finally {
            setLoading(false);
        }
    };

    // Toggle shop selection (append or remove)
    const toggleShop = (id: string) => {
        if (selectedShops.includes(id)) {
            setSelectedShops(prev => prev.filter(s => s !== id));
        } else {
            setSelectedShops(prev => [...prev, id]);
        }
    };

    const handleUpdate = async () => {
        if (!name) {
            Alert.alert('Error', 'Route Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/routes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    dayOfWeek: day,
                    assignedToId: selectedEmployee,
                    orderedShopIds: selectedShops
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Route updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error('Failed to update route');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Route',
            'Are you sure? This will remove all stops associated with it.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const token = await SecureStore.getItemAsync('session_token');
                            const response = await fetch(`${API_URL}/owner/routes/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (response.ok) {
                                router.back();
                            } else {
                                throw new Error('Failed to delete route');
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

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4f46e5" />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Route' }} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.label}>Route Name *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Day of Week</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={day}
                        onValueChange={(itemValue) => setDay(itemValue)}
                        style={[styles.picker, { color: '#000' }]}
                        dropdownIconColor="#000"
                    >
                        <Picker.Item label="Monday" value="MONDAY" />
                        <Picker.Item label="Tuesday" value="TUESDAY" />
                        <Picker.Item label="Wednesday" value="WEDNESDAY" />
                        <Picker.Item label="Thursday" value="THURSDAY" />
                        <Picker.Item label="Friday" value="FRIDAY" />
                        <Picker.Item label="Saturday" value="SATURDAY" />
                        <Picker.Item label="Sunday" value="SUNDAY" />
                    </Picker>
                </View>

                {/* NOTE: If API doesn't support updating assignee via PUT /routes/[id], this UI won't work perfectly.
                    Assigning routes is often done via /owner/employees (assign route to employee).
                    But let's keep it here for UI consistency, and I will update API to support it.
                */}

                <Text style={styles.label}>Manage Stops ({selectedShops.length})</Text>
                <View style={styles.shopList}>
                    {shops.map(shop => {
                        const isSelected = selectedShops.includes(shop.id);
                        return (
                            <TouchableOpacity
                                key={shop.id}
                                style={[styles.shopItem, isSelected && styles.shopSelected]}
                                onPress={() => toggleShop(shop.id)}
                            >
                                <View style={styles.shopInfo}>
                                    <Text style={[styles.shopName, isSelected && styles.shopNameSelected]}>{shop.name}</Text>
                                    <Text style={styles.shopAddr} numberOfLines={1}>{shop.address || 'No Address'}</Text>
                                </View>
                                <View style={[styles.checkbox, isSelected && styles.checked]}>
                                    {isSelected && <Check size={14} color="#fff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleUpdate}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Save Changes</Text>
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
                            <Text style={styles.submitText}>Delete Route</Text>
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { padding: 20, paddingBottom: 100 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#fff', padding: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0', color: '#333' },
    shopList: { gap: 8 },
    shopItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    shopSelected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
    shopInfo: { flex: 1 },
    shopName: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 2 },
    shopNameSelected: { color: '#4f46e5' },
    shopAddr: { fontSize: 12, color: '#94a3b8' },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
    checked: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, gap: 8, marginTop: 30 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dc2626', padding: 16, borderRadius: 12, gap: 8, marginTop: 12 },
    disabledButton: { opacity: 0.7 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    pickerContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
    picker: { width: '100%', height: Platform.OS === 'android' ? 55 : undefined }
});

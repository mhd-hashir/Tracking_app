
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Save, Check, User as UserIcon } from 'lucide-react-native';

interface Employee { id: string; name: string; email: string; }
interface Shop { id: string; name: string; address: string; }

export default function AddRouteScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [selectedShops, setSelectedShops] = useState<string[]>([]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');

            // Parallel fetch
            const [empRes, shopRes] = await Promise.all([
                fetch(`${API_URL}/owner/employees`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/owner/shops`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const empData = await empRes.json();
            const shopData = await shopRes.json();

            if (empRes.ok) setEmployees(empData.employees || []);
            if (shopRes.ok) setShops(shopData.shops || []);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const toggleShop = (id: string) => {
        if (selectedShops.includes(id)) {
            setSelectedShops(prev => prev.filter(s => s !== id));
        } else {
            setSelectedShops(prev => [...prev, id]);
        }
    };

    const handleSubmit = async () => {
        if (!name) {
            Alert.alert('Error', 'Route Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/routes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    assignedToId: selectedEmployee,
                    shopIds: selectedShops
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Route created successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.error || 'Failed to create route');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4f46e5" />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Create Route' }} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.label}>Route Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Downtown Morning Route"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Assign Employee (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.empScroll}>
                    {employees.map(emp => (
                        <TouchableOpacity
                            key={emp.id}
                            style={[styles.empChip, selectedEmployee === emp.id && styles.empActive]}
                            onPress={() => setSelectedEmployee(selectedEmployee === emp.id ? null : emp.id)}
                        >
                            <UserIcon size={16} color={selectedEmployee === emp.id ? '#fff' : '#64748b'} />
                            <Text style={[styles.empText, selectedEmployee === emp.id && styles.empTextActive]}>
                                {emp.name || emp.email}
                            </Text>
                            {selectedEmployee === emp.id && <Check size={14} color="#fff" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>Select Shops ({selectedShops.length})</Text>
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

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.submitText}>Save Route</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scroll: {
        padding: 20,
        paddingBottom: 100,
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
    empScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    empChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
        gap: 6,
    },
    empActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    empText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    empTextActive: {
        color: '#fff',
    },
    shopList: {
        gap: 8,
    },
    shopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    shopSelected: {
        borderColor: '#4f46e5',
        backgroundColor: '#eef2ff',
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 2,
    },
    shopNameSelected: {
        color: '#4f46e5',
    },
    shopAddr: {
        fontSize: 12,
        color: '#94a3b8',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checked: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    disabledButton: { opacity: 0.7 },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

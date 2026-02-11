
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { User, Phone, Mail, Calendar, Trash2 } from 'lucide-react-native';

export default function OwnerDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOwner = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/owners/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOwner(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOwner();
    }, [id]);

    const handleToggleStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/owners/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !owner.isActive })
            });

            if (response.ok) {
                fetchOwner();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Owner',
            'Are you sure? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('session_token');
                            await fetch(`${API_URL}/admin/owners/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} color="#4f46e5" />;
    if (!owner) return <Text style={{ padding: 20 }}>Owner not found</Text>;

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: owner.name }} />

            <View style={styles.header}>
                <View style={styles.avatar}>
                    <User size={40} color="#4f46e5" />
                </View>
                <Text style={styles.name}>{owner.name}</Text>
                <View style={[styles.badge, owner.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.badgeText, owner.isActive ? styles.activeText : styles.inactiveText]}>
                        {owner.isActive ? 'Active Account' : 'Account Suspended'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Info</Text>
                <View style={styles.row}>
                    <Mail size={20} color="#64748b" />
                    <Text style={styles.rowText}>{owner.email}</Text>
                </View>
                <View style={styles.row}>
                    <Phone size={20} color="#64748b" />
                    <Text style={styles.rowText}>{owner.mobile || 'No mobile number'}</Text>
                </View>
                <View style={styles.row}>
                    <Calendar size={20} color="#64748b" />
                    <Text style={styles.rowText}>Joined {new Date(owner.createdAt).toDateString()}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usage Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{owner._count.employees}</Text>
                        <Text style={styles.statLabel}>Employees</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{owner._count.shops}</Text>
                        <Text style={styles.statLabel}>Shops</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, owner.isActive ? styles.suspendBtn : styles.activateBtn]}
                    onPress={handleToggleStatus}
                >
                    <Text style={[styles.btnText, owner.isActive ? { color: '#b91c1c' } : { color: '#15803d' }]}>
                        {owner.isActive ? 'Suspend Account' : 'Activate Account'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={handleDelete}>
                    <Trash2 size={20} color="#ef4444" />
                    <Text style={[styles.btnText, { color: '#ef4444' }]}>Delete Account</Text>
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
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: { backgroundColor: '#dcfce7' },
    inactiveBadge: { backgroundColor: '#fee2e2' },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    activeText: { color: '#16a34a' },
    inactiveText: { color: '#b91c1c' },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    rowText: {
        fontSize: 16,
        color: '#334155',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    actions: {
        padding: 20,
    },
    btn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    suspendBtn: { borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
    activateBtn: { borderColor: '#dcfce7', backgroundColor: '#f0fdf4' },
    deleteBtn: { borderColor: '#fee2e2' },
    btnText: {
        fontWeight: '600',
        fontSize: 16,
    }
});

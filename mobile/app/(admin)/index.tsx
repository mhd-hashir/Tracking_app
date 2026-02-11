
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Users, UserPlus, TrendingUp, LogOut } from 'lucide-react-native';

interface AdminStats {
    totalOwners: number;
    activeOwners: number;
    inactiveOwners: number;
}

export default function AdminDashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.appBar}>
                <Text style={styles.appTitle}>Admin Console</Text>
                <TouchableOpacity onPress={signOut}>
                    <LogOut size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{user?.name}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                            <Users size={24} color="#4f46e5" />
                        </View>
                        <Text style={styles.statValue}>{stats?.totalOwners || 0}</Text>
                        <Text style={styles.statLabel}>Total Owners</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                            <TrendingUp size={24} color="#16a34a" />
                        </View>
                        <Text style={styles.statValue}>{stats?.activeOwners || 0}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>

                {/* Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/add-owner')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                        <UserPlus size={24} color="#ea580c" />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Add New Owner</Text>
                        <Text style={styles.actionDesc}>Create a new subscription account</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/owners')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]}>
                        <Users size={24} color="#374151" />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Manage Owners</Text>
                        <Text style={styles.actionDesc}>View and edit registered owners</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 16,
        color: '#64748b',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 13,
        color: '#64748b',
    }
});

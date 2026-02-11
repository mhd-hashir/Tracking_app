
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter } from 'expo-router';
import { Users, DollarSign, MapPin, ShoppingBag, Route as RouteIcon, PlusSquare, Map, UserPlus, User as UserIcon } from 'lucide-react-native';

interface DashboardStats {
    activeEmployees: number;
    todayCollection: number;
    todayCount: number;
}

export default function OwnerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            if (!token) return;

            const response = await fetch(`${API_URL}/owner/dashboard`, {
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
            <Stack.Screen
                options={{
                    headerTitle: 'Dashboard',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/(owner)/profile')}>
                            <View style={styles.profileIcon}>
                                <UserIcon size={20} color="#4f46e5" />
                            </View>
                        </TouchableOpacity>
                    ),
                    headerShown: true
                }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
                    <Text style={styles.dateText}>{new Date().toDateString()}</Text>
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.activeEmployees || 0}</Text>
                        <Text style={styles.statLabel}>Active Staff</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>₹{stats?.todayCollection?.toLocaleString() || 0}</Text>
                        <Text style={styles.statLabel}>Collected</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.todayCount || 0}</Text>
                        <Text style={styles.statLabel}>Visits</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Management</Text>
                <View style={styles.grid}>
                    {/* Consolidated Menu */}
                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(owner)/shops')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                            <ShoppingBag color="#4f46e5" size={28} />
                        </View>
                        <Text style={styles.menuTitle}>Shops</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(owner)/routes')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                            <RouteIcon color="#16a34a" size={28} />
                        </View>
                        <Text style={styles.menuTitle}>Routes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(owner)/employees')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#ffedd5' }]}>
                            <Users color="#ea580c" size={28} />
                        </View>
                        <Text style={styles.menuTitle}>Employees</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(owner)/map')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                            <MapPin color="#e11d48" size={28} />
                        </View>
                        <Text style={styles.menuTitle}>Live Map</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    dateText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    menuCard: {
        width: '47%', // 2 columns with gap
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    }
});

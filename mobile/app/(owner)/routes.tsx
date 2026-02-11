
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, View, Text } from 'react-native';
import { Stack, Link } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Route as RouteIcon, Plus, User } from 'lucide-react-native';

interface Route {
    id: string;
    name: string;
    assignedTo: { name: string | null; email: string; } | null;
    _count: { stops: number; };
}

export default function OwnerRoutesScreen() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRoutes = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/routes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setRoutes(data.routes || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRoutes();
    };

    const renderItem = ({ item }: { item: Route }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <RouteIcon size={24} color="#4f46e5" />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.countText}>{item._count.stops} Stops</Text>
                    {item.assignedTo && (
                        <View style={styles.assigneeBadge}>
                            <User size={12} color="#15803d" />
                            <Text style={styles.assigneeText} numberOfLines={1}>
                                {item.assignedTo.name || item.assignedTo.email}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Manage Routes' }} />
            <View style={styles.header}>
                <Text style={styles.title}>Routes</Text>
                <Link href="/(owner)/add-route" asChild>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </Link>
            </View>

            <FlatList
                data={routes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No routes created yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countText: {
        fontSize: 14,
        color: '#64748b',
    },
    assigneeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    assigneeText: {
        fontSize: 12,
        color: '#15803d',
        fontWeight: '600',
        maxWidth: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#94a3b8',
    }
});

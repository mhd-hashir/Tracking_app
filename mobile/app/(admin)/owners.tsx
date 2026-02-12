
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Search, Plus, ChevronRight } from 'lucide-react-native';

interface Owner {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    _count: {
        employees: number;
        shops: number;
    }
}

export default function OwnersList() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchOwners = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/owners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOwners(data.owners || []);
                setFilteredOwners(data.owners || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredOwners(owners);
        } else {
            const lowerSearch = search.toLowerCase();
            setFilteredOwners(owners.filter(o =>
                o.name.toLowerCase().includes(lowerSearch) ||
                o.email.toLowerCase().includes(lowerSearch)
            ));
        }
    }, [search, owners]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOwners();
    };

    const renderItem = ({ item }: { item: Owner }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/(admin)/owner/${item.id}` as any)}>
            <View style={styles.cardContent}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{item._count.employees} Employees</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.stat}>{item._count.shops} Shops</Text>
                    </View>
                </View>
                <View style={styles.rightSide}>
                    <View style={[styles.statusBadge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={[styles.statusText, item.isActive ? styles.textActive : styles.textInactive]}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Manage Owners' }} />

            <View style={styles.searchContainer}>
                <Search size={20} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search owners..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filteredOwners}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No owners found.</Text>}
            />

            <Link href="/(admin)/add-owner" asChild>
                <TouchableOpacity style={styles.fab}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    rightSide: {
        alignItems: 'flex-end',
        gap: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        fontSize: 12,
        color: '#94a3b8',
    },
    dot: {
        fontSize: 12,
        color: '#94a3b8',
        marginHorizontal: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeActive: { backgroundColor: '#dcfce7' },
    badgeInactive: { backgroundColor: '#f1f5f9' },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    textActive: { color: '#16a34a' },
    textInactive: { color: '#64748b' },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#94a3b8',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    }
});

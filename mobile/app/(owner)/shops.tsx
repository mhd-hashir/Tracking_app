
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, View, Text } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Link, useRouter } from 'expo-router';
import { MapPin, Search, Plus } from 'lucide-react-native';

interface Shop {
    id: string;
    name: string;
    address: string | null;
    dueAmount: number;
}

export default function OwnerShopsScreen() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchShops = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            if (!token) return;

            const response = await fetch(`${API_URL}/owner/shops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setShops(data.shops || []);
                setFilteredShops(data.shops || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchShops();
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text) {
            const filtered = shops.filter(shop =>
                shop.name.toLowerCase().includes(text.toLowerCase()) ||
                (shop.address && shop.address.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredShops(filtered);
        } else {
            setFilteredShops(shops);
        }
    };

    const renderItem = ({ item }: { item: Shop }) => (
        <Link href={{ pathname: "/(owner)/edit-shop", params: { id: item.id, shop: JSON.stringify(item) } }} asChild>
            <TouchableOpacity style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.address && (
                            <View style={styles.addressRow}>
                                <MapPin size={14} color="#666" />
                                <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.amount}>
                        <Text style={styles.amountLabel}>Due</Text>
                        <Text style={[styles.amountValue, item.dueAmount > 0 ? styles.red : styles.green]}>
                            ₹{item.dueAmount.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Shops</Text>
                <Link href="/(owner)/add-shop" asChild>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </Link>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search shops..."
                    value={search}
                    onChangeText={handleSearch}
                    placeholderTextColor="#999"
                />
            </View>

            <FlatList
                data={filteredShops}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No shops added yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 50, // Safe Area
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginRight: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    address: {
        fontSize: 14,
        color: '#64748b',
    },
    amount: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    red: { color: '#dc2626' },
    green: { color: '#16a34a' },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#94a3b8',
        fontSize: 16,
    }
});

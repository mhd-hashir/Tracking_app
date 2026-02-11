
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, View, Text, Linking, Platform } from 'react-native';
import { Stack, Link } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { User, Plus, Phone, Mail } from 'lucide-react-native';

interface Employee {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
    role: string;
}

export default function EmployeeListScreen() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEmployees = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEmployees();
    };

    const handleCall = (mobile: string) => {
        Linking.openURL(`tel:${mobile}`);
    };

    const renderItem = ({ item }: { item: Employee }) => (
        <Link href={{ pathname: "/(owner)/edit-employee", params: { id: item.id, employee: JSON.stringify(item) } }} asChild>
            <TouchableOpacity style={styles.card}>
                <View style={styles.iconContainer}>
                    <User size={24} color="#64748b" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.detailRow}>
                        <Mail size={12} color="#94a3b8" />
                        <Text style={styles.detailText}>{item.email}</Text>
                    </View>
                    {item.mobile && (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleCall(item.mobile!); }} style={styles.detailRow}>
                            <Phone size={12} color="#4f46e5" />
                            <Text style={[styles.detailText, { color: '#4f46e5' }]}>{item.mobile}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Employees' }} />
            <View style={styles.header}>
                <Text style={styles.title}>Team Members</Text>
                <Link href="/(owner)/add-employee" asChild>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </Link>
            </View>

            <FlatList
                data={employees}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No employees added yet.</Text>
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
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    detailText: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#94a3b8',
    }
});

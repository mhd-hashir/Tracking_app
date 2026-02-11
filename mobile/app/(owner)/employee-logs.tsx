
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Clock, MapPin } from 'lucide-react-native';

interface DutyLog {
    id: string;
    status: string;
    timestamp: string;
    latitude: number | null;
    longitude: number | null;
}

export default function EmployeeLogsScreen() {
    const { id } = useLocalSearchParams();
    const [logs, setLogs] = useState<DutyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/employees/${id}/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: DutyLog }) => {
        const date = new Date(item.timestamp);
        const isOn = item.status === 'ON';

        return (
            <View style={styles.card}>
                <View style={[styles.statusIndicator, isOn ? styles.statusOn : styles.statusOff]} />
                <View style={styles.info}>
                    <Text style={styles.statusText}>
                        Punched {isOn ? 'In' : 'Out'}
                    </Text>
                    <View style={styles.metaRow}>
                        <Clock size={12} color="#64748b" />
                        <Text style={styles.metaText}>
                            {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </Text>
                    </View>
                    {(item.latitude && item.longitude) && (
                        <View style={styles.metaRow}>
                            <MapPin size={12} color="#64748b" />
                            <Text style={styles.metaText}>
                                {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Duty History' }} />

            {loading ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No logs found.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 16,
    },
    statusOn: { backgroundColor: '#22c55e' },
    statusOff: { backgroundColor: '#ef4444' },
    info: { flex: 1 },
    statusText: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    metaText: { fontSize: 12, color: '#64748b' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});


import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { FileText, AlertTriangle, AlertCircle, Info } from 'lucide-react-native';

export default function SystemLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/system/logs?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    const getIcon = (level: string) => {
        switch (level) {
            case 'ERROR': return <AlertCircle size={20} color="#ef4444" />;
            case 'WARN': return <AlertTriangle size={20} color="#f59e0b" />;
            default: return <Info size={20} color="#3b82f6" />;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.logCard}>
            <View style={styles.logHeader}>
                <View style={styles.levelBadge}>
                    {getIcon(item.level)}
                    <Text style={[styles.levelText, { color: item.level === 'ERROR' ? '#ef4444' : item.level === 'WARN' ? '#f59e0b' : '#3b82f6' }]}>
                        {item.level}
                    </Text>
                </View>
                <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
            {item.userId && <Text style={styles.userId}>User: {item.userId}</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'System Logs' }} />
            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No logs found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    list: {
        padding: 16,
    },
    logCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    timestamp: {
        fontSize: 11,
        color: '#94a3b8',
    },
    message: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    userId: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 32,
    }
});

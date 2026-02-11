
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Send, Radio } from 'lucide-react-native';

export default function Broadcasts() {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBroadcasts = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/system/broadcasts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setBroadcasts(data.broadcasts);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleSend = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSending(true);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/admin/system/broadcasts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, message })
            });

            if (response.ok) {
                Alert.alert('Success', 'Broadcast sent successfully');
                setTitle('');
                setMessage('');
                fetchBroadcasts();
            } else {
                Alert.alert('Error', 'Failed to send broadcast');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>Active</Text>
                </View>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Broadcast Notifications' }} />
            
            <View style={styles.form}>
                <Text style={styles.sectionTitle}>New Broadcast</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Message"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={3}
                />
                <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleSend}
                    disabled={sending}
                >
                    {sending ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Send size={20} color="#fff" />
                            <Text style={styles.sendButtonText}>Send Notification</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Active Broadcasts</Text>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#4f46e5" />
                ) : (
                    <FlatList
                        data={broadcasts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No active broadcasts</Text>}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    form: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: '#4f46e5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
        padding: 20,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    activeBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    activeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    cardMessage: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8,
        lineHeight: 20,
    },
    cardDate: {
        fontSize: 11,
        color: '#94a3b8',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
    }
});

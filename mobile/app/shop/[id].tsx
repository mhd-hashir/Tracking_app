
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { MapPin, Phone, Navigation, DollarSign, CheckCircle, AlertCircle } from 'lucide-react-native';

interface ShopDetail {
    id: string;
    name: string;
    address: string | null;
    mobile: string | null;
    dueAmount: number;
    latitude: number | null;
    longitude: number | null;
}

export default function ShopDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Collection Form State
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH'); // CASH, UPI, CHECK
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchShopDetails();
    }, [id]);

    const fetchShopDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/employee/shops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.shops) {
                const found = data.shops.find((s: ShopDetail) => s.id === id);
                if (found) setShop(found);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load shop details');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = () => {
        if (!shop?.latitude || !shop?.longitude) {
            Alert.alert('No Location', 'This shop does not have GPS coordinates.');
            return;
        }
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${shop.latitude},${shop.longitude}`;
        const label = shop.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) Linking.openURL(url);
    };

    const handleSubmit = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        setSubmitting(true);
        try {
            // Get current location for verification
            let location = await Location.getCurrentPositionAsync({});
            const token = await SecureStore.getItemAsync('session_token');

            const response = await fetch(`${API_URL}/employee/collection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shopId: id,
                    amount: parseFloat(amount),
                    paymentMode,
                    remarks,
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Collection recorded successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.error || 'Failed to submit');
            }
        } catch (error: any) {
            Alert.alert('Submission Failed', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4f46e5" />;
    if (!shop) return <Text style={{ padding: 20 }}>Shop not found</Text>;

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: shop.name }} />

            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    {shop.dueAmount > 0 ? (
                        <View style={styles.dueBadge}>
                            <Text style={styles.dueText}>Due: ₹{shop.dueAmount}</Text>
                        </View>
                    ) : (
                        <View style={[styles.dueBadge, { backgroundColor: '#dcfce7' }]}>
                            <Text style={[styles.dueText, { color: '#16a34a' }]}>Paid</Text>
                        </View>
                    )}
                </View>

                {shop.address && (
                    <View style={styles.infoRow}>
                        <MapPin size={16} color="#64748b" />
                        <Text style={styles.infoText}>{shop.address}</Text>
                    </View>
                )}
                {shop.mobile && (
                    <View style={styles.infoRow}>
                        <Phone size={16} color="#64748b" />
                        <Text style={styles.infoText}>{shop.mobile}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
                    <Navigation size={20} color="#fff" />
                    <Text style={styles.navButtonText}>Navigate to Shop</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Record Collection / Visit</Text>

                <Text style={styles.label}>Amount collected (₹)</Text>
                <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#94a3b8" style={{ marginLeft: 10 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <Text style={styles.label}>Payment Mode</Text>
                <View style={styles.modeRow}>
                    {['CASH', 'UPI', 'CHECK'].map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.modeChip, paymentMode === mode && styles.modeActive]}
                            onPress={() => setPaymentMode(mode)}
                        >
                            <Text style={[styles.modeText, paymentMode === mode && styles.modeTextActive]}>{mode}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Remarks (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Notes about visit..."
                    multiline
                    numberOfLines={3}
                    value={remarks}
                    onChangeText={setRemarks}
                />

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <CheckCircle size={20} color="#fff" />
                            <Text style={styles.submitText}>Submit Collection</Text>
                        </>
                    )}
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
    card: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    dueBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dueText: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    infoText: {
        color: '#64748b',
        fontSize: 14,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5',
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        gap: 8,
    },
    navButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    formCard: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    modeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    modeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    modeActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    modeText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 12,
    },
    modeTextActive: {
        color: '#fff',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 10,
    },
    disabledButton: { opacity: 0.7 },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Calendar, Filter, FileText, Download } from 'lucide-react-native';

export default function DataScreen() {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [shops, setShops] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [selectedShop, setSelectedShop] = useState('ALL');
    const [selectedEmployee, setSelectedEmployee] = useState('ALL');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');

    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        fetchOptions();
        const date = new Date();
        setStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }, []);

    const fetchOptions = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const [shopsRes, empsRes] = await Promise.all([
                fetch(`${API_URL}/owner/shops`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/owner/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (shopsRes.ok) {
                const data = await shopsRes.json();
                setShops(data.shops || []);
            }
            if (empsRes.ok) {
                const data = await empsRes.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setReport(null);
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const response = await fetch(`${API_URL}/owner/data/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    shopId: selectedShop,
                    employeeId: selectedEmployee,
                    paymentMode: selectedPaymentMode
                })
            });

            const data = await response.json();
            if (response.ok) {
                setReport(data);
            } else {
                Alert.alert('Error', data.error || 'Failed to generate report');
            }
        } catch (error) {
            Alert.alert('Error', 'Network request failed');
        } finally {
            setGenerating(false);
        }
    };

    const formatDate = (date: Date) => date.toLocaleDateString();

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ headerTitle: 'Reports & Data' }} />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Filters</Text>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>From Date</Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateInput}>
                            <Calendar size={16} color="#666" />
                            <Text>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(e, date) => {
                                    setShowStartPicker(Platform.OS === 'ios');
                                    if (date) setStartDate(date);
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>To Date</Text>
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateInput}>
                            <Calendar size={16} color="#666" />
                            <Text>{formatDate(endDate)}</Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(e, date) => {
                                    setShowEndPicker(Platform.OS === 'ios');
                                    if (date) setEndDate(date);
                                }}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Shop</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedShop}
                            onValueChange={(itemValue) => setSelectedShop(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Shops" value="ALL" />
                            {shops.map(shop => (
                                <Picker.Item key={shop.id} label={shop.name} value={shop.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Employee</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedEmployee}
                            onValueChange={(itemValue) => setSelectedEmployee(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Employees" value="ALL" />
                            {employees.map(emp => (
                                <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Payment Mode</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedPaymentMode}
                            onValueChange={(itemValue) => setSelectedPaymentMode(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Modes" value="ALL" />
                            <Picker.Item label="Cash" value="CASH" />
                            <Picker.Item label="UPI" value="UPI" />
                            <Picker.Item label="Check" value="CHECK" />
                            <Picker.Item label="Bank Transfer" value="BANK_TRANSFER" />
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity style={styles.genButton} onPress={handleGenerate} disabled={generating}>
                    {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.genBtnText}>Generate Report</Text>}
                </TouchableOpacity>
            </View>

            {report && (
                <View style={{ paddingBottom: 40 }}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}>
                            <Text style={[styles.statLabel, { color: '#16a34a' }]}>Collected</Text>
                            <Text style={[styles.statValue, { color: '#15803d' }]}>₹{report.summary.totalCollected}</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                            <Text style={[styles.statLabel, { color: '#2563eb' }]}>Transactions</Text>
                            <Text style={[styles.statValue, { color: '#1d4ed8' }]}>{report.summary.transactionCount}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Transactions</Text>
                    {report.data.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>No records found.</Text>
                    ) : (
                        report.data.map((item: any) => (
                            <View key={item.id} style={styles.txnCard}>
                                <View style={styles.txnHeader}>
                                    <View>
                                        <Text style={styles.txnShop}>{item.shopName}</Text>
                                        <Text style={styles.txnBy}>By: {item.collectedBy}</Text>
                                    </View>
                                    <Text style={styles.txnAmount}>₹{item.amount}</Text>
                                </View>
                                <View style={styles.txnRow}>
                                    <Text style={styles.txnText}>{item.date} {item.time}</Text>
                                    <Text style={styles.txnMode}>{item.paymentMode}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    col: { flex: 1 },
    label: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '600' },
    dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e2e8f0', padding: 10, borderRadius: 8, backgroundColor: '#f8fafc' },
    inputGroup: { marginBottom: 12 },
    pickerContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc', overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    genButton: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 5 },
    genBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: 'bold' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#334155' },
    txnCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#4f46e5', shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
    txnHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
    txnShop: { fontWeight: 'bold', fontSize: 16, color: '#1e293b', marginBottom: 2 },
    txnAmount: { fontWeight: 'bold', fontSize: 18, color: '#16a34a' },
    txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    txnText: { fontSize: 12, color: '#64748b' },
    txnMode: { fontSize: 11, fontWeight: '700', color: '#4f46e5', backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
    txnBy: { fontSize: 12, color: '#64748b' }
});

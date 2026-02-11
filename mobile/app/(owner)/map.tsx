
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack } from 'expo-router';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { RefreshCcw } from 'lucide-react-native';

interface EmployeeLocation {
    id: string;
    name: string;
    email: string;
    isOnDuty: boolean;
    lastLatitude: number | null;
    lastLongitude: number | null;
    lastLocationUpdate: string | null;
}

export default function OwnerMapScreen() {
    const [employees, setEmployees] = useState<EmployeeLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);
    const [mapReady, setMapReady] = useState(false);

    const fetchEmployees = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            if (!token) return;

            const response = await fetch(`${API_URL}/owner/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(data.employees);
                if (mapReady) {
                    updateMapMarkers(data.employees);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        const interval = setInterval(fetchEmployees, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const updateMapMarkers = (data: EmployeeLocation[]) => {
        if (webViewRef.current) {
            const markers = data
                .filter(e => e.lastLatitude && e.lastLongitude)
                .map(e => ({
                    lat: e.lastLatitude,
                    lng: e.lastLongitude,
                    title: e.name,
                    status: e.isOnDuty ? 'On Duty' : 'Off Duty',
                    time: e.lastLocationUpdate ? new Date(e.lastLocationUpdate).toLocaleTimeString() : ''
                }));

            webViewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_MARKERS', markers }));
        }
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_READY') {
                setMapReady(true);
                updateMapMarkers(employees);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var markers = [];

            // Fix Leaflet icons
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Signal Ready
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
            }

            window.addEventListener('message', function(event) {
                try {
                    var data = JSON.parse(event.data);
                    if (data.type === 'UPDATE_MARKERS') {
                        // Clear old markers
                        markers.forEach(m => map.removeLayer(m));
                        markers = [];

                        var bounds = L.latLngBounds();
                        var hasMarkers = false;

                        data.markers.forEach(m => {
                            var color = m.status === 'On Duty' ? 'green' : 'grey';
                            var marker = L.marker([m.lat, m.lng])
                                .bindPopup("<b>" + m.title + "</b><br>" + m.status + "<br>Updated: " + m.time)
                                .addTo(map);
                            markers.push(marker);
                            bounds.extend([m.lat, m.lng]);
                            hasMarkers = true;
                        });

                        if (hasMarkers) {
                            map.fitBounds(bounds, { padding: [50, 50] });
                        }
                    }
                } catch (e) {
                    console.error('WebView JS Error:', e);
                }
            });
        </script>
    </body>
    </html>
    `;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: 'Live Tracking',
                headerRight: () => (
                    <TouchableOpacity onPress={() => { setLoading(true); fetchEmployees(); }} style={{ marginRight: 10 }}>
                        <RefreshCcw size={20} color="#4f46e5" />
                    </TouchableOpacity>
                )
            }} />

            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={styles.map}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />

            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={styles.loadingText}>Updating locations...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 20,
        left: '30%',
        right: '30%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingText: {
        fontSize: 12,
        color: '#4f46e5',
        fontWeight: '600',
    }
});

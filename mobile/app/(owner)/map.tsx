
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useAuth, API_URL } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { User, MapPin } from 'lucide-react-native';

export default function LiveMapScreen() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);
    const [mapReady, setMapReady] = useState(false);

    const fetchLocations = async () => {
        try {
            const token = await SecureStore.getItemAsync('session_token');
            const res = await fetch(`${API_URL}/mobile/owner/live`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                // data contains: employees, shops, historyPaths, collections
                const emps = data.employees || [];
                const shopList = data.shops || [];

                setEmployees(emps);
                setShops(shopList);

                // We can also store history and collections if we want to display them in a list
                // For now, we pass everything to the map

                updateMapElements(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const updateMapElements = (data: any) => {
        if (!mapReady || !webViewRef.current) return;

        const { employees, shops, historyPaths, collections } = data;

        const empMarkers = employees
            .filter((e: any) => e.lastLatitude && e.lastLongitude)
            .map((e: any) => ({
                id: `emp-${e.id}`,
                lat: e.lastLatitude,
                lng: e.lastLongitude,
                title: e.name,
                status: e.isOnDuty ? 'On Duty' : 'Off Duty',
                type: 'employee',
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' // default on duty
            }));

        const shopMarkers = shops
            .filter((s: any) => s.latitude && s.longitude)
            .map((s: any) => ({
                id: `shop-${s.id}`,
                lat: s.latitude,
                lng: s.longitude,
                title: s.name,
                status: s.address,
                type: 'shop',
                due: s.dueAmount
            }));

        // Format collections for map
        const collectionMarkers = collections.map((c: any) => ({
            id: `col-${c.id}`,
            lat: c.shop.latitude, // Assuming we want to show where it happened (shop path usually)
            lng: c.shop.longitude,
            title: `Collection: ₹${c.amount}`,
            status: `By ${c.employee.name} at ${new Date(c.collectedAt).toLocaleTimeString()}`,
            type: 'collection'
        }));

        const payload = {
            markers: [...empMarkers, ...shopMarkers],
            paths: historyPaths, // Object { empId: [{lat, lng}, ...] }
            collections: collections
        };

        const script = `
            if (window.updateMap) {
                window.updateMap(${JSON.stringify(payload)});
            }
        `;
        webViewRef.current.injectJavaScript(script);
    };

    const handleWebViewMessage = (event: any) => {
        const message = event.nativeEvent.data;
        if (message === 'MAP_READY') {
            setMapReady(true);
            // Reconstruct payload from current state if needed, or just fetch again? 
            // Fetching again is safer to ensure sync.
            fetchLocations();
        }
    };

    // HTML Content for Leaflet Map
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
                var map = L.map('map').setView([11.2588, 75.7804], 13); // Default to Calicut
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                var pathsLayer = L.layerGroup().addTo(map);
                var markersLayer = L.layerGroup().addTo(map);

                // Custom Icons
                var onDutyIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });

                var offDutyIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });

                var shopIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });

                window.updateMap = function(payload) {
                    markersLayer.clearLayers();
                    pathsLayer.clearLayers();

                    var bounds = L.latLngBounds();

                    // Draw Paths
                    if (payload.paths) {
                        for (var empId in payload.paths) {
                            var path = payload.paths[empId];
                            if (path && path.length > 0) {
                                var latlngs = path.map(p => [p.latitude, p.longitude]);
                                L.polyline(latlngs, {color: 'blue', weight: 3, opacity: 0.6}).addTo(pathsLayer);
                            }
                        }
                    }

                    // Draw Markers
                    payload.markers.forEach(function(item) {
                        var icon;
                        var popupContent = '<b>' + item.title + '</b><br>' + item.status;

                        if (item.type === 'shop') {
                            icon = shopIcon;
                            if (item.due > 0) {
                                popupContent += '<br><span style="color:red">Due: ₹' + item.due + '</span>';
                            }
                        } else {
                            icon = item.status === 'On Duty' ? onDutyIcon : offDutyIcon;
                        }

                        var marker = L.marker([item.lat, item.lng], {icon: icon})
                            .bindPopup(popupContent);
                        
                        marker.addTo(markersLayer);
                        bounds.extend([item.lat, item.lng]);
                    });

                    if (payload.markers.length > 0) {
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                };

                // Signal ready
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('MAP_READY');
                }
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Live Map' }} />

            {/* Status Overlay */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusTitle}>Employee Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusList}>
                    {employees.map(emp => (
                        <View key={emp.id} style={[styles.statusChip, emp.isOnDuty ? styles.onDuty : styles.offDuty]}>
                            <View style={[styles.dot, { backgroundColor: emp.isOnDuty ? '#22c55e' : '#94a3b8' }]} />
                            <Text style={styles.statusName}>{emp.name}</Text>
                        </View>
                    ))}
                    {employees.length === 0 && <Text style={{ color: '#999', fontSize: 12 }}>No employees found</Text>}
                </ScrollView>
            </View>

            <View style={styles.mapContainer}>
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
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    statusContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        height: 80, // Fixed height
    },
    statusTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
    statusList: { flexDirection: 'row' },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    onDuty: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' },
    offDuty: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusName: { fontSize: 12, fontWeight: '600', color: '#334155' },
    mapContainer: { flex: 1, position: 'relative' },
    map: { flex: 1 },
    loader: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 }
});


import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, MapPin, Check } from 'lucide-react-native';

interface LocationPickerProps {
    visible: boolean;
    initialLocation?: { lat: number; lng: number } | null;
    onSelect: (location: { lat: number; lng: number }) => void;
    onClose: () => void;
}

export default function LocationPicker({ visible, initialLocation, onSelect, onClose }: LocationPickerProps) {
    const webViewRef = useRef<WebView>(null);
    const [center, setCenter] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
    const [loading, setLoading] = useState(true);

    const defaultLat = initialLocation?.lat || 11.2588; // Calicut
    const defaultLng = initialLocation?.lng || 75.7804;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
                .center-marker {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 30px;
                    height: 30px;
                    margin-left: -15px;
                    margin-top: -30px;
                    z-index: 1000;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <!-- Custom Center Marker Overlay -->
            <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png" class="center-marker" />
            
            <script>
                var map = L.map('map').setView([${defaultLat}, ${defaultLng}], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Notify React Native about center change
                function sendCenter() {
                    var center = map.getCenter();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        lat: center.lat,
                        lng: center.lng
                    }));
                }

                map.on('moveend', sendCenter);
                
                // Initial send
                setTimeout(sendCenter, 1000);
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.lat && data.lng) {
                setCenter(data);
            }
        } catch (e) {
            // ignore
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pick Location</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    <WebView
                        ref={webViewRef}
                        source={{ html }}
                        style={styles.map}
                        onMessage={handleMessage}
                        onLoad={() => setLoading(false)}
                    />
                    {/* Static Center Marker for visual clarity (though HTML has one too) */}
                    {/* <View style={styles.markerOverlay}>
                        <MapPin size={40} color="#ef4444" fill="#ef4444" />
                    </View> */}

                    {loading && (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#4f46e5" />
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.coords}>
                        {center ? `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}` : 'Move map to select'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.confirmBtn, !center && styles.disabled]}
                        onPress={() => center && onSelect(center)}
                        disabled={!center}
                    >
                        <Check size={20} color="#fff" />
                        <Text style={styles.confirmText}>Confirm Location</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    mapContainer: { flex: 1, position: 'relative' },
    map: { flex: 1 },
    loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
    coords: { textAlign: 'center', color: '#666', marginBottom: 16, fontSize: 12 },
    confirmBtn: { flexDirection: 'row', backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    disabled: { opacity: 0.5 }
});

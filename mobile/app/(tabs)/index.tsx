
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, FlatList, Linking, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { View } from 'react-native';
import * as Location from 'expo-location';
import { useAuth, API_URL } from '../../context/AuthContext';
import { LOCATION_TASK_NAME } from '../../services/LocationTask';
import { MapPin, Briefcase, LocateFixed, Route as RouteIcon, ChevronRight, Phone } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Link } from 'expo-router';

// ... Interface Update
interface RouteStop {
  id: string;
  order: string;
  shop: {
    id: string;
    name: string;
    address: string | null;
    dueAmount: number;
    latitude: number | null;
    longitude: number | null;
    mobile?: string;
    todayStatus?: {
      collected: boolean;
      remark: boolean;
      edited: boolean;
    };
  }
}

// ... (Inside Component)

{
  route.stops.map((stop, index) => {
    const status = stop.shop.todayStatus || { collected: false, remark: false, edited: false };

    let cardStyle = { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }; // Red (Default)
    if (status.edited) {
      cardStyle = { backgroundColor: '#dbeafe', borderColor: '#93c5fd' }; // Blue
    } else if (status.collected) {
      cardStyle = { backgroundColor: '#dcfce7', borderColor: '#86efac' }; // Green
    } else if (status.remark) {
      cardStyle = { backgroundColor: '#fef9c3', borderColor: '#fde047' }; // Yellow
    }

    return (
      <Link key={stop.id} href={`/shop/${stop.shop.id}` as any} asChild>
        <TouchableOpacity style={[styles.stopItem, { backgroundColor: cardStyle.backgroundColor, borderColor: cardStyle.borderColor, borderWidth: 1, borderRadius: 12, marginBottom: 8, paddingHorizontal: 12 }]}>
          <View style={styles.stopIndex}>
            <Text style={styles.stopIndexText}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stopName}>{stop.shop.name}</Text>
            <Text style={styles.stopAddress} numberOfLines={1}>{stop.shop.address || 'No Address'}</Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 10 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#fff' }]}
                onPress={() => {
                  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                  const latLng = `${stop.shop.latitude},${stop.shop.longitude}`;
                  const label = stop.shop.name;
                  const url = Platform.OS === 'ios'
                    ? `maps:0,0?q=${label}@${latLng}`
                    : `geo:0,0?q=${latLng}(${label})`;

                  Linking.openURL(url);
                }}
              >
                <MapPin size={14} color="#2563eb" />
                <Text style={[styles.actionBtnText, { color: '#1d4ed8' }]}>Navigate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#fff' }]}
                onPress={() => {
                  if (stop.shop.mobile) Linking.openURL(`tel:${stop.shop.mobile}`);
                  else Alert.alert('Check Info', 'No mobile number available for this shop.');
                }}
              >
                <Phone size={14} color="#16a34a" />
                <Text style={[styles.actionBtnText, { color: '#15803d' }]}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
          {stop.shop.dueAmount > 0 && (
            <Text style={styles.dueAmount}>₹{stop.shop.dueAmount}</Text>
          )}
          <ChevronRight size={16} color="#666" />
        </TouchableOpacity>
      </Link>
    )
  })
}
        </View >
      ) : (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyText}>No route assigned for today.</Text>
  </View>
)}

<View style={[styles.card, { marginTop: 20 }]}>
  <View style={styles.statusHeader}>
    <LocateFixed size={24} color="#4f46e5" />
    <Text style={styles.cardTitle}>Location Status</Text>
  </View>
  <Text style={styles.infoText}>
    Permission: {permissionStatus}
  </Text>
  {currentLocation && (
    <View style={styles.locationInfo}>
      <Text style={styles.coordText}>Lat: {currentLocation.coords.latitude.toFixed(4)}</Text>
      <Text style={styles.coordText}>Lng: {currentLocation.coords.longitude.toFixed(4)}</Text>
    </View>
  )}
</View>

    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: '#dc2626', // Red consistent with owner (FF3B30 similar to dc2626)
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#334155',
  },
  statusContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  badgeInactive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  textActive: { color: '#15803d' },
  textInactive: { color: '#475569' },
  toggleButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.7 },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoText: {
    color: '#475569',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
  },
  coordText: {
    color: '#334155',
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    color: '#334155',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
    color: '#334155',
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  stopIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  stopAddress: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginRight: 8,
  },
  emptyCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94a3b8',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

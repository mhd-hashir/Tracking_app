
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Text } from '@/components/Themed';
import { View } from 'react-native';
import * as Location from 'expo-location';
import { useAuth, API_URL } from '../../context/AuthContext';
import { LOCATION_TASK_NAME } from '../../services/LocationTask';
import { MapPin, Briefcase, LocateFixed, Route as RouteIcon, ChevronRight } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Link } from 'expo-router';

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
  }
}

interface AssignedRoute {
  id: string;
  name: string;
  stops: RouteStop[];
}

export default function DashboardScreen() {
  const { user, updateUser, signOut } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [isToggling, setIsToggling] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  const [route, setRoute] = useState<AssignedRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  useEffect(() => {
    (async () => {
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setPermissionStatus('denied_foreground');
        // Alert.alert('Permission Denied', 'Allow location access to use tracking features.');
        return;
      }

      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        setPermissionStatus('denied_background');
      } else {
        setPermissionStatus('granted');
        startTracking();
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    })();
  }, []);

  useEffect(() => {
    fetchAssignedRoute();
  }, []);

  const fetchAssignedRoute = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/employee/routes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.routes && data.routes.length > 0) {
        // Just take the first assigned route for now
        setRoute(data.routes[0]);
      }
    } catch (error) {
      console.error("Failed to fetch route", error);
    } finally {
      setLoadingRoute(false);
    }
  };

  const startTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          deferredUpdatesInterval: 10000,
          foregroundService: {
            notificationTitle: "FieldTrack Active",
            notificationBody: "Tracking your location for work.",
          }
        });
      }
    } catch (e) {
      console.error("Failed to start tracking", e);
    }
  };

  const toggleDuty = async () => {
    if (!user) return;
    setIsToggling(true);
    const newStatus = !user.isOnDuty;

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const { coords } = currentLocation || await Location.getCurrentPositionAsync({});

      const response = await fetch(`${API_URL}/duty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isOnDuty: newStatus,
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      updateUser({ isOnDuty: data.isOnDuty });

      if (data.isOnDuty) {
        startTracking();
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <Briefcase size={24} color="#4f46e5" />
          <Text style={styles.cardTitle}>Duty Status</Text>
        </View>

        <View style={styles.statusContent}>
          <View style={[styles.statusBadge, user?.isOnDuty ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.statusText, user?.isOnDuty ? styles.textActive : styles.textInactive]}>
              {user?.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.toggleButton, isToggling && styles.disabledButton]}
            onPress={toggleDuty}
            disabled={isToggling}
          >
            {isToggling ? <ActivityIndicator color="#fff" /> :
              <Text style={styles.toggleText}>
                {user?.isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
              </Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Section */}
      <Text style={styles.sectionTitle}>Today's Route</Text>
      {loadingRoute ? (
        <ActivityIndicator color="#4f46e5" style={{ margin: 20 }} />
      ) : route ? (
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <RouteIcon size={20} color="#4f46e5" />
            <Text style={styles.routeName}>{route.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{route.stops.length} Stops</Text>
            </View>
          </View>

          {route.stops.map((stop, index) => (
            <Link key={stop.id} href={`/shop/${stop.shop.id}`} asChild>
              <TouchableOpacity style={styles.stopItem}>
                <View style={styles.stopIndex}>
                  <Text style={styles.stopIndexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stopName}>{stop.shop.name}</Text>
                  <Text style={styles.stopAddress} numberOfLines={1}>{stop.shop.address || 'No Address'}</Text>
                </View>
                {stop.shop.dueAmount > 0 && (
                  <Text style={styles.dueAmount}>₹{stop.shop.dueAmount}</Text>
                )}
                <ChevronRight size={16} color="#ccc" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
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

    </ScrollView>
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
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
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
  }
});


import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LayoutDashboard, Map, ShoppingBag, Route as RouteIcon, Users, FileText } from 'lucide-react-native';

function TabBarIcon(props: {
    icon: any;
    color: string;
}) {
    const Icon = props.icon;
    return <Icon size={28} color={props.color} style={{ marginBottom: -3 }} />;
}

export default function OwnerLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#94a3b8',
                headerShown: true, // Show top bar for all screens
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#1e293b',
                },
                tabBarStyle: {
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10,
                }
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={LayoutDashboard} color={color} />,
                    headerTitle: 'Dashboard',
                }}
            />
            <Tabs.Screen
                name="shops"
                options={{
                    title: 'Shops',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={ShoppingBag} color={color} />,
                    headerTitle: 'Manage Shops',
                }}
            />
            <Tabs.Screen
                name="routes"
                options={{
                    title: 'Routes',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={RouteIcon} color={color} />,
                    headerTitle: 'Manage Routes',
                }}
            />
            <Tabs.Screen
                name="employees"
                options={{
                    title: 'Employees',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={Users} color={color} />,
                    headerTitle: 'Manage Employees',
                }}
            />
            <Tabs.Screen
                name="data"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={FileText} color={color} />,
                    headerTitle: 'Reports & Data',
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Live Map',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={Map} color={color} />,
                    headerTitle: 'Live Tracking',
                }}
            />

            {/* HiddenScreens */}
            <Tabs.Screen name="add-shop" options={{ href: null, title: 'Add New Shop' }} />
            <Tabs.Screen name="add-route" options={{ href: null, title: 'Create Route' }} />
            <Tabs.Screen name="add-employee" options={{ href: null, title: 'Add Employee' }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
        </Tabs>
    );
}

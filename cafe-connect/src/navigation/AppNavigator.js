import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../components/Colors';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';
import AllCafesScreen from '../screens/AllCafesScreen';
import SearchScreen from '../screens/SearchScreen';
import RewardsScreen from '../screens/RewardsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import MyCafeScreen from '../screens/MyCafeScreen';
import ManageProductsScreen from '../screens/ManageProductsScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminModerationScreen from '../screens/AdminModerationScreen';
import AdminNotificationsScreen from '../screens/AdminNotificationsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import SpinWheelScreen from '../screens/SpinWheelScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: Colors.border, height: 65, paddingBottom: 10 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: 'System', fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const icons = { 'الرئيسية': 'home', 'مكافآتي': 'star', 'QR': 'qr-code', 'حسابي': 'person' };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="الرئيسية" component={UserHomeScreen} />
      <Tab.Screen name="مكافآتي" component={RewardsScreen} />
      <Tab.Screen name="QR" component={QRScannerScreen} />
      <Tab.Screen name="حسابي" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: Colors.border, height: 65, paddingBottom: 10 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = { 'الرئيسية': 'home', 'مقهاي': 'cafe', 'المنتجات': 'restaurant-menu', 'الدولاب': 'refresh-circle' };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="الرئيسية" component={OwnerHomeScreen} />
      <Tab.Screen name="مقهاي" component={MyCafeScreen} />
      <Tab.Screen name="المنتجات" component={ManageProductsScreen} />
      <Tab.Screen name="الدولاب" component={SpinWheelScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: Colors.border, height: 65, paddingBottom: 10 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'لوحة التحكم': 'stats-chart',
            'المستخدمون': 'people',
            'المراجعات': 'checkmark-circle',
            'الإشعارات': 'megaphone',
            'الإعدادات': 'settings',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="لوحة التحكم" component={AdminHomeScreen} />
      <Tab.Screen name="المستخدمون" component={AdminUsersScreen} />
      <Tab.Screen name="المراجعات" component={AdminModerationScreen} />
      <Tab.Screen name="الإشعارات" component={AdminNotificationsScreen} />
      <Tab.Screen name="الإعدادات" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
          </>
        ) : user.role === 'owner' ? (
          <>
            <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
          </>
        ) : (
          <>
            <Stack.Screen name="UserTabs" component={UserTabs} />
            <Stack.Screen name="CafeDetail" component={CafeDetailScreen} />
            <Stack.Screen name="AllCafes" component={AllCafesScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
});

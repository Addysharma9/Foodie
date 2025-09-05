import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, TouchableOpacity } from 'react-native';

// Import your existing screens
import Login from './Login';
import UserDetailsScreen from './Userdetail';
import Homescreen from './HomeScreen';
import Profile from './ProfileScreen';
import OrderPlacementScreen from './OrderPlacementScreen'; 
import MyOrders from './MyOrders';
import NotificationService from './NotificationService';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple Support Screen for now
const SupportScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFC' }}>
    <Text style={{ fontSize: 20, color: '#2C2F36', fontWeight: '700' }}>Support</Text>
    <Text style={{ fontSize: 14, color: '#6C7278', marginTop: 8 }}>Coming Soon</Text>
  </View>
);

// Bottom Tab Navigator with correct screen names
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={Homescreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, color: focused ? '#FF6B35' : '#9CA3AF' }}>
              🏠
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, color: focused ? '#4A90E2' : '#9CA3AF' }}>
              👤
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Support" 
        component={SupportScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, color: focused ? '#F7B731' : '#9CA3AF' }}>
              💬
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MyOrders"  // Changed from "MyOrder" to "MyOrders" to match component
        component={MyOrders}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, color: focused ? '#3B82F6' : '#9CA3AF' }}>
              📦
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    // Initialize meal notifications when app starts
    const initializeNotifications = async () => {
      try {
        await NotificationService.scheduleDailyMealNotifications();
        await NotificationService.getScheduledNotifications();
      } catch (error) {
        console.error('Failed to setup meal notifications:', error);
      }
    };

    initializeNotifications();

    // Setup notification listeners
    const receivedSubscription = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('🔔 Notification received:', notification);
      }
    );

    const responseSubscription = NotificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const mealType = response.notification.request.content.data?.mealType;
        
        if (mealType) {
          // Handle meal type navigation here if needed
        }
      }
    );

    // Cleanup listeners
    return () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      >
        <Stack.Screen
          name="Login" 
          component={Login}
        />
        <Stack.Screen 
          name="UserDetailsScreen" 
          component={UserDetailsScreen}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabNavigator}
        />
        <Stack.Screen 
          name="OrderPlacement" 
          component={OrderPlacementScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeScreen from './HomeScreen';
import CartScreen from './CartScreen';
import ProfileScreen from './ProfileScreen';
const Tab = createBottomTabNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = focused ? '🏠' : '🏡';
            } else if (route.name === 'Cart') {
              iconName = focused ? '🛒' : '🛍️';
            } else if (route.name === 'Profile') {
              iconName = focused ? '👤' : '👤a';
            }
            
            return (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: size }}>{iconName}</Text>
              </View>
            );
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ tabBarBadge: null }}
        />
        <Tab.Screen 
          name="Cart" 
          component={CartScreen}
          options={{ tabBarBadge: 2 }} // Cart item count
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

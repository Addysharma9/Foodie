import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import UserDetailsScreen from './Userdetail';
import Homescreen from './HomeScreen';
import Profile from './ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
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
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="UserDetailsScreen" 
          component={UserDetailsScreen}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={Homescreen}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile}
          options={{
            gestureEnabled: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

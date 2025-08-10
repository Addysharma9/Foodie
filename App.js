import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import UserDetailsScreen from './Userdetail'; // Make sure this exports default

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

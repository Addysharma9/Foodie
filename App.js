import React,{useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import UserDetailsScreen from './Userdetail';
import Homescreen from './HomeScreen';
import Profile from './ProfileScreen';
import OrderPlacementScreen from './OrderPlacementScreen'; 
import MyOrders from './MyOrders'
import NotificationService from './NotificationService';
const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize meal notifications when app starts
    const initializeNotifications = async () => {
      try {
        await NotificationService.scheduleDailyMealNotifications();
        
        // Optional: Log scheduled notifications for debugging
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
        // Handle notification when app is in foreground
      }
    );

    const responseSubscription = NotificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const mealType = response.notification.request.content.data?.mealType;
        
        // Navigate to specific meal category or show relevant content
        if (mealType) {
          // Example: Navigate to meal category
          // navigation.navigate('MenuScreen', { category: mealType });
        }
      }
    );

    // Cleanup listeners
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
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
        name="MyOrder"
        component={MyOrders}
        options={{
          gestureEnabled:false
        }}
        />
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
        <Stack.Screen 
          name="OrderPlacement" 
          component={OrderPlacementScreen}
          options={{
            gestureEnabled: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

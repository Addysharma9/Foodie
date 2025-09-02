import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidImportance.HIGH,
  }),
});

class NotificationService {
  // Define meal notification times
  static MEAL_NOTIFICATIONS = [
    {
      id: 'breakfast',
      title: 'Breakfast Time 🍳',
      body: 'Start your day with a delicious breakfast!',
      hour: 8,
      minute: 0,
    },
    {
      id: 'brunch',
      title: 'Brunch Time 🥞',
      body: 'Perfect time for brunch!',
      hour: 10,
      minute: 30,
    },
    {
      id: 'lunch',
      title: 'Lunch Break 🍽️',
      body: "Don't forget to have your lunch!",
      hour: 13,
      minute: 0,
    },
    {
      id: 'sweets',
      title: 'Sweet Treats 🍰',
      body: 'Time for some sweet treats!',
      hour: 17,
      minute: 27,
    },
    {
      id: 'dinner',
      title: 'Dinner Time 🍝',
      body: 'Dinner is ready to be served!',
      hour: 20,
      minute: 0,
    },
  ];

  // Request notification permissions
  static async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: false,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: false,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  // Setup notification channel for Android
  static async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: 'Meal Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
    }
  }

  // Cancel all existing meal notifications
  static async cancelAllMealNotifications() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Filter meal notifications by identifier prefix
      const mealNotificationIds = scheduledNotifications
        .filter(notif => notif.identifier.startsWith('meal_'))
        .map(notif => notif.identifier);

      // Cancel each meal notification
      await Promise.all(
        mealNotificationIds.map(id => 
          Notifications.cancelScheduledNotificationAsync(id)
        )
      );

      console.log(`🗑️ Cancelled ${mealNotificationIds.length} existing meal notifications`);
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  }

  // Schedule daily meal notifications
  static async scheduleDailyMealNotifications() {
    try {
      console.log('🔔 Setting up daily meal notifications...');

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Setup Android notification channel
      await this.setupNotificationChannel();

      // Cancel existing meal notifications to avoid duplicates
      await this.cancelAllMealNotifications();

      // Schedule each meal notification
      const scheduledIds = [];
      
      for (const meal of this.MEAL_NOTIFICATIONS) {
        try {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: meal.title,
              body: meal.body,
              sound: true,
              priority: Notifications.AndroidImportance.HIGH,
              ...(Platform.OS === 'android' && {
                channelId: 'meal-reminders',
              }),
              data: {
                mealType: meal.id,
                scheduledTime: `${meal.hour}:${meal.minute.toString().padStart(2, '0')}`,
              },
            },
            trigger: {
              type: 'daily', // This is key for daily repetition
              hour: meal.hour,
              minute: meal.minute,
              repeats: true,
            },
            identifier: `meal_${meal.id}`, // Custom identifier for easy management
          });

          scheduledIds.push(notificationId);
          console.log(`✅ Scheduled ${meal.title} for ${meal.hour}:${meal.minute.toString().padStart(2, '0')}`);
        } catch (error) {
          console.error(`❌ Error scheduling ${meal.title}:`, error);
        }
      }

      console.log(`🎯 Successfully scheduled ${scheduledIds.length} daily meal notifications`);
      return scheduledIds;

    } catch (error) {
      console.error('❌ Error setting up meal notifications:', error);
      throw error;
    }
  }

  // Get all scheduled notifications (for debugging)
  static async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const mealNotifications = notifications.filter(notif => 
        notif.identifier.startsWith('meal_')
      );
      
      console.log('📋 Scheduled meal notifications:', mealNotifications.length);
      mealNotifications.forEach(notif => {
        console.log(`  - ${notif.content.title} (${notif.identifier})`);
      });
      
      return mealNotifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification received (when app is in foreground)
  static addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Handle notification response (when user taps notification)
  static addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default NotificationService;

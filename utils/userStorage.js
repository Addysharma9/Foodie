// utils/userStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userStorage = {
  setUserId: async (userId) => {
    try {
      await AsyncStorage.setItem('app_user_id', userId.toString());
    } catch (error) {
      console.error('Error storing user ID:', error);
    }
  },

  getUserId: async () => {
    try {
      const userId = await AsyncStorage.getItem('app_user_id');
      return userId ? parseInt(userId) : null;
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  },

  removeUserId: async () => {
    try {
      await AsyncStorage.removeItem('app_user_id');
    } catch (error) {
      console.error('Error removing user ID:', error);
    }
  },
};

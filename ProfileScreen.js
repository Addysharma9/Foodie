import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App',
      'Thank you for your feedback! This would open the app store rating.',
      [{ text: 'OK' }]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'You can reach us at:\nEmail: support@foodieapp.com\nPhone: +91 9876543210',
      [{ text: 'OK' }]
    );
  };

  const profileOptions = [
    {
      id: '1',
      title: 'My Orders',
      subtitle: 'View your order history',
      icon: '📦',
      onPress: () => console.log('My Orders'),
    },
    {
      id: '2',
      title: 'Favorites',
      subtitle: 'Your favorite food items',
      icon: '❤️',
      onPress: () => console.log('Favorites'),
    },
    {
      id: '3',
      title: 'Addresses',
      subtitle: 'Manage delivery addresses',
      icon: '📍',
      onPress: () => console.log('Addresses'),
    },
    {
      id: '4',
      title: 'Payment Methods',
      subtitle: 'Cards and payment options',
      icon: '💳',
      onPress: () => console.log('Payment Methods'),
    },
    {
      id: '5',
      title: 'Rate App',
      subtitle: 'Help us improve',
      icon: '⭐',
      onPress: handleRateApp,
    },
    {
      id: '6',
      title: 'Contact Support',
      subtitle: 'Get help and support',
      icon: '💬',
      onPress: handleContactSupport,
    },
  ];

  const renderOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={option.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionIcon}>
        <Text style={styles.optionEmoji}>{option.icon}</Text>
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      <Text style={styles.optionArrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>👤</Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@email.com</Text>
          <Text style={styles.userPhone}>+91 9876543210</Text>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map(renderOption)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Foodie App v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    margin: width * 0.05,
    borderRadius: 20,
    padding: width * 0.06,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: Math.min(width * 0.2, 80),
    height: Math.min(width * 0.2, 80),
    borderRadius: Math.min(width * 0.1, 40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: Math.min(width * 0.08, 32),
    color: '#fff',
  },
  userName: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6B7280',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6B7280',
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  editProfileText: {
    color: '#fff',
    fontSize: Math.min(width * 0.037, 15),
    fontWeight: '600',
  },

  // Options
  optionsContainer: {
    paddingHorizontal: width * 0.05,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: Math.min(width * 0.12, 48),
    height: Math.min(width * 0.12, 48),
    borderRadius: 12,
    backgroundColor: '#FF6B35' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: Math.min(width * 0.05, 20),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#6B7280',
  },
  optionArrow: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#9CA3AF',
    fontWeight: 'bold',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.05,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutIcon: {
    fontSize: Math.min(width * 0.05, 20),
    marginRight: 12,
  },
  logoutText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#EF4444',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#9CA3AF',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#9CA3AF',
  },
});

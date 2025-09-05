import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet, 
  width 
} from '../constants/AppConstants';

const BottomTabs = ({ activeTab, cartCount }) => {
  const navigation = useNavigation();
  const [tabAnimations] = useState(
    Array(4).fill(0).map(() => new Animated.Value(1))
  );
  
  const tabs = [
    { id: 'delivery', label: 'Home', icon: '🏠', activeColor: COLORS.primary, onPress: () => navigation.navigate('Home') },
    { id: 'dining', label: 'Profile', icon: '👤', activeColor: COLORS.secondary, onPress: () => navigation.navigate('Profile') },
    { id: 'live', label: 'Support', icon: '💬', activeColor: COLORS.accent, onPress: () => {} },
    { id: 'reorder', label: 'Orders', icon: '📦', activeColor: COLORS.info, onPress: () => navigation.navigate('MyOrders') },
  ];

  const handleTabPress = (tab, index) => {
    Animated.sequence([
      Animated.timing(tabAnimations[index], { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(tabAnimations[index], { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    tab.onPress();
  };

  return (
    <View style={styles.bottomTabsContainer}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.surfaceElevated]}
        style={styles.bottomTabsGradient}
      >
        <View style={styles.bottomTabsContent}>
          {tabs.map((tab, index) => (
            <Animated.View
              key={tab.id}
              style={[
                styles.tabButtonContainer,
                { transform: [{ scale: tabAnimations[index] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.activeTabButton
                ]}
                onPress={() => handleTabPress(tab, index)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconWrapper,
                  activeTab === tab.id && [styles.activeTabIconWrapper, { backgroundColor: tab.activeColor + '20' }]
                ]}>
                  <Text style={[
                    styles.tabIcon,
                    { color: activeTab === tab.id ? tab.activeColor : COLORS.textMuted }
                  ]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? tab.activeColor : COLORS.textMuted }
                ]}>
                  {tab.label}
                </Text>
                {tab.id === 'reorder' && cartCount > 0 && (
                  <View style={[styles.tabNotificationBadge, { backgroundColor: tab.activeColor }]}>
                    <Text style={styles.tabNotificationText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  bottomTabsGradient: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  bottomTabsContent: {
    flexDirection: 'row',
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  tabButtonContainer: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    position: 'relative',
  },
  activeTabButton: {},
  tabIconWrapper: {
    marginBottom: SPACING.xs,
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabIconWrapper: {
    transform: [{ scale: 1.1 }],
  },
  tabIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
  },
  tabLabel: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabNotificationBadge: {
    position: 'absolute',
    top: 2,
    right: width * 0.08,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  tabNotificationText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '800',
  },
});

export default BottomTabs;

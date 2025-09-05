import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet, 
  SCREEN_PADDING 
} from '../constants/AppConstants';

const FloatingCart = ({ cartItems, cartTotal, onPress, onClose, syncing }) => {
  const [slideAnim] = useState(new Animated.Value(120));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  useEffect(() => {
    if (safeCartItems.length > 0) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [safeCartItems.length]);

  if (safeCartItems.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.floatingCartContainer,
        { 
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ] 
        }
      ]}
    >
      <TouchableOpacity
        style={styles.floatingCartCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.floatingCartGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cartLeftContent}>
            <View style={styles.cartItemsIndicator}>
              <Text style={styles.cartItemsIndicatorText}>{safeCartItems.length}</Text>
            </View>
            <View style={styles.cartMainInfo}>
              <Text style={styles.cartItemsMainText}>
                {safeCartItems.length} item{safeCartItems.length > 1 ? 's' : ''} in cart
              </Text>
              <Text style={styles.cartSubText}>
                {syncing ? 'Syncing cart...' : 'Tap to review & checkout'}
              </Text>
            </View>
          </View>

          <View style={styles.cartRightContent}>
            <Text style={styles.cartTotalAmount}>₹{cartTotal}</Text>
            <View style={styles.viewCartButton}>
              <Text style={styles.viewCartText}>VIEW →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cartDismissButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.cartDismissText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingCartContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ?40  : 20,
    left: SCREEN_PADDING,
    right: SCREEN_PADDING,
    zIndex: 1000,
    elevation: 15,
  },
  floatingCartCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  floatingCartGradient: {
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartItemsIndicator: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BORDER_RADIUS.md,
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cartItemsIndicatorText: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '900',
  },
  cartMainInfo: {
    flex: 1,
  },
  cartItemsMainText: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '800',
    marginBottom: 2,
  },
  cartSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '500',
  },
  cartRightContent: {
    alignItems: 'flex-end',
  },
  cartTotalAmount: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '900',
    marginBottom: 2,
  },
  viewCartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  viewCartText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  cartDismissButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cartDismissText: {
    color: COLORS.textSecondary,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '800',
  },
});

export default FloatingCart;

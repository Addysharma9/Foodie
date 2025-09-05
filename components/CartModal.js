import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet, 
  height 
} from '../constants/AppConstants';
import { getImageUrl, formatPrice } from '../utils/helpers';
import { SkeletonCard } from './SkeletonComponents';

const CartModal = ({ 
  visible, 
  cartItems, 
  cartTotal, 
  subtotal,
  deliveryFee,
  appliedCoupon,
  couponDiscount,
  onClose, 
  updateQuantity, 
  clearCart,
  applyCoupon,
  removeCoupon,
  placeOrder,
  loading
}) => {
  const navigation = useNavigation();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handlePlaceOrder = async () => {
    navigation.navigate('OrderPlacement', {
      cartItems: safeCartItems,
      cartTotal: cartTotal,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      couponDiscount: couponDiscount,
      appliedCoupon: appliedCoupon
    });
    onClose();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    const success = await applyCoupon(couponCode.trim());
    if (success) {
      setCouponCode('');
      setShowCouponInput(false);
    }
  };

  const CartItemRow = ({ item }) => {
    const [loaded, setLoaded] = useState(false);
    const uri = getImageUrl(item.featured_image || item.imageUrl);
    
    return (
      <View style={styles.cartItemCard}>
        <View style={styles.cartItemImageSection}>
          {!loaded && <SkeletonCard height={70} borderRadius={BORDER_RADIUS.lg} style={{ width: 70 }} />}
          {uri && (
            <Image
              source={{ uri }}
              style={[styles.cartItemImageStyle, !loaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setLoaded(true)}
            />
          )}
        </View>
        
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemTitle}>{item.name}</Text>
          {item.spice_level && item.spice_level !== 'None' && (
            <View style={styles.spiceLevelChip}>
              <Text style={styles.spiceLevelText}>🌶 {item.spice_level}</Text>
            </View>
          )}
          <Text style={styles.cartItemPriceText}>₹{formatPrice(item.price)}</Text>
        </View>
        
        <View style={styles.cartQuantitySection}>
          <TouchableOpacity
            style={styles.cartQuantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.cartQuantityButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.cartQuantityDisplay}>
            <Text style={styles.cartQuantityDisplayText}>{item.quantity}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartQuantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.cartQuantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.cartModalOverlay}>
      <Animated.View
        style={[
          styles.cartModalContent,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.cartModalHeaderSection}>
          <View style={styles.modalHandle} />
          <View style={styles.cartModalHeaderContent}>
            <Text style={styles.cartModalHeaderTitle}>Your Order</Text>
            <TouchableOpacity onPress={onClose} style={styles.cartModalCloseButton}>
              <Text style={styles.cartModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.cartItemsScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.cartItemsContainer}>
            {safeCartItems.map((item) => (
              <CartItemRow key={`cart-item-${item.id}-${item.cartId}`} item={item} />
            ))}
          </View>
        </ScrollView>

        {/* Enhanced Footer */}
        <View style={styles.cartModalFooterSection}>
          {/* Coupon Section */}
          <View style={styles.couponSectionCard}>
            {!appliedCoupon && !showCouponInput && (
              <TouchableOpacity 
                style={styles.couponApplyButton}
                onPress={() => setShowCouponInput(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.couponApplyIcon}>🎫</Text>
                <Text style={styles.couponApplyText}>Apply Coupon Code</Text>
                <Text style={styles.couponApplyArrow}>→</Text>
              </TouchableOpacity>
            )}
            
            {showCouponInput && !appliedCoupon && (
              <View style={styles.couponInputSection}>
                <TextInput
                  style={styles.couponInputField}
                  placeholder="Enter coupon code"
                  placeholderTextColor={COLORS.textMuted}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  style={styles.couponSubmitButton}
                  onPress={handleApplyCoupon}
                  activeOpacity={0.8}
                >
                  <Text style={styles.couponSubmitText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {appliedCoupon && (
              <View style={styles.appliedCouponCard}>
                <View style={styles.appliedCouponInfo}>
                  <Text style={styles.appliedCouponIcon}>✅</Text>
                  <View style={styles.appliedCouponDetails}>
                    <Text style={styles.appliedCouponTitle}>Coupon Applied</Text>
                    <Text style={styles.appliedCouponCode}>"{appliedCoupon.code}"</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponButton}>
                  <Text style={styles.removeCouponButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bill Summary */}
          <View style={styles.billSummaryCard}>
            <Text style={styles.billSummaryTitle}>Bill Summary</Text>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₹{formatPrice(subtotal)}</Text>
            </View>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{formatPrice(deliveryFee)}</Text>
            </View>
            
            {couponDiscount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: COLORS.success }]}>Coupon Discount</Text>
                <Text style={[styles.billValue, { color: COLORS.success }]}>-₹{formatPrice(couponDiscount)}</Text>
              </View>
            )}
            
            <View style={styles.billDivider} />
            
            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Amount</Text>
              <Text style={styles.billTotalValue}>₹{formatPrice(cartTotal)}</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.cartActionButtons}>
            <TouchableOpacity
              style={styles.clearCartActionButton}
              onPress={() => { clearCart(); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={styles.clearCartActionText}>Clear Cart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.checkoutActionButton, loading && styles.checkoutDisabled]}
              onPress={handlePlaceOrder}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? [COLORS.textMuted, COLORS.textMuted] : [COLORS.primary, COLORS.primaryDark]}
                style={styles.checkoutButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.checkoutActionText}>
                  {loading ? 'Processing...' : 'Place Order'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000,
    elevation: 25,
  },
  cartModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  cartModalHeaderSection: {
    paddingTop: SPACING.md,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  cartModalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartModalHeaderTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cartModalCloseButton: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cartModalCloseText: {
    color: COLORS.textSecondary,
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '800',
  },
  cartItemsScrollView: {
    maxHeight: height * 0.35,
  },
  cartItemsContainer: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cartItemImageSection: {
    marginRight: isTablet ? SPACING.lg : SPACING.md,
  },
  cartItemImageStyle: {
    width: isTablet ? 75 : 70,
    height: isTablet ? 75 : 70,
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: 'cover',
  },
  cartItemDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cartItemTitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  spiceLevelChip: {
    backgroundColor: COLORS.errorLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  spiceLevelText: {
    fontSize: FONTS.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  cartItemPriceText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.primary,
    fontWeight: '800',
  },
  cartQuantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cartQuantityButton: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  cartQuantityButtonText: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cartQuantityDisplay: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: isTablet ? SPACING.md : SPACING.sm,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  cartQuantityDisplayText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cartModalFooterSection: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  // Coupon styles
  couponSectionCard: {
    marginBottom: SPACING.xl,
  },
  couponApplyButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  couponApplyIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.md,
  },
  couponApplyText: {
    color: COLORS.primary,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    flex: 1,
  },
  couponApplyArrow: {
    color: COLORS.primary,
    fontSize: FONTS.base,
    fontWeight: '700',
  },
  couponInputSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  couponInputField: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.lg : SPACING.md,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  couponSubmitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
  },
  couponSubmitText: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '800',
  },
  appliedCouponCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedCouponIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.md,
  },
  appliedCouponDetails: {
    flex: 1,
  },
  appliedCouponTitle: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 2,
  },
  appliedCouponCode: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  removeCouponButton: {
    backgroundColor: COLORS.errorLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  removeCouponButtonText: {
    color: COLORS.error,
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  // Bill Summary
  billSummaryCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    padding: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  billSummaryTitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  billLabel: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  billValue: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  billTotalLabel: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  billTotalValue: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '900',
    color: COLORS.primary,
  },
  // Action Buttons
  cartActionButtons: {
    flexDirection: 'row',
    gap: isTablet ? SPACING.lg : SPACING.md,
  },
  clearCartActionButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  clearCartActionText: {
    color: COLORS.textSecondary,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '800',
  },
  checkoutActionButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  checkoutDisabled: {
    opacity: 0.6,
  },
  checkoutButtonGradient: {
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    alignItems: 'center',
  },
  checkoutActionText: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '900',
  },
});

export default CartModal;

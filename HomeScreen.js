import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  FlatList,
  ScrollView,
  Image,
  RefreshControl,
  Platform,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ImageBackground,
  Easing,
} from 'react-native';
import FloatingGirlAssistant from './Animatedgirl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from './hooks/useCart';

// Enhanced responsive dimensions
const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isLargeScreen = width > 414;

// Professional spacing system
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Professional padding system
const SCREEN_PADDING = width * 0.04;
const CARD_SPACING = width * 0.025;

// Enhanced border radius system
const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  round: 50,
};

// Professional typography scale
const FONT_SCALE = Math.min(width / 375, 1.3);
const FONTS = {
  xs: 11 * FONT_SCALE,
  sm: 13 * FONT_SCALE,
  base: 15 * FONT_SCALE,
  lg: 17 * FONT_SCALE,
  xl: 19 * FONT_SCALE,
  xxl: 22 * FONT_SCALE,
  xxxl: 26 * FONT_SCALE,
  huge: 32 * FONT_SCALE,
};

const baseURL = 'http://212.38.94.189:8000';

// Helper functions
const formatPrice = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('products/') || imagePath.startsWith('categories/')) return `${baseURL}/storage/${imagePath}`;
  if (imagePath.startsWith('/products/') || imagePath.startsWith('/categories/')) return `${baseURL}/storage/${imagePath.slice(1)}`;
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath)) return `${baseURL}/storage/products/${imagePath}`;
  return `${baseURL}/storage/${imagePath}`;
};

// Professional color palette
const COLORS = {
  // Primary brand colors with depth
  primary: '#FF6B35',
  primaryDark: '#E8541C',
  primaryLight: '#FFE8E0',
  primaryUltraLight: '#FFF5F2',
  
  // Enhanced secondary colors
  secondary: '#4A90E2',
  accent: '#F7B731',
  accentLight: '#FEF3CD',
  
  // Sophisticated neutrals
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  surfaceCard: '#FFFFFF',
  
  // Typography hierarchy
  text: '#1A1D29',
  textPrimary: '#2C2F36',
  textSecondary: '#6C7278',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Enhanced borders and dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F1F3F4',
  
  // Professional shadows
  shadow: 'rgba(17, 25, 40, 0.12)',
  shadowDark: 'rgba(17, 25, 40, 0.25)',
  shadowLight: 'rgba(17, 25, 40, 0.06)',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBlur: 'rgba(255, 255, 255, 0.2)',
};

// Address formatting helper
const formatAddress = (address) => {
  if (!address) return 'Select Location';
  if (address.length > 40) {
    return address.substring(0, 37) + '...';
  }
  return address;
};

// Enhanced animated pulse component
const Pulse = ({ style, children }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[{ opacity: pulseAnim }, style]}>
      {children || <View style={[{ backgroundColor: '#F1F3F4', borderRadius: 8 }, style]} />}
    </Animated.View>
  );
};

// Professional skeleton components
const SkeletonLine = ({ height = 14, width = '100%', borderRadius = 6, style }) => (
  <Pulse style={[{ height, width, borderRadius }, style]} />
);

const SkeletonCircle = ({ size = 48, style }) => (
  <Pulse style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />
);

const SkeletonCard = ({ height = 120, borderRadius = 16, style }) => (
  <Pulse style={[{ height, borderRadius, backgroundColor: '#F8F9FA' }, style]} />
);

// Enhanced Address Dropdown Modal
const AddressDropdownModal = ({ visible, addresses, selectedId, onSelect, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.addressModalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.addressDropdown,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.addressDropdownHeader}>
            <Text style={styles.addressDropdownTitle}>Choose Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.addressCloseButton}>
              <Text style={styles.addressCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.addressList} showsVerticalScrollIndicator={false}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressItem,
                  selectedId === address.id && styles.selectedAddressItem
                ]}
                onPress={() => onSelect(address)}
                activeOpacity={0.7}
              >
                <View style={styles.addressItemContent}>
                  <View style={styles.addressTypeContainer}>
                    <View style={styles.addressTypeChip}>
                      <Text style={styles.addressType}>{address.type}</Text>
                    </View>
                    {selectedId === address.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressFullText}>{address.full_address}</Text>
                  <Text style={styles.addressArea}>{address.area}, {address.city}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Enhanced Product Detail Modal
const ProductDetailModal = ({ visible, product, onClose, cartItems, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setImageLoaded(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
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

  if (!visible || !product) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const existingCartItem = safeCartItems.find(item => item.id === product.id);
  const currentQuantity = existingCartItem?.quantity || 0;
  const displayPrice = product.sale_price || product.price || 150;
  const originalPrice = product.sale_price ? product.price : null;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const result = await addToCart(product, quantity, {
        spice_level: product.spice_level
      });
      
      if (result.success) {
        onClose();
        Alert.alert('Added to Cart', `${product.name} has been added successfully!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const getSafeIngredients = () => {
    try {
      if (!product.ingredients) return [];
      if (Array.isArray(product.ingredients)) return product.ingredients;
      if (typeof product.ingredients === 'string') {
        try {
          const parsed = JSON.parse(product.ingredients);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return product.ingredients.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    } catch { 
      return []; 
    }
  };

  const imageUri = getImageUrl(product.featured_image || product.imageUrl);
  const ingredients = getSafeIngredients();

  return (
    <Modal visible={visible} animationType="none" presentationStyle="pageSheet">
      <Animated.View 
        style={[
          styles.productModalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Hero Image Section */}
        <View style={styles.productHeroSection}>
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.productHeroImage}
            imageStyle={{ resizeMode: 'cover' }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroHeader}>
                <TouchableOpacity onPress={onClose} style={styles.heroBackButton}>
                  <Text style={styles.heroBackIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.heroActions}>
                  {product.sale_price && (
                    <View style={styles.heroOfferBadge}>
                      <Text style={styles.heroOfferText}>SALE</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.heroFooter}>
                {product.average_rating > 0 && (
                  <View style={styles.heroRatingContainer}>
                    <View style={styles.heroRating}>
                      <Text style={styles.heroRatingText}>★ {product.average_rating}</Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <ScrollView 
          style={styles.productScrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Product Info Card */}
          <View style={styles.productInfoCard}>
            <View style={styles.productTitleSection}>
              <Text style={styles.productModalName}>{product.name}</Text>
              <Text style={styles.productModalDescription}>
                {product.description || `Delicious and fresh ${product.name.toLowerCase()} prepared with finest ingredients. Perfect for any time of the day with authentic flavors that will leave you craving for more.`}
              </Text>
            </View>

            {/* Enhanced Meta Information */}
            <View style={styles.productMetaGrid}>
              <View style={styles.metaCardItem}>
                <View style={styles.metaIconContainer}>
                  <Text style={styles.metaIcon}>⏱</Text>
                </View>
                <Text style={styles.metaLabel}>Prep Time</Text>
                <Text style={styles.metaValue}>{product.preparation_time || 25} mins</Text>
              </View>
              
              {product.spice_level && product.spice_level !== 'None' && (
                <View style={styles.metaCardItem}>
                  <View style={[styles.metaIconContainer, { backgroundColor: COLORS.errorLight }]}>
                    <Text style={styles.metaIcon}>🌶</Text>
                  </View>
                  <Text style={styles.metaLabel}>Spice Level</Text>
                  <Text style={styles.metaValue}>{product.spice_level}</Text>
                </View>
              )}
              
              <View style={styles.metaCardItem}>
                <View style={[styles.metaIconContainer, { backgroundColor: COLORS.accentLight }]}>
                  <Text style={styles.metaIcon}>⭐</Text>
                </View>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{product.is_featured ? 'Featured' : 'Popular'}</Text>
              </View>
            </View>

            {/* Ingredients Section */}
            {ingredients.length > 0 && (
              <View style={styles.ingredientsCard}>
                <Text style={styles.cardSectionTitle}>Fresh Ingredients</Text>
                <View style={styles.ingredientsList}>
                  {ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientChip}>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity Selection */}
            <View style={styles.quantityCard}>
              <Text style={styles.cardSectionTitle}>Select Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityActionButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quantityActionText}>−</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityDisplayText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityActionButton}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quantityActionText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Enhanced Sticky Footer */}
        <View style={styles.productModalFooter}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceElevated]}
            style={styles.footerGradient}
          >
            <View style={styles.priceDisplaySection}>
              <View style={styles.priceInfo}>
                <Text style={styles.totalPriceLabel}>Total Amount</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.totalPriceValue}>₹{formatPrice(displayPrice * quantity)}</Text>
                  {originalPrice && (
                    <Text style={styles.originalPriceValue}>₹{formatPrice(originalPrice * quantity)}</Text>
                  )}
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.addToCartMainButton, adding && styles.addingButton]}
                onPress={handleAddToCart}
                activeOpacity={0.85}
                disabled={adding}
              >
                <LinearGradient
                  colors={adding ? [COLORS.textMuted, COLORS.textMuted] : [COLORS.primary, COLORS.primaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addToCartMainText}>
                    {adding ? 'Adding...' : `Add to Cart ${currentQuantity > 0 ? `(${currentQuantity})` : ''}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Enhanced Floating Cart Component
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

// Enhanced Cart Modal
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

// Enhanced Bottom Tabs Component
const BottomTabs = ({ activeTab, cartCount }) => {
  const navigation = useNavigation();
  const [tabAnimations] = useState(
    Array(4).fill(0).map(() => new Animated.Value(1))
  );
  
  const tabs = [
    { id: 'delivery', label: 'Home', icon: '🏠', activeColor: COLORS.primary, onPress: () => navigation.replace('Home') },
    { id: 'dining', label: 'Profile', icon: '👤', activeColor: COLORS.secondary, onPress: () => navigation.replace('Profile') },
    { id: 'live', label: 'Support', icon: '💬', activeColor: COLORS.accent, onPress: () => {} },
    { id: 'reorder', label: 'Orders', icon: '📦', activeColor: COLORS.info, onPress: () => navigation.replace('MyOrder') },
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

// Enhanced Category Item Component
const CategoryItem = React.memo(({ item, onPress, isSelected }) => {
  const [loaded, setLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress(item.id, item.name);
  };
  
  return (
    <Animated.View style={[styles.categoryItemContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}>
          <View style={[styles.categoryIconContainer, isSelected && styles.selectedCategoryIconContainer]}>
            {!loaded && <SkeletonCard height={isTablet ? 80 : 70} borderRadius={BORDER_RADIUS.xl} style={{ width: isTablet ? 80 : 70 }} />}
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.categoryImage, !loaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setLoaded(true)}
            />
            {isSelected && <View style={styles.categorySelectionOverlay} />}
          </View>
          <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
            {item.name}
          </Text>
          {isSelected && (
            <View style={styles.categoryActiveIndicator}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.categoryIndicatorGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Enhanced Recommended Card Component  
const RecommendedCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 150;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cardWidth = (width - (SCREEN_PADDING * 2) - CARD_SPACING) / 2;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleCardPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress(item);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={[styles.recommendedCardNew, { width: cardWidth }]} 
        onPress={handleCardPress} 
        activeOpacity={0.95}
      >
        <View style={styles.recommendedImageSection}>
          {!loaded && <SkeletonCard height={cardWidth * 0.65} borderRadius={0} />}
          <Image
            source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
            style={[styles.recommendedImageNew, !loaded && { opacity: 0, position: 'absolute' }]}
            onLoadEnd={() => setLoaded(true)}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)']} style={styles.recommendedImageGradient} />
          
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SALE</Text>
            </View>
          )}
          
          {item.average_rating > 0 && (
            <View style={styles.ratingBadgeNew}>
              <Text style={styles.ratingTextNew}>★ {item.average_rating}</Text>
            </View>
          )}
          
          <View style={styles.deliveryTimeBadge}>
            <Text style={styles.deliveryTimeBadgeText}>{item.preparation_time || 25}m</Text>
          </View>
        </View>
        
        <View style={styles.recommendedContentSection}>
          <Text style={styles.recommendedNameNew} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.recommendedCuisine}>
            {item.spice_level && item.spice_level !== 'None' ? `${item.spice_level} Spice` : 'Delicious Food'}
          </Text>
          
          <View style={styles.recommendedFooterNew}>
            <View style={styles.priceSection}>
              <Text style={styles.priceTextNew}>₹{formatPrice(displayPrice)}</Text>
              {hasDiscount && <Text style={styles.originalPriceTextNew}>₹{item.price}</Text>}
            </View>
            
            <TouchableOpacity
              style={[styles.addButtonNew, inCart && styles.addedButtonNew]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              <Text style={[styles.addButtonTextNew, inCart && styles.addedButtonTextNew]}>
                {adding ? '•••' : (inCart ? `${quantity}` : 'ADD')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Enhanced Top Section Card Component
const TopSectionCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 180;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cardWidth = width * (isTablet ? 0.42 : 0.68);

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={[styles.topSectionCardNew, { width: cardWidth }]} 
        onPress={() => onPress(item)} 
        activeOpacity={0.95}
      >
        <View style={styles.topSectionImageSection}>
          {!loaded && <SkeletonCard height={cardWidth * 0.55} borderRadius={0} />}
          <Image
            source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
            style={[styles.topSectionImageNew, !loaded && { opacity: 0, position: 'absolute' }]}
            onLoadEnd={() => setLoaded(true)}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.topSectionImageGradient} />
          
          {hasDiscount && (
            <View style={styles.topDiscountBadge}>
              <Text style={styles.topDiscountText}>SALE</Text>
            </View>
          )}
          
          {item.average_rating > 0 && (
            <View style={styles.topRatingBadge}>
              <Text style={styles.topRatingText}>★ {item.average_rating}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.topSectionContentNew}>
          <Text style={styles.topSectionNameNew} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.topSectionCuisine}>
            {item.is_featured ? 'Featured Special' : 'Popular Choice'}
          </Text>
          
          <View style={styles.topSectionFooterNew}>
            <View style={styles.topDeliveryInfo}>
              <Text style={styles.topDeliveryText}>{item.preparation_time || 30} mins</Text>
              <View style={styles.topPriceContainer}>
                <Text style={styles.topPriceText}>₹{formatPrice(displayPrice)}</Text>
                {hasDiscount && <Text style={styles.topOriginalPrice}>₹{item.price}</Text>}
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.topAddButton, inCart && styles.topAddedButton]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              <Text style={[styles.topAddButtonText, inCart && styles.topAddedButtonText]}>
                {adding ? '•••' : (inCart ? `${quantity}` : 'ADD')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Enhanced Full Row Card Component
const FullRowCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 220;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const imageSize = isTablet ? 130 : 110;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={styles.fullCardNew} onPress={() => onPress(item)} activeOpacity={0.95}>
        <View style={[styles.fullCardImageSection, { width: imageSize }]}>
          {!loaded && <SkeletonCard height={imageSize} borderRadius={BORDER_RADIUS.xl} style={{ width: imageSize }} />}
          <Image
            source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
            style={[styles.fullCardImageNew, { width: imageSize, height: imageSize }, !loaded && { opacity: 0, position: 'absolute' }]}
            onLoadEnd={() => setLoaded(true)}
          />
          {hasDiscount && (
            <View style={styles.fullDiscountBadge}>
              <Text style={styles.fullDiscountText}>SALE</Text>
            </View>
          )}
        </View>
        
        <View style={styles.fullCardContentNew}>
          <View style={styles.fullCardMainInfo}>
            <Text style={styles.fullCardNameNew}>{item.name}</Text>
            <Text style={styles.fullCardCuisine}>
              {item.is_featured ? 'Premium Restaurant' : 'Popular Restaurant'}
            </Text>
            
            <View style={styles.fullCardMetaRow}>
              {item.average_rating > 0 && (
                <View style={styles.fullRatingChip}>
                  <Text style={styles.fullRatingText}>★ {item.average_rating}</Text>
                </View>
              )}
              <Text style={styles.fullDeliveryText}>{item.preparation_time || 25} mins</Text>
            </View>
          </View>
          
          <View style={styles.fullCardActions}>
            <View style={styles.fullPriceInfo}>
              <Text style={styles.fullPriceText}>₹{formatPrice(displayPrice)}</Text>
              {hasDiscount && <Text style={styles.fullOriginalPrice}>₹{item.price}</Text>}
            </View>
            
            <TouchableOpacity
              style={[styles.fullAddButton, inCart && styles.fullAddedButton]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              <Text style={[styles.fullAddButtonText, inCart && styles.fullAddedButtonText]}>
                {adding ? '•••' : (inCart ? `${quantity}` : 'ADD')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Main Component with Professional Design
export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [homeFilters, setHomeFilters] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('delivery');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Address state
  const [addressnow, setaddressnow] = useState('Select Location');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [allAddresses, setAllAddresses] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const cartHookResult = useCart();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const flatListRef = useRef(null);

  // Enhanced banner data
  const banners = [
    { 
      id: '1', 
      title: 'Free Delivery', 
      subtitle: 'On orders above ₹199', 
      emoji: '🚚', 
      bg: [COLORS.primary, COLORS.primaryDark],
      pattern: '🍕🍔🍟'
    },
    { 
      id: '2', 
      title: '50% OFF', 
      subtitle: 'On your first order', 
      emoji: '🎉', 
      bg: [COLORS.secondary, '#357ABD'],
      pattern: '🎊🎈🎁'
    },
    { 
      id: '3', 
      title: 'Premium Plus', 
      subtitle: 'Unlimited free delivery', 
      emoji: '👑', 
      bg: [COLORS.accent, '#E6A429'],
      pattern: '⭐💫✨'
    },
  ];

  const VALID_SECTION_TYPES = ['topSection', 'recommendedForYouSection', 'fullCardSection'];

  // Enhanced address fetching
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const email = await AsyncStorage.getItem('@user_email');
        
        if (!email) {
          setaddressnow('Select Location');
          return;
        }
        
        const response = await fetch(`${baseURL}/api/address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            setAllAddresses(result.data);
            const homeAddress = result.data.find(addr => addr.type.toLowerCase() === 'home') || result.data[0];
            setSelectedAddressId(homeAddress.id);
            setaddressnow(homeAddress.full_address || homeAddress.area || 'Address found');
          } else {
            setaddressnow('No address found');
          }
        } else {
          setaddressnow('Location not available');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setaddressnow('Location error');
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    fetchAddresses();
  }, []);

  useEffect(() => {
    fetchInitialData();
    animateIn();
    const clear = setupBannerCarousel();
    return clear;
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSectionsForCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        refreshCart();
      }
    });
    return unsubscribe;
  }, [navigation, cartItems]);

  // Cart hook with safe destructuring
  const {
    cartItems = [],
    cartCount = 0,
    cartTotal = 0,
    subtotal = 0,
    deliveryFee = 25,
    appliedCoupon = null,
    couponDiscount = 0,
    loading: cartLoading = false,
    syncing = false,
    addToCart = () => Promise.resolve({ success: false }),
    removeFromCart = () => Promise.resolve(),
    updateQuantity = () => Promise.resolve(),
    clearCart = () => Promise.resolve(),
    applyCoupon = () => Promise.resolve(false),
    removeCoupon = () => {},
    placeOrder = () => Promise.resolve({ success: false }),
    getItemQuantity = () => 0,
    isItemInCart = () => false,
    refreshCart = () => Promise.resolve()
  } = cartHookResult || {};

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 600, 
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true 
      }),
      Animated.timing(scaleAnim, { 
        toValue: 1, 
        duration: 500, 
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true 
      }),
    ]).start();
  };

  const setupBannerCarousel = () => {
    const interval = setInterval(() => {
      setActiveSlide(current => {
        const next = (current + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const filtersResponse = await fetch(`${baseURL}/api/home-filters`);
      if (filtersResponse.ok) {
        const filtersData = await filtersResponse.json();
        setHomeFilters(filtersData);
        if (Array.isArray(filtersData) && filtersData.length > 0) {
          setSelectedCategoryId(filtersData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsForCategory = async (categoryId) => {
    try {
      setSectionsLoading(true);
      const sectionsResponse = await fetch(`${baseURL}/api/home-sections/${categoryId}`);
      
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        let allSections = [];
        if (Array.isArray(sectionsData)) allSections = sectionsData;
        else if (sectionsData && typeof sectionsData === 'object') allSections = [sectionsData];

        const sectionsByType = { recommendedForYouSection: [], topSection: [], fullCardSection: [] };
        allSections.forEach(section => {
          if (VALID_SECTION_TYPES.includes(section.type) && section.sectionData && section.sectionData.length > 0) {
            sectionsByType[section.type].push(section);
          }
        });

        const limitedSections = [];
        if (sectionsByType.recommendedForYouSection.length > 0) limitedSections.push(sectionsByType.recommendedForYouSection[0]);
        if (sectionsByType.topSection.length > 0) limitedSections.push(sectionsByType.topSection[0]);
        if (sectionsByType.fullCardSection.length > 0) limitedSections.push(sectionsByType.fullCardSection[0]);
        setSections(limitedSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    if (selectedCategoryId) await fetchSectionsForCategory(selectedCategoryId);
    setRefreshing(false);
  };

  const handleProductPress = (item) => { 
    setSelectedProduct(item); 
    setShowProductModal(true); 
  };

  const handleCartPress = () => setShowCartModal(true);
  const handleCloseCart = () => clearCart();

  // Address handlers
  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setaddressnow(address.full_address || address.area || 'Address');
    setShowAddressDropdown(false);
  };

  const handleAddressDropdownToggle = () => {
    if (allAddresses.length > 1) {
      setShowAddressDropdown(true);
    }
  };

  // Enhanced render functions
  const renderBanner = ({ item, index }) => (
    <View style={styles.bannerContainer}>
      <LinearGradient colors={item.bg} style={styles.enhancedBannerCard}>
        <View style={styles.bannerPattern}>
          <Text style={styles.bannerPatternText}>{item.pattern}</Text>
        </View>
        <View style={styles.bannerContentSection}>
          <View style={styles.bannerMainContent}>
            <Text style={styles.bannerEmojiNew}>{item.emoji}</Text>
            <Text style={styles.bannerTitleNew}>{item.title}</Text>
            <Text style={styles.bannerSubtitleNew}>{item.subtitle}</Text>
            <TouchableOpacity style={styles.bannerCallToAction} activeOpacity={0.8}>
              <Text style={styles.bannerButtonTextNew}>Order Now</Text>
              <Text style={styles.bannerArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategory = ({ item }) => (
    <CategoryItem item={item} onPress={handleCategoryPress} isSelected={selectedCategoryId === item.id} />
  );
  
  const renderRecommendedItem = ({ item }) => (
    <RecommendedCard 
      item={item} 
      onPress={handleProductPress} 
      addToCart={addToCart}
      isItemInCart={isItemInCart}
      getItemQuantity={getItemQuantity}
    />
  );
  
  const renderTopSectionItem = ({ item }) => (
    <TopSectionCard 
      item={item} 
      onPress={handleProductPress} 
      addToCart={addToCart}
      isItemInCart={isItemInCart}
      getItemQuantity={getItemQuantity}
    />
  );
  
  const renderFullCardItem = ({ item }) => (
    <FullRowCard 
      item={item} 
      onPress={handleProductPress} 
      addToCart={addToCart}
      isItemInCart={isItemInCart}
      getItemQuantity={getItemQuantity}
    />
  );

  // Enhanced skeleton components
  const BannerSkeleton = () => (
    <View style={styles.bannerSkeletonContainer}>
      <SkeletonCard height={height * 0.24} borderRadius={BORDER_RADIUS.xxl} style={{ marginHorizontal: SCREEN_PADDING }} />
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map(i => <SkeletonCircle key={i} size={8} style={{ marginHorizontal: 4 }} />)}
      </View>
    </View>
  );

  const CategoriesSkeleton = () => (
    <View style={styles.section}>
      <SkeletonLine height={FONTS.xxl} width={isTablet ? 280 : 220} style={{ marginBottom: SPACING.lg }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContainer}>
        {[...Array(6)].map((_, i) => (
          <View key={`cat-skel-${i}`} style={styles.categorySkeletonItem}>
            <SkeletonCard height={isTablet ? 80 : 70} borderRadius={BORDER_RADIUS.xl} style={{ width: isTablet ? 80 : 70 }} />
            <SkeletonLine height={FONTS.sm} width={60} style={{ marginTop: SPACING.sm }} />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSection = (section, index) => {
    if (!section || !section.sectionData || section.sectionData.length === 0) return null;
    
    const sectionKey = `${section.type}-${section.id}-${index}`;
    const getSectionConfig = (type) => {
      switch (type) {
        case 'recommendedForYouSection': 
          return { 
            subtitle: 'Curated specially for you', 
            emoji: '🍽️',
            color: COLORS.primary 
          };
        case 'topSection': 
          return { 
            subtitle: 'Most popular in your area', 
            emoji: '🔥',
            color: COLORS.secondary 
          };
        case 'fullCardSection': 
          return { 
            subtitle: 'Premium dining experiences', 
            emoji: '⭐',
            color: COLORS.accent 
          };
        default: 
          return { 
            subtitle: 'Discover amazing food', 
            emoji: '🎯',
            color: COLORS.info 
          };
      }
    };

    const config = getSectionConfig(section.type);

    if (section.type === 'recommendedForYouSection') {
      return (
        <Animated.View key={sectionKey} style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.enhancedSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionEmoji}>{config.emoji}</Text>
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitleNew}>{section.name}</Text>
                <Text style={styles.sectionSubtitleNew}>{config.subtitle}</Text>
              </View>
            </View>
          </View>
          
          {sectionsLoading ? (
            <View style={styles.recommendedSkeletonGrid}>
              {[...Array(4)].map((_, i) => (
                <SkeletonCard 
                  key={i} 
                  height={200} 
                  borderRadius={BORDER_RADIUS.xl} 
                  style={{ 
                    width: (width - (SCREEN_PADDING * 2) - CARD_SPACING) / 2,
                    marginBottom: CARD_SPACING 
                  }} 
                />
              ))}
            </View>
          ) : (
            <FlatList
              data={section.sectionData.slice(0, 6)}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => `${sectionKey}-recommended-${item.id}`}
              numColumns={2}
              contentContainerStyle={styles.recommendedGridContainer}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: CARD_SPACING }} />}
              columnWrapperStyle={styles.recommendedGridRow}
            />
          )}
        </Animated.View>
      );
    } else if (section.type === 'topSection') {
      return (
        <Animated.View key={sectionKey} style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.enhancedSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionIconContainer, { backgroundColor: config.color + '20' }]}>
                <Text style={styles.sectionEmoji}>{config.emoji}</Text>
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitleNew}>{section.name}</Text>
                <Text style={styles.sectionSubtitleNew}>{config.subtitle}</Text>
              </View>
            </View>
          </View>
          
          {sectionsLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topSectionSkeletonContainer}>
              {[...Array(3)].map((_, i) => (
                <SkeletonCard 
                  key={i} 
                  height={180} 
                  borderRadius={BORDER_RADIUS.xl} 
                  style={{ 
                    width: width * (isTablet ? 0.42 : 0.68),
                    marginRight: CARD_SPACING 
                  }} 
                />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={section.sectionData}
              renderItem={renderTopSectionItem}
              keyExtractor={(item) => `${sectionKey}-top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topSectionScrollContainer}
              snapToInterval={width * (isTablet ? 0.45 : 0.72)}
              decelerationRate="fast"
            />
          )}
        </Animated.View>
      );
    } else if (section.type === 'fullCardSection') {
      return (
        <Animated.View key={sectionKey} style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.enhancedSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionIconContainer, { backgroundColor: config.color + '20' }]}>
                <Text style={styles.sectionEmoji}>{config.emoji}</Text>
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitleNew}>{section.name}</Text>
                <Text style={styles.sectionSubtitleNew}>{config.subtitle}</Text>
              </View>
            </View>
          </View>
          
          {sectionsLoading ? (
            <View style={styles.fullCardSkeletonContainer}>
              {[...Array(3)].map((_, i) => (
                <SkeletonCard 
                  key={i} 
                  height={140} 
                  borderRadius={BORDER_RADIUS.xl} 
                  style={{ marginBottom: CARD_SPACING }} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.fullCardSectionContainer}>
              {section.sectionData.slice(0, 4).map((item, itemIndex) => (
                <View key={`${sectionKey}-full-${item.id}-${itemIndex}`}>
                  {renderFullCardItem({ item })}
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      );
    }
    return null;
  };

  // Enhanced loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <View style={styles.headerNew}>
          <View style={styles.headerTopNew}>
            <View style={styles.locationSection}>
              <SkeletonLine height={FONTS.base} width={200} />
              <SkeletonLine height={FONTS.sm} width={120} style={{ marginTop: 4 }} />
            </View>
            <SkeletonCircle size={isTablet ? 48 : 40} />
          </View>
          <View style={styles.searchSection}>
            <SkeletonLine height={50} width={'100%'} borderRadius={BORDER_RADIUS.xl} />
          </View>
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <BannerSkeleton />
          <CategoriesSkeleton />
          <View style={styles.section}>
            <SkeletonLine height={FONTS.xxl} width={240} style={{ marginBottom: SPACING.lg }} />
            <View style={styles.recommendedSkeletonGrid}>
              {[...Array(4)].map((_, i) => (
                <SkeletonCard 
                  key={i} 
                  height={200} 
                  borderRadius={BORDER_RADIUS.xl} 
                  style={{ 
                    width: (width - (SCREEN_PADDING * 2) - CARD_SPACING) / 2,
                    marginBottom: CARD_SPACING 
                  }} 
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Enhanced Professional Header */}
      <Animated.View style={[
        styles.headerNew, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}>
        <View style={styles.headerTopNew}>
          <TouchableOpacity 
            style={styles.locationSection}
            onPress={handleAddressDropdownToggle}
            disabled={allAddresses.length <= 1}
            activeOpacity={0.8}
          >
            <View style={styles.locationMainInfo}>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <View style={styles.locationAddressRow}>
                <Text style={styles.locationAddressText} numberOfLines={1} ellipsizeMode="tail">
                  {loadingAddresses ? 'Loading location...' : formatAddress(addressnow)}
                </Text>
                {allAddresses.length > 1 && !loadingAddresses && (
                  <Text style={styles.locationDropdownIcon}>⌄</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButtonNew}
            onPress={() => navigation.replace('Profile')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.primaryUltraLight]}
              style={styles.profileButtonGradient}
            >
              <Text style={styles.profileIconNew}>👤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchSection} activeOpacity={0.9}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceAlt]}
            style={styles.searchGradient}
          >
            <Text style={styles.searchIconNew}>🔍</Text>
            <Text style={styles.searchPlaceholderNew}>Search for food, restaurants, cuisines...</Text>
            <View style={styles.searchMicrophone}>
              <Text style={styles.microphoneIcon}>🎤</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Enhanced Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={20}
          />
        }
      >
        {/* Enhanced Banner Carousel */}
        <Animated.View style={[
          styles.carouselSection, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}>
          <FlatList
            ref={flatListRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={({ viewableItems }) => {
              const idx = viewableItems[0]?.index ?? 0;
              setActiveSlide(idx);
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            snapToInterval={width - (SCREEN_PADDING * 1.5)}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING * 0.75 }}
          />
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.dotNew, activeSlide === index && styles.activeDotNew]} 
                onPress={() => {
                  setActiveSlide(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Categories Section */}
        {homeFilters.length > 0 ? (
          <Animated.View style={[
            styles.section, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}>
            <View style={styles.enhancedSectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionEmoji}>🤔</Text>
                </View>
                <View style={styles.sectionTextContainer}>
                  <Text style={styles.sectionTitleNew}>What's on your mind?</Text>
                  <Text style={styles.sectionSubtitleNew}>Choose your favorite cuisine</Text>
                </View>
              </View>
            </View>
            
            <FlatList
              data={homeFilters}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContainer}
            />
          </Animated.View>
        ) : (
          <CategoriesSkeleton />
        )}

        {/* Enhanced Dynamic Sections */}
        {sections.length > 0 ? (
          sections.map((section, index) => renderSection(section, index))
        ) : (
          sectionsLoading ? (
            <>
              <View style={styles.section}>
                <SkeletonLine height={FONTS.xxl} width={240} style={{ marginBottom: SPACING.lg }} />
                <View style={styles.recommendedSkeletonGrid}>
                  {[...Array(4)].map((_, i) => (
                    <SkeletonCard 
                      key={i} 
                      height={200} 
                      borderRadius={BORDER_RADIUS.xl} 
                      style={{ 
                        width: (width - (SCREEN_PADDING * 2) - CARD_SPACING) / 2,
                        marginBottom: CARD_SPACING 
                      }} 
                    />
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentEmoji}>🍽️</Text>
              <Text style={styles.noContentTitle}>Discover Amazing Food</Text>
              <Text style={styles.noContentSubtitle}>Explore restaurants and cuisines in your area</Text>
            </View>
          )
        )}
        
        {/* Extra padding for floating elements */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Enhanced Modals */}
      <ProductDetailModal
        visible={showProductModal}
        product={selectedProduct}
        onClose={() => setShowProductModal(false)}
        cartItems={cartItems}
        addToCart={addToCart}
      />

      <FloatingCart
        cartItems={cartItems}
        cartTotal={formatPrice(cartTotal)}
        onPress={() => setShowCartModal(true)}
        onClose={handleCloseCart}
        syncing={syncing}
      />

      <CartModal
        visible={showCartModal}
        cartItems={cartItems}
        cartTotal={cartTotal}
        subtotal={formatPrice(subtotal)}
        deliveryFee={deliveryFee}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onClose={() => setShowCartModal(false)}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        applyCoupon={applyCoupon}
        removeCoupon={removeCoupon}
        placeOrder={placeOrder}
        loading={cartLoading}
        navigation={navigation} 
      />

      <AddressDropdownModal
        visible={showAddressDropdown}
        addresses={allAddresses}
        selectedId={selectedAddressId}
        onSelect={handleAddressSelect}
        onClose={() => setShowAddressDropdown(false)}
      />

      {/* Enhanced Bottom Tabs */}
      <BottomTabs activeTab={activeTab} cartCount={cartCount} />

      {/* Floating Assistant */}
      <FloatingGirlAssistant
        defaultVisible={true}
        size={isTablet ? 85 : 65}
        startDock="right"
        bottomOffset={Platform.OS === 'ios' ? 130 : 110}
        snapToEdges={true}
        bubbleMode="reposition"
      />
    </SafeAreaView>
  );
}

// Enhanced Professional Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Enhanced Header Styles
  headerNew: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  headerTopNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  locationSection: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  locationMainInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationAddressText: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  locationDropdownIcon: {
    fontSize: FONTS.base,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  profileButtonNew: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  profileButtonGradient: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconNew: {
    fontSize: FONTS.xl,
  },
  searchSection: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchIconNew: {
    fontSize: FONTS.lg,
    marginRight: SPACING.md,
    color: COLORS.textSecondary,
  },
  searchPlaceholderNew: {
    flex: 1,
    fontSize: FONTS.base,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  searchMicrophone: {
    padding: SPACING.sm,
  },
  microphoneIcon: {
    fontSize: FONTS.base,
    color: COLORS.primary,
  },

  // Enhanced Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 160 : 140,
  },

  // Enhanced Banner Styles
  carouselSection: {
    marginVertical: SPACING.xl,
  },
  bannerContainer: {
    width: width - (SCREEN_PADDING * 1.5),
    paddingHorizontal: SPACING.xs,
  },
  enhancedBannerCard: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    height: height * 0.24,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    position: 'relative',
  },
  bannerPattern: {
    position: 'absolute',
    top: -10,
    right: -20,
    opacity: 0.15,
    transform: [{ rotate: '15deg' }],
  },
  bannerPatternText: {
    fontSize: 60,
    letterSpacing: 10,
  },
  bannerContentSection: {
    flex: 1,
    padding: isTablet ? SPACING.xxxl : SPACING.xxl,
    justifyContent: 'center',
  },
  bannerMainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerEmojiNew: {
    fontSize: isTablet ? 40 : 32,
    marginBottom: SPACING.md,
  },
  bannerTitleNew: {
    fontSize: isTablet ? FONTS.huge : FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  bannerSubtitleNew: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  bannerCallToAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerButtonTextNew: {
    color: COLORS.textInverse,
    fontSize: FONTS.sm,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  bannerArrow: {
    color: COLORS.textInverse,
    fontSize: FONTS.base,
    fontWeight: '700',
  },
  bannerSkeletonContainer: {
    marginVertical: SPACING.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  dotNew: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 4,
  },
  activeDotNew: {
    backgroundColor: COLORS.primary,
    width: 24,
  },

  // Enhanced Section Styles
  section: {
    marginBottom: SPACING.xxxl,
    paddingHorizontal: SCREEN_PADDING,
  },
  enhancedSectionHeader: {
    marginBottom: SPACING.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionEmoji: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitleNew: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  sectionSubtitleNew: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Enhanced Category Styles
  categoriesScrollContainer: {
    paddingVertical: SPACING.md,
  },
  categoryItemContainer: {
    alignItems: 'center',
    marginRight: isTablet ? SPACING.xxxl : SPACING.xxl,
  },
  categoryCard: {
    alignItems: 'center',
    position: 'relative',
  },
  selectedCategoryCard: {},
  categoryIconContainer: {
    width: isTablet ? 80 : 70,
    height: isTablet ? 80 : 70,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  selectedCategoryIconContainer: {
    backgroundColor: COLORS.primaryUltraLight,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  categoryImage: {
    width: isTablet ? 70 : 60,
    height: isTablet ? 70 : 60,
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: 'cover',
  },
  categorySelectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryName: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: isTablet ? 90 : 70,
  },
  selectedCategoryName: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  categoryActiveIndicator: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryIndicatorGradient: {
    flex: 1,
  },
  categorySkeletonItem: {
    alignItems: 'center',
    marginRight: isTablet ? SPACING.xxxl : SPACING.xxl,
  },

  // Enhanced Recommended Card Styles
  recommendedGridContainer: {
    paddingVertical: SPACING.md,
  },
  recommendedGridRow: {
    justifyContent: 'space-between',
  },
  recommendedSkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendedCardNew: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: CARD_SPACING,
  },
  recommendedImageSection: {
    position: 'relative',
    height: 130,
  },
  recommendedImageNew: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    elevation: 2,
  },
  discountText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingBadgeNew: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTextNew: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  deliveryTimeBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  deliveryTimeBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  recommendedContentSection: {
    padding: isTablet ? SPACING.lg : SPACING.md,
  },
  recommendedNameNew: {
    fontSize: FONTS.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  recommendedCuisine: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  recommendedFooterNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  priceTextNew: {
    fontSize: FONTS.base,
    color: COLORS.primary,
    fontWeight: '800',
  },
  originalPriceTextNew: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
  },
  addButtonNew: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    minWidth: 60,
  },
  addedButtonNew: {
    backgroundColor: COLORS.success,
  },
  addButtonTextNew: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addedButtonTextNew: {
    color: COLORS.textInverse,
  },

  // Enhanced Top Section Card Styles
  topSectionScrollContainer: {
    paddingVertical: SPACING.md,
  },
  topSectionSkeletonContainer: {
    paddingVertical: SPACING.md,
  },
  topSectionCardNew: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: CARD_SPACING,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  topSectionImageSection: {
    position: 'relative',
    height: 150,
  },
  topSectionImageNew: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topSectionImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  topDiscountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  topDiscountText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
  },
  topRatingBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  topRatingText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  topSectionContentNew: {
    padding: isTablet ? SPACING.lg : SPACING.md,
  },
  topSectionNameNew: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  topSectionCuisine: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  topSectionFooterNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topDeliveryInfo: {
    flex: 1,
  },
  topDeliveryText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  topPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topPriceText: {
    fontSize: FONTS.base,
    color: COLORS.primary,
    fontWeight: '800',
  },
  topOriginalPrice: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
  },
  topAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    minWidth: 60,
  },
  topAddedButton: {
    backgroundColor: COLORS.success,
  },
  topAddButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topAddedButtonText: {
    color: COLORS.textInverse,
  },

  // Enhanced Full Card Styles
  fullCardSectionContainer: {
    paddingVertical: SPACING.md,
  },
  fullCardSkeletonContainer: {
    paddingVertical: SPACING.md,
  },
  fullCardNew: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: CARD_SPACING,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  fullCardImageSection: {
    position: 'relative',
  },
  fullCardImageNew: {
    resizeMode: 'cover',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
  },
  fullDiscountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  fullDiscountText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
  },
  fullCardContentNew: {
    flex: 1,
    padding: isTablet ? SPACING.lg : SPACING.md,
    justifyContent: 'space-between',
  },
  fullCardMainInfo: {
    flex: 1,
  },
  fullCardNameNew: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  fullCardCuisine: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  fullCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fullRatingChip: {
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.md,
  },
  fullRatingText: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  fullDeliveryText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  fullCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullPriceInfo: {
    flex: 1,
  },
  fullPriceText: {
    fontSize: FONTS.lg,
    color: COLORS.primary,
    fontWeight: '800',
  },
  fullOriginalPrice: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  fullAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    minWidth: 60,
  },
  fullAddedButton: {
    backgroundColor: COLORS.success,
  },
  fullAddButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullAddedButtonText: {
    color: COLORS.textInverse,
  },

  // No Content Styles
  noContentContainer: {
    padding: isTablet ? 80 : 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContentEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  noContentTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  noContentSubtitle: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Enhanced Bottom Tab Styles
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

  // Enhanced Floating Cart Styles
  floatingCartContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
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
    letterSpacing: 0.5,
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

  // Enhanced Cart Modal Styles
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

  // Enhanced Coupon Section Styles
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
    elevation: 2,
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

  // Enhanced Bill Summary Styles
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

  // Enhanced Action Buttons
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
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    letterSpacing: 0.5,
  },

  // Enhanced Product Modal Styles
  productModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productHeroSection: {
    height: height * 0.4,
    position: 'relative',
  },
  productHeroImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: Platform.OS === 'ios' ? SPACING.xxxl : SPACING.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroBackButton: {
    width: isTablet ? 48 : 44,
    height: isTablet ? 48 : 44,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  heroBackIcon: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  heroActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  heroOfferBadge: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  heroOfferText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroRatingContainer: {},
  heroRating: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  heroRatingText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
  productScrollContent: {
    flex: 1,
  },
  productInfoCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    marginTop: -SPACING.xl,
    paddingTop: SPACING.xl,
    paddingHorizontal: isTablet ? SPACING.xxxl : SPACING.xl,
    paddingBottom: SPACING.xl,
    minHeight: height * 0.6,
  },
  productTitleSection: {
    marginBottom: SPACING.xxl,
  },
  productModalName: {
    fontSize: isTablet ? FONTS.huge : FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  productModalDescription: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textSecondary,
    lineHeight: isTablet ? 32 : 26,
    fontWeight: '500',
  },
  productMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metaCardItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaIconContainer: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metaIcon: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
  },
  metaLabel: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  ingredientsCard: {
    marginBottom: SPACING.xxl,
  },
  cardSectionTitle: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  ingredientChip: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: isTablet ? SPACING.lg : SPACING.md,
    paddingVertical: isTablet ? SPACING.md : SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ingredientText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quantityCard: {
    marginBottom: SPACING.xl,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quantityActionButton: {
    width: isTablet ? 48 : 44,
    height: isTablet ? 48 : 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityActionText: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quantityDisplay: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    marginHorizontal: SPACING.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  quantityDisplayText: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '900',
    color: COLORS.textInverse,
  },
  productModalFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerGradient: {
    paddingHorizontal: isTablet ? SPACING.xxxl : SPACING.xl,
    paddingVertical: isTablet ? SPACING.xxl : SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxxl : SPACING.xl,
  },
  priceDisplaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  priceInfo: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPriceValue: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '900',
    color: COLORS.primary,
  },
  originalPriceValue: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.md,
    fontWeight: '600',
  },
  addToCartMainButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flex: 2,
  },
  addingButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    alignItems: 'center',
  },
  addToCartMainText: {
    color: COLORS.textInverse,
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Enhanced Address Modal Styles
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  addressDropdown: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SCREEN_PADDING,
    borderRadius: BORDER_RADIUS.xl,
    maxHeight: height * 0.65,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  addressDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? SPACING.xxl : SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceAlt,
  },
  addressDropdownTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addressCloseButton: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressCloseText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addressList: {
    maxHeight: height * 0.45,
  },
  addressItem: {
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  selectedAddressItem: {
    backgroundColor: COLORS.primaryUltraLight,
  },
  addressItemContent: {
    flex: 1,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addressTypeChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  addressType: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedIndicator: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  addressFullText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: isTablet ? 28 : 24,
  },
  addressArea: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
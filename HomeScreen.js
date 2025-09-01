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
} from 'react-native';
import FloatingGirlAssistant from './Animatedgirl';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from './hooks/useCart';
// Add this helper function at the top
const formatPrice = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// Enhanced image helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('products/') || imagePath.startsWith('categories/')) return `${baseURL}/storage/${imagePath}`;
  if (imagePath.startsWith('/products/') || imagePath.startsWith('/categories/')) return `${baseURL}/storage/${imagePath.slice(1)}`;
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath)) return `${baseURL}/storage/products/${imagePath}`;
  return `${baseURL}/storage/${imagePath}`;
};

// Swiggy-inspired color palette
const COLORS = {
  // Swiggy brand colors
  primary: '#FC8019',        // Swiggy orange
  primaryDark: '#E8660C',    // Darker orange
  primaryLight: '#FFE8D6',   // Light orange tint
  
  // Secondary colors
  secondary: '#FF3008',      // Swiggy red
  accent: '#FFC107',         // Golden yellow for badges
  
  // Neutrals
  background: '#FFFFFF',     // Pure white background
  surface: '#FFFFFF',        // Card backgrounds
  surfaceAlt: '#F8F8F8',     // Alternative surface
  
  // Text colors
  text: '#282C3F',           // Dark text (Swiggy's primary text)
  textSecondary: '#686B78',  // Secondary text
  textMuted: '#93959F',      // Muted text
  textInverse: '#FFFFFF',    // White text for dark backgrounds
  
  // Status colors
  success: '#60B246',        // Green for success
  error: '#E23744',          // Red for errors
  warning: '#F39800',        // Orange for warnings
  info: '#1976D2',           // Blue for info
  
  // Borders and shadows
  border: '#E9E9E9',         // Light border
  divider: '#F1F1F2',        // Very light divider
  shadow: 'rgba(40, 44, 63, 0.1)', // Subtle shadow
  
  // Gradients
  gradientStart: '#FC8019',
  gradientEnd: '#FF3008',
};

// Skeleton Components
const Pulse = ({ style }) => {
  const pulseValue = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseValue]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#F0F0F0',
          opacity: pulseValue,
        },
        style,
      ]}
    />
  );
};

const SkeletonLine = ({ height = 12, width = '100%', borderRadius = 6, style }) => (
  <Pulse style={[{ height, width, borderRadius }, style]} />
);

const SkeletonCircle = ({ size = 48, style }) => (
  <Pulse style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />
);

const SkeletonCard = ({ height = 120, borderRadius = 14, style }) => (
  <Pulse style={[{ height, borderRadius }, style]} />
);

// Product Detail Modal with API integration
const ProductDetailModal = ({ visible, product, onClose, cartItems, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setImageLoaded(false);
    }
  }, [visible]);

  if (!visible || !product) return null;

  // Safely access cartItems array
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
        Alert.alert('Added to Cart', `${product.name} added successfully!`);
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.productModalContainer}>
        <View style={styles.productModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Text style={styles.modalBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.productModalTitle}>Product Details</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        <ScrollView style={styles.productModalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.productImageContainer}>
            {!imageLoaded && <SkeletonCard height={250} borderRadius={0} style={{ width: '100%' }} />}
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={[styles.productModalImage, !imageLoaded && { opacity: 0, position: 'absolute' }]}
                onLoadEnd={() => setImageLoaded(true)}
              />
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={styles.imageOverlay} />
            {product.sale_price && (
              <View style={styles.productOfferBadge}>
                <Text style={styles.offerText}>SALE</Text>
              </View>
            )}
            {product.average_rating > 0 && (
              <View style={styles.productRatingBadge}>
                <Text style={styles.ratingText}>★ {product.average_rating}</Text>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>
              {product.description || `Delicious and fresh ${product.name.toLowerCase()} prepared with finest ingredients. Perfect for any time of the day with authentic flavors.`}
            </Text>

            <View style={styles.productMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🕒</Text>
                <Text style={styles.metaText}>{product.preparation_time || 25} mins</Text>
              </View>
              {product.spice_level && product.spice_level !== 'None' && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🌶️</Text>
                  <Text style={styles.metaText}>{product.spice_level}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🌟</Text>
                <Text style={styles.metaText}>{product.is_featured ? 'Featured' : 'Popular'}</Text>
              </View>
            </View>

            {ingredients.length > 0 && (
              <View style={styles.ingredientsSection}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsList}>
                  {ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientTag}>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.productModalFooter}>
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPrice}>₹{displayPrice * quantity}</Text>
              {originalPrice && <Text style={styles.originalPrice}>₹{originalPrice * quantity}</Text>}
            </View>
            <Text style={styles.priceNote}>Total Amount</Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, adding && { opacity: 0.6 }]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
            disabled={adding}
          >
            <Text style={styles.addToCartButtonText}>
              {adding ? 'Adding...' : `Add to Cart ${currentQuantity > 0 ? `(${currentQuantity} in cart)` : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Enhanced Floating Cart Component
const FloatingCart = ({ cartItems, cartTotal, onPress, onClose, syncing }) => {
  const [slideAnim] = useState(new Animated.Value(100));
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  useEffect(() => {
    if (safeCartItems.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [safeCartItems.length]);

  if (safeCartItems.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.floatingCartContainer,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.cartLeft}>
          <View style={styles.cartItemsCount}>
            <Text style={styles.cartItemsCountText}>{safeCartItems.length}</Text>
          </View>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemsText}>
              {safeCartItems.length} item{safeCartItems.length > 1 ? 's' : ''} added
            </Text>
            <Text style={styles.cartExtraText}>
              {syncing ? 'Syncing...' : 'Tap to review order'}
            </Text>
          </View>
        </View>

        <View style={styles.cartRight}>
          <Text style={styles.cartTotal}>₹{cartTotal}</Text>
          <Text style={styles.cartViewText}>VIEW CART →</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeCartButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.closeCartText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Cart Modal with Coupon and API integration
// Enhanced Cart Modal with Coupon and API integration - FIXED HOOKS
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
  const navigation = useNavigation(); // Add this line
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  if (!visible) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called'); // For debugging
    console.log('Navigation object:', navigation); // For debugging
    
    // Navigate to Order Placement Screen with cart data
    navigation.navigate('OrderPlacement', {
      cartItems: safeCartItems,
      cartTotal: cartTotal,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      couponDiscount: couponDiscount,
      appliedCoupon: appliedCoupon
    });
    
    onClose(); // Close the cart modal
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

  // Pre-create components to avoid useState in map
  const CartItemRow = ({ item }) => {
    const [loaded, setLoaded] = useState(false);
    const uri = getImageUrl(item.featured_image || item.imageUrl);
    
    return (
      <View key={`${item.id}-${item.slug || 'item'}`} style={styles.cartItemRow}>
        <View style={styles.cartItemImageContainer}>
          {!loaded && <SkeletonCard height={60} borderRadius={10} style={{ width: 60 }} />}
          {uri && (
            <Image
              source={{ uri }}
              style={[styles.cartItemImage, !loaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setLoaded(true)}
            />
          )}
        </View>
        
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          {item.spice_level && item.spice_level !== 'None' && (
            <Text style={styles.cartItemSpice}>🌶️ {item.spice_level}</Text>
          )}
          <View style={styles.priceContainer}>
            <Text style={styles.cartItemPrice}>₹{item.price}</Text>
          </View>
        </View>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.cartModal}>
        <View style={styles.cartModalHeader}>
          <Text style={styles.cartModalTitle}>Your Order</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cartItemsList} showsVerticalScrollIndicator={false}>
          {safeCartItems.map((item) => (
            <CartItemRow key={`cart-item-${item.id}-${item.cartId}`} item={item} />
          ))}
        </ScrollView>

        <View style={styles.cartModalFooter}>
          {/* Coupon Section */}
          <View style={styles.couponSection}>
            {!appliedCoupon && !showCouponInput && (
              <TouchableOpacity 
                style={styles.couponButton}
                onPress={() => setShowCouponInput(true)}
              >
                <Text style={styles.couponButtonText}>Apply Coupon</Text>
              </TouchableOpacity>
            )}
            
            {showCouponInput && !appliedCoupon && (
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  style={styles.applyCouponButton}
                  onPress={handleApplyCoupon}
                >
                  <Text style={styles.applyCouponText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelCouponButton}
                  onPress={() => {
                    setShowCouponInput(false);
                    setCouponCode('');
                  }}
                >
                  <Text style={styles.cancelCouponText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {appliedCoupon && (
              <View style={styles.appliedCouponContainer}>
                <Text style={styles.appliedCouponText}>
                  Coupon "{appliedCoupon.code}" applied
                </Text>
                <TouchableOpacity onPress={removeCoupon}>
                  <Text style={styles.removeCouponText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.cartSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Coupon Discount</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>-₹{couponDiscount}</Text>
              </View>
            )}
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total Amount</Text>
              <Text style={styles.summaryValueTotal}>₹{formatPrice(cartTotal)}</Text>
            </View>
          </View>
          
          <View style={styles.cartModalActions}>
            <TouchableOpacity
              style={styles.clearCartButton}
              onPress={() => { clearCart(); onClose(); }}
            >
              <Text style={styles.clearCartText}>Clear Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkoutButton, loading && { opacity: 0.6 }]}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Bottom Tabs
const BottomTabs = ({ activeTab, cartCount }) => {
  const navigation = useNavigation();
  
// In your existing HomeScreen.js, update the tabs array:
const tabs = [
  { id: 'delivery', label: 'Home', icon: '🏠', activeColor: COLORS.primary, onPress: () => navigation.replace('Home') },
  { id: 'dining', label: 'Profile', icon: '👤', activeColor: COLORS.primary, onPress: () => navigation.replace('Profile') },
  { id: 'live', label: 'Support', icon: '💬', activeColor: COLORS.primary, onPress: () => {} },
  { id: 'reorder', label: 'Orders', icon: '📦', activeColor: COLORS.primary, onPress: () => navigation.replace('MyOrder') }, // ✅ Updated
];

  return (
    <View style={styles.bottomTabContainer}>
      <View style={styles.bottomTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={tab.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconContainer, activeTab === tab.id && styles.activeTabIcon]}>
              <Text style={[styles.tabIcon, { color: activeTab === tab.id ? tab.activeColor : COLORS.textSecondary }]}>
                {tab.icon}
              </Text>
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === tab.id ? tab.activeColor : COLORS.textSecondary }]}>
              {tab.label}
            </Text>
            {tab.id === 'reorder' && cartCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Memoized Item Components
const CategoryItem = React.memo(({ item, onPress, isSelected }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <Animated.View style={styles.categoryItem}>
      <TouchableOpacity onPress={() => onPress(item.id, item.name)} activeOpacity={0.7}>
        <View style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}>
          <View style={[styles.categoryIcon, isSelected && styles.selectedCategoryIcon]}>
            {!loaded && <SkeletonCard height={50} borderRadius={16} style={{ width: 50 }} />}
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.categoryImage, !loaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setLoaded(true)}
            />
          </View>
          <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
            {item.name}
          </Text>
          {isSelected && <View style={styles.categoryIndicator} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const RecommendedCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 150;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity style={styles.recommendedCard} onPress={() => onPress(item)} activeOpacity={0.9}>
      <View style={styles.recommendedImageContainer}>
        {!loaded && <SkeletonCard height={120} borderRadius={0} />}
        <Image
          source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
          style={[styles.recommendedImage, !loaded && { opacity: 0, position: 'absolute' }]}
          onLoadEnd={() => setLoaded(true)}
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.imageGradient} />
        {hasDiscount && (
          <View style={styles.recommendedOfferBadge}>
            <Text style={styles.offerText}>SALE</Text>
          </View>
        )}
        {item.average_rating > 0 && (
          <View style={styles.recommendedRatingBadge}>
            <Text style={styles.ratingText}>★ {item.average_rating}</Text>
          </View>
        )}
        <View style={styles.deliveryTime}>
          <Text style={styles.deliveryTimeText}>{item.preparation_time || 25} mins</Text>
        </View>
      </View>
      <View style={styles.recommendedInfo}>
        <Text style={styles.recommendedName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cuisineType}>
          {item.spice_level && item.spice_level !== 'None' ? `🌶️ ${item.spice_level}` : 'Delicious Food'}
        </Text>
        <View style={styles.recommendedFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{displayPrice}</Text>
            {hasDiscount && <Text style={styles.originalPriceText}>₹{item.price}</Text>}
          </View>
          <TouchableOpacity
            style={[styles.addButton, inCart && styles.addedButton]}
            onPress={handleAdd}
            disabled={adding}
          >
            <Text style={[styles.addButtonText, inCart && styles.addedButtonText]}>
              {adding ? 'ADDING...' : (inCart ? `IN CART (${quantity})` : 'ADD')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const TopSectionCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 180;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity style={styles.topSectionCard} onPress={() => onPress(item)} activeOpacity={0.9}>
      <View style={styles.topSectionImageContainer}>
        {!loaded && <SkeletonCard height={140} borderRadius={0} />}
        <Image
          source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
          style={[styles.topSectionImage, !loaded && { opacity: 0, position: 'absolute' }]}
          onLoadEnd={() => setLoaded(true)}
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.imageGradient} />
        {hasDiscount && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>SALE</Text>
          </View>
        )}
        {item.average_rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.average_rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.topSectionInfo}>
        <Text style={styles.topSectionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cuisineType}>
          {item.is_featured ? '⭐ Featured Item' : 'Popular Choice'}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>🕐 {item.preparation_time || 30} mins</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₹{displayPrice}</Text>
              {hasDiscount && <Text style={styles.originalPriceText}>₹{item.price}</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addButton, inCart && styles.addedButton]}
            onPress={handleAdd}
            disabled={adding}
          >
            <Text style={[styles.addButtonText, inCart && styles.addedButtonText]}>
              {adding ? 'ADDING...' : (inCart ? `IN CART (${quantity})` : 'ADD')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const FullRowCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 220;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(item, 1, { spice_level: item.spice_level });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity style={styles.fullCard} onPress={() => onPress(item)} activeOpacity={0.95}>
      <View style={styles.fullCardImageContainer}>
        {!loaded && <SkeletonCard height={100} borderRadius={0} style={{ width: width * 0.28 }} />}
        <Image
          source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
          style={[styles.fullCardImage, !loaded && { opacity: 0, position: 'absolute' }]}
          onLoadEnd={() => setLoaded(true)}
        />
        {hasDiscount && (
          <View style={styles.fullCardOfferBadge}>
            <Text style={styles.offerText}>SALE</Text>
          </View>
        )}
      </View>
      <View style={styles.fullCardContent}>
        <Text style={styles.fullCardName}>{item.name}</Text>
        <Text style={styles.cuisineType}>
          {item.is_featured ? '👑 Premium Restaurant' : 'Popular Restaurant'}
        </Text>
        <View style={styles.fullCardMeta}>
          <View style={styles.fullCardLeft}>
            {item.average_rating > 0 && (
              <View style={styles.fullCardRating}>
                <Text style={styles.ratingText}>★ {item.average_rating}</Text>
              </View>
            )}
            <View style={styles.deliveryPriceRow}>
              <Text style={styles.deliveryText}>• {item.preparation_time || 25} mins</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>₹{displayPrice}</Text>
                {hasDiscount && <Text style={styles.originalPriceText}>₹{item.price}</Text>}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addButton, inCart && styles.addedButton]}
            onPress={handleAdd}
            disabled={adding}
          >
            <Text style={[styles.addButtonText, inCart && styles.addedButtonText]}>
              {adding ? 'ADDING...' : (inCart ? `IN CART (${quantity})` : 'ADD')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Main Component with full API integration
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

  // Use the enhanced cart hook with error handling
  const cartHookResult = useCart();
  
  // Safely destructure cart hook results with defaults
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const flatListRef = useRef(null);

  const banners = [
    { id: '1', title: 'Free Delivery', subtitle: 'On orders above ₹199', emoji: '🚚', bg: [COLORS.primary, COLORS.primaryDark] },
    { id: '2', title: '50% OFF', subtitle: 'On your first order', emoji: '🎉', bg: [COLORS.secondary, COLORS.primaryDark] },
    { id: '3', title: 'Premium', subtitle: 'Unlimited free delivery', emoji: '👑', bg: [COLORS.accent, COLORS.secondary] },
  ];

  const VALID_SECTION_TYPES = ['topSection', 'recommendedForYouSection', 'fullCardSection'];

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
    // Refresh cart when screen gains focus
    const unsubscribe = navigation.addListener('focus', () => {
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        refreshCart();
      }
    });

    return unsubscribe;
  }, [navigation, cartItems]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const setupBannerCarousel = () => {
    const interval = setInterval(() => {
      setActiveSlide(current => {
        const next = (current + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
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
      console.log("Logs: ",sectionsResponse);
      
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
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
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

  // Skeleton Components
  const BannerSkeleton = () => (
    <View style={{ marginVertical: 16 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <SkeletonCard height={180} borderRadius={16} style={{ width: width - 40 }} />
      </View>
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map(i => <SkeletonCircle key={i} size={6} style={{ marginHorizontal: 3 }} />)}
      </View>
    </View>
  );

  const CategoriesSkeleton = () => (
    <View style={[styles.section, { paddingVertical: 8 }]}>
      <SkeletonLine height={20} width={180} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoriesContainer, { paddingTop: 10 }]}>
        {[...Array(6)].map((_, i) => (
          <View key={`cat-skel-${i}`} style={{ alignItems: 'center', marginRight: 24 }}>
            <SkeletonCard height={64} borderRadius={20} style={{ width: 64 }} />
            <SkeletonLine height={10} width={50} style={{ marginTop: 8 }} />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const RecommendedSkeleton = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <SkeletonLine height={18} width={160} />
          <SkeletonLine height={12} width={100} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.recommendedContainer}>
        <View style={styles.recommendedRow}>
          {[...Array(2)].map((_, i) => (
            <View key={`rec-row1-${i}`} style={styles.recommendedCard}>
              <SkeletonCard height={120} borderRadius={0} />
              <View style={{ padding: 12 }}>
                <SkeletonLine height={12} width={'80%'} />
                <SkeletonLine height={10} width={'40%'} style={{ marginTop: 8 }} />
                <SkeletonLine height={30} width={'100%'} borderRadius={10} style={{ marginTop: 12 }} />
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.recommendedRow, { marginTop: 16 }]}>
          {[...Array(2)].map((_, i) => (
            <View key={`rec-row2-${i}`} style={styles.recommendedCard}>
              <SkeletonCard height={120} borderRadius={0} />
              <View style={{ padding: 12 }}>
                <SkeletonLine height={12} width={'80%'} />
                <SkeletonLine height={10} width={'40%'} style={{ marginTop: 8 }} />
                <SkeletonLine height={30} width={'100%'} borderRadius={10} style={{ marginTop: 12 }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const TopSectionSkeleton = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <SkeletonLine height={18} width={160} />
          <SkeletonLine height={12} width={100} style={{ marginTop: 6 }} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topSectionContainer}>
        {[...Array(3)].map((_, i) => (
          <View key={`top-skel-${i}`} style={[styles.topSectionCard, { paddingBottom: 12 }]}>
            <SkeletonCard height={140} borderRadius={0} />
            <View style={{ padding: 12 }}>
              <SkeletonLine height={14} width={'70%'} />
              <SkeletonLine height={10} width={'50%'} style={{ marginTop: 8 }} />
              <SkeletonLine height={30} width={'100%'} borderRadius={10} style={{ marginTop: 12 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const FullCardSkeleton = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <SkeletonLine height={18} width={160} />
          <SkeletonLine height={12} width={100} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.fullCardContainer}>
        {[...Array(3)].map((_, i) => (
          <View key={`full-skel-${i}`} style={styles.fullCard}>
            <SkeletonCard height={100} borderRadius={0} style={{ width: width * 0.28 }} />
            <View style={styles.fullCardContent}>
              <SkeletonLine height={14} width={'70%'} />
              <View style={styles.fullCardMeta}>
                <SkeletonLine height={10} width={60} />
                <SkeletonLine height={12} width={80} />
              </View>
              <SkeletonLine height={30} width={'100%'} borderRadius={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBanner = ({ item }) => (
    <View style={styles.bannerWrapper}>
      <LinearGradient colors={item.bg} style={styles.bannerCard}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerEmoji}>{item.emoji}</Text>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Order Now</Text>
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

  const renderSection = (section, index) => {
    if (!section || !section.sectionData || section.sectionData.length === 0) return null;
    
    const sectionKey = `${section.type}-${section.id}-${index}`;
    const getSubtitle = (type) => {
      switch (type) {
        case 'recommendedForYouSection': return 'Curated just for you';
        case 'topSection': return 'Most popular nearby';
        case 'fullCardSection': return 'Premium dining options';
        default: return 'Explore more';
      }
    };

    if (section.type === 'recommendedForYouSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
          {sectionsLoading ? (
            <RecommendedSkeleton />
          ) : (
            <FlatList
              data={section.sectionData.slice(0, 6)}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => `${sectionKey}-recommended-${item.id}`}
              numColumns={2}
              contentContainerStyle={styles.recommendedContainer}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              columnWrapperStyle={styles.recommendedRow}
            />
          )}
        </Animated.View>
      );
    } else if (section.type === 'topSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
          {sectionsLoading ? (
            <TopSectionSkeleton />
          ) : (
            <FlatList
              data={section.sectionData}
              renderItem={renderTopSectionItem}
              keyExtractor={(item) => `${sectionKey}-top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topSectionContainer}
              snapToInterval={width * 0.75}
              decelerationRate="fast"
            />
          )}
        </Animated.View>
      );
    } else if (section.type === 'fullCardSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
          {sectionsLoading ? (
            <FullCardSkeleton />
          ) : (
            <View style={styles.fullCardContainer}>
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

  // Show skeleton loading instead of full-screen loader
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <SkeletonLine height={18} width={160} />
            </View>
            <SkeletonCircle size={36} />
          </View>
          <View style={styles.searchContainer}>
            <SkeletonLine height={18} width={'100%'} />
          </View>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <BannerSkeleton />
          <CategoriesSkeleton />
          <RecommendedSkeleton />
          <TopSectionSkeleton />
          <FullCardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationText}>📍 Phagwara, Punjab</Text>
              <Text style={styles.dropdownIcon}>⌄</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.replace('Profile')}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search for restaurant, cuisine or a dish</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
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
          />
        }
      >
        {/* Banner Carousel */}
        <Animated.View style={[styles.carouselSection, { opacity: fadeAnim }]}>
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
            snapToInterval={width - 40}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <View key={index} style={[styles.dot, activeSlide === index && styles.activeDot]} />
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        {homeFilters.length > 0 ? (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's on your mind?</Text>
            </View>
            <FlatList
              data={homeFilters}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </Animated.View>
        ) : (
          <CategoriesSkeleton />
        )}

        {/* Dynamic Sections */}
        {sections.length > 0 ? (
          sections.map((section, index) => renderSection(section, index))
        ) : (
          sectionsLoading ? (
            <>
              <RecommendedSkeleton />
              <TopSectionSkeleton />
              <FullCardSkeleton />
            </>
          ) : (
            <View style={styles.noSectionsContainer}>
              <Text style={styles.noSectionsText}>🍽️ Discover amazing restaurants in your area</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showProductModal}
        product={selectedProduct}
        onClose={() => setShowProductModal(false)}
        cartItems={cartItems}
        addToCart={addToCart}
      />

      {/* Floating Cart */}
      <FloatingCart
        cartItems={cartItems}
        cartTotal={formatPrice(cartTotal)}
        onPress={() => setShowCartModal(true)}
        onClose={handleCloseCart}
        syncing={syncing}
      />

      {/* Cart Modal */}
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

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} cartCount={cartCount} />

      {/* Floating Girl Assistant */}
      <FloatingGirlAssistant
        defaultVisible={true}
        size={72}
        startDock="right"
        bottomOffset={96}
        snapToEdges={true}
        bubbleMode="reposition"
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header Styles
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  dropdownIcon: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {},
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileIconText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: COLORS.textSecondary,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Banner Styles
  carouselSection: {
    marginVertical: 16,
  },
  bannerWrapper: {
    width: width - 40,
    paddingHorizontal: 4,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerButtonText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 16,
  },

  // Section Styles
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Category Styles
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryCard: {
    alignItems: 'center',
    position: 'relative',
  },
  selectedCategoryCard: {
    transform: [{ scale: 1.05 }],
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  selectedCategoryIcon: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Recommended Card Styles
  recommendedContainer: {
    paddingVertical: 8,
  },
  recommendedRow: {
    justifyContent: 'space-between',
  },
  recommendedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    width: (width - 48) / 2,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendedImageContainer: {
    position: 'relative',
    height: 120,
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  recommendedOfferBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendedRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deliveryTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cuisineType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  recommendedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priceText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  originalPriceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },

  // Top Section Card Styles
  topSectionContainer: {
    paddingVertical: 8,
  },
  topSectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginRight: 16,
    width: width * 0.7,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topSectionImageContainer: {
    position: 'relative',
    height: 140,
  },
  topSectionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offerText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  topSectionInfo: {
    padding: 12,
  },
  topSectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  deliveryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Full Card Styles
  fullCardContainer: {
    paddingVertical: 8,
  },
  fullCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fullCardImageContainer: {
    position: 'relative',
    width: width * 0.28,
  },
  fullCardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  fullCardOfferBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  fullCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  fullCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  fullCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  fullCardLeft: {
    flex: 1,
  },
  fullCardRating: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  // Add Button Styles
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // No Sections Container
  noSectionsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSectionsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Bottom Tab Styles
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bottomTabs: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabIconContainer: {
    marginBottom: 4,
  },
  activeTabIcon: {
    transform: [{ scale: 1.12 }],
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: width * 0.1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  tabBadgeText: {
    color: COLORS.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },

  // Floating Cart Styles
  floatingCartContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  floatingCart: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartItemsCount: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartItemsCountText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  cartInfo: {
    flex: 1,
  },
  cartItemsText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  cartExtraText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  cartRight: {
    alignItems: 'flex-end',
  },
  cartTotal: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  cartViewText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeCartButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeCartText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 2000,
    elevation: 20,
  },
  cartModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCloseText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  cartItemsList: {
    maxHeight: height * 0.4,
    paddingHorizontal: 20,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartItemImageContainer: {
    marginRight: 12,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cartItemSpice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  cartModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cartSummary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  cartModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearCartButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearCartText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Product Modal Styles
  productModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBackText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '800',
  },
  productModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalPlaceholder: {
    width: 40,
  },
  productModalContent: {
    flex: 1,
  },
  productImageContainer: {
    position: 'relative',
    height: 250,
  },
  productModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
  },
  productOfferBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productRatingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: COLORS.primary,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  productModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  priceSection: {
    marginRight: 16,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  priceNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

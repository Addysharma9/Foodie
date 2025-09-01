import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingGirlAssistant from './Animatedgirl';
import { useCart } from './hooks/useCart'; // Import your cart hook

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// Enhanced price formatting
const formatPrice = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Modern color palette
const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFE8E1',
  secondary: '#FF3008',
  accent: '#4ECDC4',
  warning: '#FFA726',
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  success: '#48BB78',
  error: '#F56565',
  info: '#4299E1',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  shadow: 'rgba(0, 0, 0, 0.08)',
  gradientPrimary: ['#FF6B35', '#FF8A65'],
  gradientSecondary: ['#4ECDC4', '#45B7D1'],
  gradientAccent: ['#667EEA', '#764BA2'],
};

const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  }
};

// Get image URL helper
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('products/') || imagePath.startsWith('categories/')) return `${baseURL}/storage/${imagePath}`;
  if (imagePath.startsWith('/products/') || imagePath.startsWith('/categories/')) return `${baseURL}/storage/${imagePath.slice(1)}`;
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath)) return `${baseURL}/storage/products/${imagePath}`;
  return `${baseURL}/storage/${imagePath}`;
};

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          color: COLORS.warning, 
          bgColor: COLORS.warning + '20', 
          icon: '⏳', 
          text: 'Pending'
        };
      case 'confirmed':
        return { 
          color: COLORS.info, 
          bgColor: COLORS.info + '20', 
          icon: '✅', 
          text: 'Confirmed'
        };
      case 'preparing':
        return { 
          color: COLORS.primary, 
          bgColor: COLORS.primaryLight, 
          icon: '👨‍🍳', 
          text: 'Preparing'
        };
      case 'on_way':
      case 'out_for_delivery':
        return { 
          color: COLORS.accent, 
          bgColor: COLORS.accent + '20', 
          icon: '🚗', 
          text: 'On the way'
        };
      case 'delivered':
        return { 
          color: COLORS.success, 
          bgColor: COLORS.success + '20', 
          icon: '🎉', 
          text: 'Delivered'
        };
      case 'cancelled':
        return { 
          color: COLORS.error, 
          bgColor: COLORS.error + '20', 
          icon: '❌', 
          text: 'Cancelled'
        };
      default:
        return { 
          color: COLORS.textMuted, 
          bgColor: COLORS.border, 
          icon: '📦', 
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Text style={styles.statusIcon}>{config.icon}</Text>
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Helper functions for status configuration
const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { 
        color: COLORS.warning, 
        bgColor: COLORS.warning + '20', 
        icon: '⏳', 
        text: 'Pending'
      };
    case 'confirmed':
      return { 
        color: COLORS.info, 
        bgColor: COLORS.info + '20', 
        icon: '✅', 
        text: 'Confirmed'
      };
    case 'preparing':
      return { 
        color: COLORS.primary, 
        bgColor: COLORS.primaryLight, 
        icon: '👨‍🍳', 
        text: 'Preparing'
      };
    case 'on_way':
    case 'out_for_delivery':
      return { 
        color: COLORS.accent, 
        bgColor: COLORS.accent + '20', 
        icon: '🚗', 
        text: 'On the way'
      };
    case 'delivered':
      return { 
        color: COLORS.success, 
        bgColor: COLORS.success + '20', 
        icon: '🎉', 
        text: 'Delivered'
      };
    case 'cancelled':
      return { 
        color: COLORS.error, 
        bgColor: COLORS.error + '20', 
        icon: '❌', 
        text: 'Cancelled'
      };
    default:
      return { 
        color: COLORS.textMuted, 
        bgColor: COLORS.border, 
        icon: '📦', 
        text: 'Unknown'
      };
  }
};

// Individual Order Item Card Component
const OrderItemCard = ({ orderItem, addToCart, isItemInCart, getItemQuantity }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Handle product data structure from API
  const product = orderItem.product || orderItem;
  const imageUri = getImageUrl(product.featured_image || product.image);
  
  // ✅ COMPLETELY FIXED: Better price extraction logic with proper validation
 // Inside your Order Item component

// Function to get the display price per item (used for calculations)
const getDisplayPrice = () => {
  // Possible price sources in order of priority
  const priceCandidates = [
    parseFloat(orderItem.unit_price),             // direct unit price on order item
    parseFloat(orderItem.price),                  // fallback price on order item
    parseFloat(orderItem.pivot?.price),           // pivot price if exists
    parseFloat(orderItem.product?.sale_price),    // sale price from nested product
    parseFloat(orderItem.product?.price),         // regular price from nested product
  ];

  for (const p of priceCandidates) {
    if (p && !isNaN(p) && p > 0) {
      console.log('Using price:', p);
      return p;
    }
  }
  console.warn('Fallback price: 150 used');
  return 150;  // fallback price if none found
};


// Function to get the current discounted price (if any)
const getCurrentSalePrice = () => {
  const salePrice = parseFloat(orderItem.product?.sale_price ?? orderItem.sale_price);
  const regularPrice = parseFloat(orderItem.product?.price ?? orderItem.price);

  if (salePrice && !isNaN(salePrice) && salePrice > 0 &&
      regularPrice && !isNaN(regularPrice) && salePrice < regularPrice) {
    return salePrice;
  }
  return null;  // no discount
};

// Function to get the current original price
const getCurrentOriginalPrice = () => {
  const price = parseFloat(orderItem.product?.price ?? orderItem.price);
  if (price && !isNaN(price) && price > 0) {
    return price;
  }
  return null;
};

// Inside component render or calculation logic
const displayPrice = getDisplayPrice();
const quantity = parseInt(orderItem.quantity || orderItem.total_quantity || 1);
const itemTotal = displayPrice * quantity;
const currentSalePrice = getCurrentSalePrice();
const currentOriginalPrice = getCurrentOriginalPrice();

console.log('Price debug:', {
  displayPrice, quantity, itemTotal, currentSalePrice, currentOriginalPrice,
  rawData: {
    unit_price: orderItem.unit_price,
    price: orderItem.price,
    pivot_price: orderItem.pivot?.price,
    product_sale_price: orderItem.product?.sale_price,
    product_price: orderItem.product?.price,
  }
});

  
  
  // Check if item is in current cart
  const inCart = isItemInCart ? isItemInCart(product.id || orderItem.id) : false;
  const cartQuantity = getItemQuantity ? getItemQuantity(product.id || orderItem.id) : 0;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // ✅ FIXED: Better cart price calculation
      const cartPrice = (() => {
        // Priority for cart price:
        // 1. Current sale price if it exists and is less than regular price
        if (currentSalePrice && currentOriginalPrice && currentSalePrice < currentOriginalPrice) {
          return currentSalePrice;
        }
        // 2. Current regular price
        if (currentOriginalPrice) {
          return currentOriginalPrice;
        }
        // 3. What was paid in this order
        return displayPrice;
      })();

      const itemToAdd = {
        id: product.id || orderItem.id,
        name: product.name || orderItem.name,
        price: cartPrice, // Use calculated cart price
        featured_image: product.featured_image || product.image,
        description: product.description || '',
        spice_level: product.spice_level || 'None',
        preparation_time: product.preparation_time || 25,
        sale_price: currentSalePrice, // Current sale price or null
        original_price: currentOriginalPrice || cartPrice, // Original price for reference
        is_featured: product.is_featured || false,
        average_rating: product.average_rating || 0,
      };

      console.log('🛒 Adding to cart with corrected prices:', {
        name: itemToAdd.name,
        cartPrice: cartPrice,
        displayPrice: displayPrice,
        currentSalePrice: currentSalePrice,
        currentOriginalPrice: currentOriginalPrice,
        finalItemPrice: itemToAdd.price
      });

      const result = await addToCart(itemToAdd, 1, {
        spice_level: product.spice_level
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Debug logging with more detail
  console.log('📊 Order Item Debug:', {
    productId: product.id,
    productName: product.name,
    displayPrice,
    currentSalePrice,
    currentOriginalPrice,
    quantity,
    itemTotal,
    rawData: {
      pivotPrice: orderItem.pivot?.price,
      orderItemPrice: orderItem.price,
      productPrice: product.price,
      productSalePrice: product.sale_price
    }
  });

  return (
    <View style={styles.orderItemCard}>
      {/* Order Info Header */}
      <View style={styles.orderItemHeader}>
        <View style={styles.orderMetaInfo}>
          <Text style={styles.orderNumber}>Order #{orderItem.order_number || orderItem.order_id}</Text>
          <Text style={styles.orderDate}>
            {formatDate(orderItem.order_created_at || orderItem.created_at)}
          </Text>
        </View>
        <OrderStatusBadge status={orderItem.order_status} />
      </View>

      {/* Main Content */}
      <View style={styles.itemMainContent}>
        {/* Product Image */}
        <View style={styles.itemImageContainer}>
          {!imageLoaded && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={[styles.itemImage, !imageLoaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setImageLoaded(true)}
              resizeMode="cover"
            />
          )}
          {product.spice_level && product.spice_level !== 'None' && (
            <View style={styles.spiceLevelBadge}>
              <Text style={styles.spiceLevelText}>🌶️</Text>
            </View>
          )}
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>×{quantity}</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {product.name || orderItem.name}
          </Text>
          
          {(product.description || orderItem.description) && (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {product.description || orderItem.description}
            </Text>
          )}

          {/* Item Specifications */}
          <View style={styles.itemSpecs}>
            {product.spice_level && product.spice_level !== 'None' && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Spice:</Text>
                <Text style={styles.specValue}>{product.spice_level}</Text>
              </View>
            )}
            {product.preparation_time && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Prep Time:</Text>
                <Text style={styles.specValue}>{product.preparation_time} mins</Text>
              </View>
            )}
            {product.average_rating && product.average_rating > 0 && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Rating:</Text>
                <Text style={styles.specValue}>★ {product.average_rating}</Text>
              </View>
            )}
          </View>

          {/* Pricing - Show what was actually paid for this order */}
          <View style={styles.pricingSection}>
            <View style={styles.priceBreakdown}>
              <Text style={styles.unitPrice}>
                ₹{formatPrice(displayPrice)} × {quantity}
              </Text>
              <Text style={styles.itemTotal}>₹{formatPrice(itemTotal)}</Text>
            </View>
            
            {/* Show discount info if there was a discount on this order */}
            {orderItem.pivot?.price && product.price && 
             parseFloat(orderItem.pivot.price) < parseFloat(product.price) && (
              <View style={styles.discountInfo}>
                <Text style={styles.originalPrice}>₹{formatPrice(product.price)}</Text>
                <Text style={styles.savedAmount}>
                  You saved ₹{formatPrice((parseFloat(product.price) - parseFloat(orderItem.pivot.price)) * quantity)}
                </Text>
              </View>
            )}
            
            {/* Show current product discount (for items being added to cart) */}
            {currentSalePrice && currentOriginalPrice && currentSalePrice < currentOriginalPrice && (
              <Text style={styles.currentDiscount}>
                🏷️ Current price: ₹{formatPrice(currentSalePrice)} (was ₹{formatPrice(currentOriginalPrice)})
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Order Actions */}
      <View style={styles.itemActions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.addToCartButton, inCart && styles.addedButton, addingToCart && styles.loadingButton]}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            <View style={[styles.addToCartGradient, inCart && styles.addedButtonBg]}>
              <Text style={[styles.addToCartButtonText, inCart && styles.addedButtonText]}>
                {addingToCart ? 'Adding...' : (inCart ? `In Cart (${cartQuantity})` : 'Add to Cart')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Estimate */}
        {(orderItem.order_status === 'preparing' || orderItem.order_status === 'on_way' || orderItem.order_status === 'out_for_delivery') && (
          <View style={styles.deliveryEstimate}>
            <Text style={styles.estimateIcon}>🕒</Text>
            <Text style={styles.estimateText}>
              {orderItem.order_status === 'preparing' 
                ? 'Preparing your order...' 
                : 'On the way to you!'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Order Progress Indicator */}
      <View style={styles.progressIndicator}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${getProgressPercentage(orderItem.order_status)}%`,
                backgroundColor: getStatusConfig(orderItem.order_status).color
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {getProgressText(orderItem.order_status)}
        </Text>
      </View>
    </View>
  );
};

// Helper functions for progress
const getProgressPercentage = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 10;
    case 'confirmed': return 25;
    case 'preparing': return 50;
    case 'on_way': case 'out_for_delivery': return 75;
    case 'delivered': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

const getProgressText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Order received, awaiting confirmation';
    case 'confirmed': return 'Order confirmed, starting preparation';
    case 'preparing': return 'Your delicious meal is being prepared';
    case 'on_way': case 'out_for_delivery': return 'On the way to your location';
    case 'delivered': return 'Delivered successfully! Enjoy your meal';
    case 'cancelled': return 'Order was cancelled';
    default: return 'Status update pending';
  }
};

// Function to group items by product ID and sum quantities
const groupOrderItems = (items) => {
  const groupedItems = {};
  
  items.forEach(item => {
    const product = item.product || item;
    const productId = product.id || item.id;
    const key = `${productId}-${item.order_status}`;
    
    if (groupedItems[key]) {
      // Add to existing group - sum quantities and preserve price info
      const existingQty = parseInt(groupedItems[key].total_quantity || groupedItems[key].quantity || 1);
      const newQty = parseInt(item.quantity || 1);
      groupedItems[key].total_quantity = existingQty + newQty;
      
      // Keep the most recent order date
      if (new Date(item.order_created_at) > new Date(groupedItems[key].order_created_at)) {
        groupedItems[key].order_created_at = item.order_created_at;
        groupedItems[key].order_id = item.order_id;
        groupedItems[key].order_number = item.order_number;
      }
    } else {
      // Create new group
      groupedItems[key] = {
        ...item,
        total_quantity: parseInt(item.quantity || 1),
        unique_key: key
      };
    }
  });
  
  return Object.values(groupedItems);
};

// Main MyOrder Component
export default function MyOrder() {
  const navigation = useNavigation();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [userId, setUserId] = useState(null);

  // Use the cart hook
  const cartHookResult = useCart();
  const {
    addToCart = () => Promise.resolve({ success: false }),
    getItemQuantity = () => 0,
    isItemInCart = () => false,
  } = cartHookResult || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    getUserId();
    animateIn();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOrderItems();
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const email = await AsyncStorage.getItem('@user_email');
      console.log('Retrieved email from storage:', email);

      if (!email) {
        console.log('No email found');
        Alert.alert('Error', 'No user email found. Please login again.', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
        return;
      }

      const response = await fetch(`${baseURL}/api/get-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('User data:', data);
      
      if (data && data.data && data.data.id) {
        setUserId(data.data.id);
        console.log('User ID set:', data.data.id);
      } else {
        throw new Error('Invalid user data received');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data. Please try again.', [
        { text: 'Retry', onPress: getUserId },
        { text: 'Go Home', onPress: () => navigation.replace('Home') }
      ]);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  // Fetch and flatten order items from products array
  const fetchOrderItems = async () => {
    if (!userId) {
      console.log('No userId available for fetching orders');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching orders for user ID:', userId);
      
      const response = await fetch(`${baseURL}/api/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Orders fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data received:', JSON.stringify(data, null, 2));
        
        let ordersArray = [];
        if (Array.isArray(data)) {
          ordersArray = data;
        } else if (data && Array.isArray(data.data)) {
          ordersArray = data.data;
        } else if (data && data.orders && Array.isArray(data.orders)) {
          ordersArray = data.orders;
        }
        
        // Flatten orders into individual items using products array
        const flattenedItems = [];
        ordersArray.forEach(order => {
          // Use 'products' instead of 'items' as shown in your API response
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach((item, index) => {
              flattenedItems.push({
                ...item,
                // Include product details if available in pivot
                product: item.product || item,
                order_id: order.id,
                order_number: order.order_number,
                order_status: order.status,
                order_created_at: order.created_at,
                order_total: order.total_amount,
                delivery_address: order.delivery_address,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                // ✅ FIXED: Better price and quantity extraction with validation
                quantity: item.pivot?.quantity || item.quantity || 1,
                price: (() => {
                  // Validate and return first valid price
                  const sources = [item.pivot?.price, item.sale_price, item.price];
                  for (const price of sources) {
                    const parsed = parseFloat(price);
                    if (price && !isNaN(parsed) && parsed > 0) {
                      return parsed;
                    }
                  }
                  return 150; // Fallback only if no valid price found
                })(),
                // Generate unique key for each item instance
                unique_key: `${order.id}-${item.id || item.product_id}-${index}-${Date.now()}`
              });
            });
          }
        });

        // Group items by product ID and status, summing quantities
        const groupedItems = groupOrderItems(flattenedItems);

        // Sort by order creation date (newest first)
        groupedItems.sort((a, b) => new Date(b.order_created_at) - new Date(a.order_created_at));
        
        setOrderItems(groupedItems);
        console.log('Order items set:', groupedItems.length, 'items');
        console.log('Sample item:', JSON.stringify(groupedItems[0], null, 2));
        
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', response.status, errorText);
        setOrderItems([]);
        
        if (response.status === 404) {
          console.log('No orders found for user');
        } else {
          Alert.alert('Error', 'Failed to load orders. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderItems([]);
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderItems();
    setRefreshing(false);
  };

  const filterItems = (status) => {
    if (status === 'all') return orderItems;
    if (status === 'on_way') {
      return orderItems.filter(item => 
        item.order_status?.toLowerCase() === 'on_way' || 
        item.order_status?.toLowerCase() === 'out_for_delivery'
      );
    }
    return orderItems.filter(item => item.order_status?.toLowerCase() === status);
  };

  const getFilteredItems = () => {
    return filterItems(activeTab);
  };

  const tabs = [
    { id: 'all', label: 'All Items', count: orderItems.length },
    { id: 'pending', label: 'Pending', count: filterItems('pending').length },
    { id: 'confirmed', label: 'Confirmed', count: filterItems('confirmed').length },
    { id: 'on_way', label: 'On the way', count: filterItems('on_way').length + filterItems('out_for_delivery').length },
    { id: 'delivered', label: 'Delivered', count: filterItems('delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: filterItems('cancelled').length },
  ];

  const renderOrderItem = ({ item }) => (
    <OrderItemCard 
      orderItem={item} 
      addToCart={addToCart}
      isItemInCart={isItemInCart}
      getItemQuantity={getItemQuantity}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No order items yet</Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'all' 
          ? "You haven't ordered any items yet. Start exploring delicious food!"
          : `No ${activeTab.replace('_', ' ')} items found.`
        }
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.replace('Home')}
      >
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.exploreGradient}>
          <Text style={styles.exploreButtonText}>Explore Food</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (!userId && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Enhanced Header */}
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.replace('Home')} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Track your food items</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.id && styles.activeTabBadge]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.activeTabBadgeText]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Order Items List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your order items...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.unique_key}
            contentContainerStyle={styles.itemsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </Animated.View>

      {/* Floating Girl Assistant */}
      <FloatingGirlAssistant
        defaultVisible={true}
        size={72}
        startDock="right"
        bottomOffset={50}
        snapToEdges={true}
        bubbleMode="reposition"
      />
    </SafeAreaView>
  );
}

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textInverse,
    fontWeight: FONTS.weights.bold,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONTS.weights.medium,
  },
  headerPlaceholder: {
    width: 44,
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: FONTS.weights.bold,
  },
  tabBadge: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textInverse,
  },
  activeTabBadgeText: {
    color: COLORS.textInverse,
  },
  content: {
    flex: 1,
  },
  itemsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Individual Item Card Styles
  orderItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderMetaInfo: {},
  orderNumber: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  itemMainContent: {
    flexDirection: 'row',
    padding: 20,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    fontSize: FONTS.sizes.xl,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  spiceLevelBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spiceLevelText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textInverse,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textInverse,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  itemDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemSpecs: {
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    marginRight: 6,
  },
  specValue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.semiBold,
  },
  pricingSection: {
    marginTop: 'auto',
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  itemTotal: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
  },
  discountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  savedAmount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: FONTS.weights.bold,
  },
  // ✅ NEW: Style for current discount info
  currentDiscount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
    fontWeight: FONTS.weights.medium,
    fontStyle: 'italic',
  },
  itemActions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  addToCartButton: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addedButton: {
    opacity: 0.8,
  },
  loadingButton: {
    opacity: 0.6,
  },
  addToCartGradient: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  addedButtonBg: {
    backgroundColor: COLORS.success,
  },
  addToCartButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  addedButtonText: {
    color: COLORS.textInverse,
  },
  helpButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  estimateIcon: {
    fontSize: FONTS.sizes.sm,
    marginRight: 8,
  },
  estimateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontWeight: FONTS.weights.medium,
  },
  progressIndicator: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },

  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: FONTS.sizes.sm,
    marginRight: 6,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  exploreGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
});

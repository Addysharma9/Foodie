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
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingGirlAssistant from './Animatedgirl';
import { useCart } from './hooks/useCart';

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// Responsive dimensions
const isTablet = width > 768;
const CARD_MARGIN = width * 0.04;
const CARD_PADDING = width * 0.04;

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

// Professional color palette
const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceAlt: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradientPrimary: ['#2563eb', '#1d4ed8'],
  gradientSecondary: ['#06b6d4', '#0891b2'],
  gradientSuccess: ['#10b981', '#059669'],
  gradientError: ['#ef4444', '#dc2626'],
};

const FONTS = {
  sizes: {
    xs: width * 0.03,
    sm: width * 0.035,
    base: width * 0.04,
    lg: width * 0.045,
    xl: width * 0.05,
    xxl: width * 0.06,
    xxxl: width * 0.08,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
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

// Skeleton Loading Components
const SkeletonCard = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonText, styles.skeletonOrderNumber, { opacity }]} />
        <Animated.View style={[styles.skeletonBadge, { opacity }]} />
      </View>
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonImage, { opacity }]} />
        <View style={styles.skeletonDetails}>
          <Animated.View style={[styles.skeletonText, styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonText, styles.skeletonDescription, { opacity }]} />
          <Animated.View style={[styles.skeletonText, styles.skeletonPrice, { opacity }]} />
        </View>
      </View>
      <View style={styles.skeletonActions}>
        <Animated.View style={[styles.skeletonButton, styles.skeletonButtonLarge, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, styles.skeletonButtonSmall, { opacity }]} />
      </View>
    </View>
  );
};

// Professional Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          color: COLORS.warning, 
          gradient: [COLORS.warning, '#f97316'],
          text: 'Pending',
          icon: 'clock'
        };
      case 'confirmed':
        return { 
          color: COLORS.info, 
          gradient: [COLORS.info, '#1e40af'],
          text: 'Confirmed',
          icon: 'check'
        };
      case 'preparing':
        return { 
          color: COLORS.primary, 
          gradient: COLORS.gradientPrimary,
          text: 'Preparing',
          icon: 'cooking'
        };
      case 'on_way':
      case 'out_for_delivery':
        return { 
          color: COLORS.accent, 
          gradient: COLORS.gradientSecondary,
          text: 'On the way',
          icon: 'truck'
        };
      case 'delivered':
        return { 
          color: COLORS.success, 
          gradient: COLORS.gradientSuccess,
          text: 'Delivered',
          icon: 'check-circle'
        };
      case 'cancelled':
        return { 
          color: COLORS.error, 
          gradient: COLORS.gradientError,
          text: 'Cancelled',
          icon: 'x'
        };
      default:
        return { 
          color: COLORS.textMuted, 
          gradient: [COLORS.textMuted, COLORS.textSecondary],
          text: 'Unknown',
          icon: 'help'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <LinearGradient colors={config.gradient} style={styles.statusBadge}>
      <View style={styles.statusIndicator} />
      <Text style={styles.statusText}>{config.text}</Text>
    </LinearGradient>
  );
};

// Enhanced Individual Order Item Card Component
const OrderItemCard = ({ orderItem, addToCart, isItemInCart, getItemQuantity }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Handle product data structure from API
  const product = orderItem.product || orderItem;
  const imageUri = getImageUrl(product.featured_image || product.image);
  
  // Price calculation functions
  const getDisplayPrice = () => {
    const priceCandidates = [
      parseFloat(orderItem.unit_price),
      parseFloat(orderItem.price),
      parseFloat(orderItem.pivot?.price),
      parseFloat(orderItem.product?.sale_price),
      parseFloat(orderItem.product?.price),
    ];

    for (const p of priceCandidates) {
      if (p && !isNaN(p) && p > 0) {
        return p;
      }
    }
    return 150;
  };

  const getCurrentSalePrice = () => {
    const salePrice = parseFloat(orderItem.product?.sale_price ?? orderItem.sale_price);
    const regularPrice = parseFloat(orderItem.product?.price ?? orderItem.price);

    if (salePrice && !isNaN(salePrice) && salePrice > 0 &&
        regularPrice && !isNaN(regularPrice) && salePrice < regularPrice) {
      return salePrice;
    }
    return null;
  };

  const getCurrentOriginalPrice = () => {
    const price = parseFloat(orderItem.product?.price ?? orderItem.price);
    if (price && !isNaN(price) && price > 0) {
      return price;
    }
    return null;
  };

  const displayPrice = getDisplayPrice();
  const quantity = parseInt(orderItem.quantity || orderItem.total_quantity || 1);
  const itemTotal = displayPrice * quantity;
  const currentSalePrice = getCurrentSalePrice();
  const currentOriginalPrice = getCurrentOriginalPrice();
  
  // Check if item is in current cart
  const inCart = isItemInCart ? isItemInCart(product.id || orderItem.id) : false;
  const cartQuantity = getItemQuantity ? getItemQuantity(product.id || orderItem.id) : 0;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    Vibration.vibrate(50);
    
    try {
      const cartPrice = (() => {
        if (currentSalePrice && currentOriginalPrice && currentSalePrice < currentOriginalPrice) {
          return currentSalePrice;
        }
        if (currentOriginalPrice) {
          return currentOriginalPrice;
        }
        return displayPrice;
      })();

      const itemToAdd = {
        id: product.id || orderItem.id,
        name: product.name || orderItem.name,
        price: cartPrice,
        featured_image: product.featured_image || product.image,
        description: product.description || '',
        spice_level: product.spice_level || 'None',
        preparation_time: product.preparation_time || 25,
        sale_price: currentSalePrice,
        original_price: currentOriginalPrice || cartPrice,
        is_featured: product.is_featured || false,
        average_rating: product.average_rating || 0,
      };

      const result = await addToCart(itemToAdd, 1, {
        spice_level: product.spice_level
      });
      
      if (result.success) {
        Alert.alert('Success', `${product.name} added to cart successfully!`);
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

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
              <Text style={styles.placeholderText}>Loading...</Text>
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
          
          {/* Quantity Badge */}
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>×{quantity}</Text>
          </View>

          {/* Rating Badge */}
          {product.average_rating && product.average_rating > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {product.average_rating}</Text>
            </View>
          )}
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
                <Text style={styles.specLabel}>Spice Level:</Text>
                <Text style={styles.specValue}>{product.spice_level}</Text>
              </View>
            )}
            {product.preparation_time && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Prep Time:</Text>
                <Text style={styles.specValue}>{product.preparation_time} mins</Text>
              </View>
            )}
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <View style={styles.priceBreakdown}>
              <Text style={styles.unitPrice}>
                ₹{formatPrice(displayPrice)} × {quantity}
              </Text>
              <Text style={styles.itemTotal}>₹{formatPrice(itemTotal)}</Text>
            </View>
            
            {orderItem.pivot?.price && product.price && 
             parseFloat(orderItem.pivot.price) < parseFloat(product.price) && (
              <View style={styles.discountInfo}>
                <Text style={styles.originalPrice}>Was ₹{formatPrice(product.price)}</Text>
                <Text style={styles.savedAmount}>
                  Saved ₹{formatPrice((parseFloat(product.price) - parseFloat(orderItem.pivot.price)) * quantity)}
                </Text>
              </View>
            )}
            
            {currentSalePrice && currentOriginalPrice && currentSalePrice < currentOriginalPrice && (
              <Text style={styles.currentDiscount}>
                Current offer: ₹{formatPrice(currentSalePrice)} (was ₹{formatPrice(currentOriginalPrice)})
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.addToCartButton, inCart && styles.addedButton, addingToCart && styles.loadingButton]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          <Text style={styles.addToCartButtonText}>
            {addingToCart ? 'Adding...' : (inCart ? `In Cart (${cartQuantity})` : 'Add to Cart')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
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

// Helper functions for status configuration
const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { color: COLORS.warning, text: 'Pending' };
    case 'confirmed':
      return { color: COLORS.info, text: 'Confirmed' };
    case 'preparing':
      return { color: COLORS.primary, text: 'Preparing' };
    case 'on_way':
    case 'out_for_delivery':
      return { color: COLORS.accent, text: 'On the way' };
    case 'delivered':
      return { color: COLORS.success, text: 'Delivered' };
    case 'cancelled':
      return { color: COLORS.error, text: 'Cancelled' };
    default:
      return { color: COLORS.textMuted, text: 'Unknown' };
  }
};

// Helper functions for progress
const getProgressPercentage = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 20;
    case 'confirmed': return 40;
    case 'preparing': return 60;
    case 'on_way': case 'out_for_delivery': return 80;
    case 'delivered': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

const getProgressText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Order received and being processed';
    case 'confirmed': return 'Order confirmed, preparation starting';
    case 'preparing': return 'Your order is being prepared';
    case 'on_way': case 'out_for_delivery': return 'Order is on the way to you';
    case 'delivered': return 'Order delivered successfully';
    case 'cancelled': return 'Order was cancelled';
    default: return 'Checking order status...';
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
      const existingQty = parseInt(groupedItems[key].total_quantity || groupedItems[key].quantity || 1);
      const newQty = parseInt(item.quantity || 1);
      groupedItems[key].total_quantity = existingQty + newQty;
      
      if (new Date(item.order_created_at) > new Date(groupedItems[key].order_created_at)) {
        groupedItems[key].order_created_at = item.order_created_at;
        groupedItems[key].order_id = item.order_id;
        groupedItems[key].order_number = item.order_number;
      }
    } else {
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

      if (!email) {
        Alert.alert('Authentication Required', 'Please login to view your orders', [
          { text: 'Login', onPress: () => navigation.replace('Login') }
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
      
      if (data && data.data && data.data.id) {
        setUserId(data.data.id);
      } else {
        throw new Error('Invalid user data received');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Connection Error', 'Unable to load user data. Please try again.', [
        { text: 'Retry', onPress: getUserId },
        { text: 'Go Home', onPress: () => navigation.replace('Home') }
      ]);
    }
  };

  const animateIn = () => {
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 300, 
      useNativeDriver: true 
    }).start();
  };

  // Fetch and flatten order items from products array
  const fetchOrderItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${baseURL}/api/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let ordersArray = [];
        if (Array.isArray(data)) {
          ordersArray = data;
        } else if (data && Array.isArray(data.data)) {
          ordersArray = data.data;
        } else if (data && data.orders && Array.isArray(data.orders)) {
          ordersArray = data.orders;
        }
        
        const flattenedItems = [];
        ordersArray.forEach(order => {
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach((item, index) => {
              flattenedItems.push({
                ...item,
                product: item.product || item,
                order_id: order.id,
                order_number: order.order_number,
                order_status: order.status,
                order_created_at: order.created_at,
                order_total: order.total_amount,
                delivery_address: order.delivery_address,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                quantity: item.pivot?.quantity || item.quantity || 1,
                price: (() => {
                  const sources = [item.pivot?.price, item.sale_price, item.price];
                  for (const price of sources) {
                    const parsed = parseFloat(price);
                    if (price && !isNaN(parsed) && parsed > 0) {
                      return parsed;
                    }
                  }
                  return 150;
                })(),
                unique_key: `${order.id}-${item.id || item.product_id}-${index}-${Date.now()}`
              });
            });
          }
        });

        const groupedItems = groupOrderItems(flattenedItems);
        groupedItems.sort((a, b) => new Date(b.order_created_at) - new Date(a.order_created_at));
        
        setOrderItems(groupedItems);
        
      } else {
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
      Alert.alert('Network Error', 'Please check your connection and try again.');
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

  // Professional tabs
  const tabs = [
    { id: 'all', label: 'All Orders', count: orderItems.length },
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

  const renderSkeletonItem = ({ item }) => <SkeletonCard />;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'all' ? 'No orders yet' : 'No orders found'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'all' 
          ? "Start exploring our menu to place your first order"
          : `No ${activeTab.replace('_', ' ')} orders found. Try a different filter.`
        }
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.exploreButtonText}>Explore Menu</Text>
      </TouchableOpacity>
    </View>
  );

  if (!userId && loading) {
    return (
     <>
     </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.replace('Home')} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Track your order history</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

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
              onPress={() => {
                setActiveTab(tab.id);
                Vibration.vibrate(30);
              }}
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
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loading ? (
          <FlatList
            data={Array(5).fill({})}
            renderItem={renderSkeletonItem}
            keyExtractor={(item, index) => `skeleton-${index}`}
            contentContainerStyle={styles.itemsContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.unique_key}
            contentContainerStyle={[
              styles.itemsContainer,
              getFilteredItems().length === 0 && styles.emptyContentContainer
            ]}
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

      {/* Floating Assistant */}
      <FloatingGirlAssistant
        defaultVisible={true}
        size={isTablet ? 80 : 60}
        startDock="right"
        bottomOffset={50}
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
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScrollContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: FONTS.weights.semiBold,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    padding: CARD_MARGIN,
    paddingBottom: 100,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  
  // Order Item Card Styles
  orderItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: CARD_MARGIN,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingTop: CARD_PADDING,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderMetaInfo: {},
  orderNumber: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.regular,
  },
  itemMainContent: {
    flexDirection: 'row',
    padding: CARD_PADDING,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  imagePlaceholder: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  itemImage: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    borderRadius: 12,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  quantityText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textInverse,
  },
  ratingBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textInverse,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: FONTS.sizes.base * 1.3,
  },
  itemDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: FONTS.sizes.sm * 1.4,
  },
  itemSpecs: {
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
    fontWeight: FONTS.weights.medium,
  },
  pricingSection: {
    marginTop: 'auto',
    backgroundColor: COLORS.surfaceAlt,
    padding: 8,
    borderRadius: 8,
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.regular,
  },
  itemTotal: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  discountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  savedAmount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: FONTS.weights.medium,
  },
  currentDiscount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
    fontWeight: FONTS.weights.medium,
    backgroundColor: COLORS.info + '20',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 12,
    gap: 8,
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: COLORS.success,
  },
  loadingButton: {
    opacity: 0.7,
  },
  addToCartButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
  },
  helpButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  progressIndicator: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: CARD_PADDING,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textInverse,
    marginRight: 6,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textInverse,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.sizes.base * 1.5,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },

  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: CARD_MARGIN,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  skeletonContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonImage: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    marginRight: 16,
  },
  skeletonDetails: {
    flex: 1,
  },
  skeletonText: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonOrderNumber: {
    width: 100,
    height: 16,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  skeletonTitle: {
    width: '100%',
    height: 20,
  },
  skeletonDescription: {
    width: '80%',
    height: 16,
  },
  skeletonPrice: {
    width: '60%',
    height: 18,
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
  },
  skeletonButtonLarge: {
    flex: 2,
  },
  skeletonButtonSmall: {
    flex: 1,
  },
});

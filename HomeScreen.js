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
  ActivityIndicator,
  RefreshControl,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import FloatingGirlAssistant from './Animatedgirl';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// Swiggy-inspired orange color palette
const COLORS = {
  // Brand core
  primary: '#4A90E2',        // Calmer blue for CTAs
  primaryDark: '#2C6CB0',    // Pressed/active state
  primaryLight: '#D6E9FA',   // Light tint for fills or backgrounds

  // Secondary accents
  secondary: '#F7638D',      // Warm coral for secondary actions
  accent: '#FFB86F',         // Soft orange for badges/highlights

  // Surfaces
  background: '#FAFAFA',     // Light, neutral app canvas
  surface: '#FFFFFF',        // Card or modal background

  // Text
  text: '#2D2D2D',           // Dark neutral for readability
  textSecondary: '#6B7280',  // Muted text
  textMuted: '#9CA3AF',      // Hints/placeholders

  // Status
  success: '#22C55E',        // Green for positive feedback
  error: '#EF4444',          // Vivid red for errors
  warning: '#F59E0B',        // Amber for warnings
  info: '#3B82F6',           // Blue for informative messages

  // Lines and elevation
  border: '#E5E7EB',         // Soft borders
  divider: '#F3F4F6',        // Very subtle separators
  shadow: 'rgba(0, 0, 0, 0.05)', // Gentle elevation

  // Optional gradients
  gradientStart: '#4A90E2',
  gradientEnd: '#F7638D',
};

// Product Detail Modal
const ProductDetailModal = ({ visible, product, onClose, onAddToCart, cartItems }) => {
  const [quantity, setQuantity] = useState(1);
  
  if (!visible || !product) return null;

  const existingCartItem = cartItems.find(item => item.id === product.id);
  const currentQuantity = existingCartItem?.quantity || 0;

  // Use real price from API, with fallback to sale_price if available
  const displayPrice = product.sale_price || product.price || 150;
  const originalPrice = product.sale_price ? product.price : null;

  const handleAddToCart = () => {
    const productWithDetails = {
      ...product,
      price: displayPrice,
      quantity: quantity,
    };
    onAddToCart(productWithDetails, quantity);
    onClose();
  };

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
            <Image 
              source={{ uri: product.featured_image || product.imageUrl }} 
              style={styles.productModalImage} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
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
                  <>
              <View style={styles.metaItem}>
                
                  <Text style={styles.metaText}>{product.spice_level}</Text>
                  <Text style={styles.metaIcon}>🌶️</Text>
                  </View>
                  </>
)}

              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🌟</Text>
                <Text style={styles.metaText}>
                  {product.is_featured ? 'Featured' : 'Popular'}
                </Text>
              </View>
            </View>

            {/* Ingredients */}
            {/* Ingredients - SAFE VERSION */}
{/* Ingredients - SAFE PARSER VERSION */}
{(() => {
  const getSafeIngredients = () => {
    try {
      if (!product.ingredients) return [];
      if (Array.isArray(product.ingredients)) return product.ingredients;
      if (typeof product.ingredients === 'string') {
        // Try to parse as JSON first
        const parsed = JSON.parse(product.ingredients);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      // If JSON parsing fails, try splitting by comma
      if (typeof product.ingredients === 'string') {
        return product.ingredients.split(',').map(item => item.trim()).filter(item => item);
      }
      return [];
    }
  };

  const safeIngredients = getSafeIngredients();
  return safeIngredients.length > 0 && (
    <View style={styles.ingredientsSection}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.ingredientsList}>
        {safeIngredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientTag}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
    </View>
  );
})()}



            {/* Quantity Selection */}
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

        {/* Bottom Action Bar */}
        <View style={styles.productModalFooter}>
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPrice}>₹{displayPrice * quantity}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>₹{originalPrice * quantity}</Text>
              )}
            </View>
            <Text style={styles.priceNote}>Total Amount</Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartButtonText}>
              Add to Cart {currentQuantity > 0 && `(${currentQuantity} in cart)`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Floating Cart Component
const FloatingCart = ({ cartItems, cartTotal, onPress, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    if (cartItems.length > 0) {
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
  }, [cartItems.length]);

  if (cartItems.length === 0) return null;

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
            <Text style={styles.cartItemsCountText}>{cartItems.length}</Text>
          </View>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemsText}>
              {cartItems.length} item{cartItems.length > 1 ? 's' : ''} added
            </Text>
            <Text style={styles.cartExtraText}>Tap to review order</Text>
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

// Cart Item Management Hook
const useCart = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, qty = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + qty }
            : cartItem
        );
      }
      return [...prev, { 
        ...item, 
        quantity: qty,
        price: item.sale_price || item.price || 150
      }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};

// Cart Details Modal
const CartModal = ({ visible, cartItems, cartTotal, onClose, updateQuantity, clearCart }) => {
  if (!visible) return null;

  const handlePlaceOrder = () => {
    clearCart();
    onClose();
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
          {cartItems.map((item) => (
            <View key={`${item.id}-${item.slug || 'item'}`} style={styles.cartItemRow}>
              <View style={styles.cartItemImageContainer}>
                <Image 
                  source={{ uri: item.featured_image || item.imageUrl }} 
                  style={styles.cartItemImage} 
                />
              </View>
              
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                {item.spice_level && item.spice_level !== 'None' && (
                  <Text style={styles.cartItemSpice}>🌶️ {item.spice_level}</Text>
                )}
                <View style={styles.priceContainer}>
                  <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                  {item.sale_price && item.price !== item.sale_price && (
                    <Text style={styles.cartItemOriginalPrice}>₹{item.price}</Text>
                  )}
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
          ))}
        </ScrollView>

        <View style={styles.cartModalFooter}>
          <View style={styles.cartSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{cartTotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹0</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total Amount</Text>
              <Text style={styles.summaryValueTotal}>₹{cartTotal + 25}</Text>
            </View>
          </View>
          
          <View style={styles.cartModalActions}>
            <TouchableOpacity 
              style={styles.clearCartButton}
              onPress={() => {
                clearCart();
                onClose();
              }}
            >
              <Text style={styles.clearCartText}>Clear Cart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.checkoutButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Bottom Tab Component
const BottomTabs = ({ activeTab, cartCount }) => {
  const navigation = useNavigation();
  
  const tabs = [
    { 
      id: 'delivery', 
      label: 'Home', 
      icon: '🏠', 
      activeColor: COLORS.primary,
      onPress: () => navigation.replace('Home')
    },
    { 
      id: 'dining', 
      label: 'Profile', 
      icon: '👤', 
      activeColor: COLORS.primary,
      onPress: () => navigation.replace('Profile')
    },
    { 
      id: 'live', 
      label: 'Support', 
      icon: '💬', 
      activeColor: COLORS.primary,
      onPress: () => {} // Removed alert
    },
    { 
      id: 'reorder', 
      label: 'Orders', 
      icon: '📦', 
      activeColor: COLORS.primary,
      onPress: () => {} // Removed alert
    },
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
            <View style={[
              styles.tabIconContainer, 
              activeTab === tab.id && styles.activeTabIcon
            ]}>
              <Text style={[
                styles.tabIcon,
                { color: activeTab === tab.id ? tab.activeColor : COLORS.textSecondary }
              ]}>
                {tab.icon}
              </Text>
            </View>
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? tab.activeColor : COLORS.textSecondary }
            ]}>
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [homeFilters, setHomeFilters] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('delivery');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Cart management
  const { 
    cartItems, 
    cartCount, 
    cartTotal, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const flatListRef = useRef(null);
  
  // Enhanced banners with Swiggy-style design
  const banners = [
    {
      id: '1',
      title: 'Free Delivery',
      subtitle: 'On orders above ₹199',
      emoji: '🚚',
      bg: [COLORS.primary, COLORS.primaryDark],
    },
    {
      id: '2',
      title: '50% OFF',
      subtitle: 'On your first order',
      emoji: '🎉',
      bg: [COLORS.secondary, COLORS.primaryDark],
    },
    {
      id: '3',
      title: 'Premium',
      subtitle: 'Unlimited free delivery',
      emoji: '👑',
      bg: [COLORS.accent, COLORS.secondary],
    },
  ];

  const VALID_SECTION_TYPES = ['topSection', 'recommendedForYouSection', 'fullCardSection'];

  useEffect(() => {
    fetchInitialData();
    animateIn();
    setupBannerCarousel();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSectionsForCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
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
        
        if (filtersData.length > 0) {
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
      const sectionsResponse = await fetch(`${baseURL}/api/home-sections/${categoryId}`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        console.log(sectionsData[0]);
        
        let allSections = [];
        
        if (Array.isArray(sectionsData)) {
          allSections = sectionsData;
        } else if (sectionsData && typeof sectionsData === 'object') {
          allSections = [sectionsData];
        }
        
        const sectionsByType = {
          recommendedForYouSection: [],
          topSection: [],
          fullCardSection: []
        };
        
        allSections.forEach(section => {
          if (VALID_SECTION_TYPES.includes(section.type) && 
              section.sectionData && 
              section.sectionData.length > 0) {
            sectionsByType[section.type].push(section);
          }
        });
        
        const limitedSections = [];
        
        if (sectionsByType.recommendedForYouSection.length > 0) {
          limitedSections.push(sectionsByType.recommendedForYouSection[0]);
        }
        
        if (sectionsByType.topSection.length > 0) {
          limitedSections.push(sectionsByType.topSection[0]);
        }
        
        if (sectionsByType.fullCardSection.length > 0) {
          limitedSections.push(sectionsByType.fullCardSection[0]);
        }
        
        setSections(limitedSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleCategoryPress = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleProductPress = (item) => {
    setSelectedProduct(item);
    setShowProductModal(true);
  };

  const handleAddToCart = (item, qty = 1) => {
    addToCart(item, qty);
  };

  const handleCartPress = () => {
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    clearCart();
  };

  // Enhanced Banner Component
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

  // Enhanced Category Component
  const renderCategory = ({ item }) => {
    const isSelected = selectedCategoryId === item.id;
    
    return (
      <Animated.View style={styles.categoryItem}>
        <TouchableOpacity 
          onPress={() => handleCategoryPress(item.id, item.name)}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}>
            <View style={[styles.categoryIcon, isSelected && styles.selectedCategoryIcon]}>
              <Image
                source={{ uri: item.image }}
                style={styles.categoryImage}
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
  };

  // Product Item Components
  const renderRecommendedItem = ({ item }) => {
    const displayPrice = item.sale_price || item.price || 150;
    const hasDiscount = item.sale_price && item.price !== item.sale_price;

    return (
      <TouchableOpacity 
        style={styles.recommendedCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.recommendedImageContainer}>
          <Image 
            source={{ uri: item.featured_image || item.imageUrl }} 
            style={styles.recommendedImage} 
          />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />
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
              {hasDiscount && (
                <Text style={styles.originalPriceText}>₹{item.price}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopSectionItem = ({ item }) => {
    const displayPrice = item.sale_price || item.price || 180;
    const hasDiscount = item.sale_price && item.price !== item.sale_price;

    return (
      <TouchableOpacity 
        style={styles.topSectionCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.topSectionImageContainer}>
          <Image 
            source={{ uri: item.featured_image || item.imageUrl }} 
            style={styles.topSectionImage} 
          />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.imageGradient}
          />
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
                {hasDiscount && (
                  <Text style={styles.originalPriceText}>₹{item.price}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFullCardItem = ({ item }) => {
    const displayPrice = item.sale_price || item.price || 220;
    const hasDiscount = item.sale_price && item.price !== item.sale_price;

    return (
      <TouchableOpacity 
        style={styles.fullCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.95}
      >
        <View style={styles.fullCardImageContainer}>
          <Image 
            source={{ uri: item.featured_image || item.imageUrl }} 
            style={styles.fullCardImage} 
          />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageGradient}
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
                  {hasDiscount && (
                    <Text style={styles.originalPriceText}>₹{item.price}</Text>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section, index) => {
    if (!section || !section.sectionData || section.sectionData.length === 0) return null;
    
    const sectionKey = `${section.type}-${section.id}-${index}`;
    
    const getSubtitle = (type) => {
      switch(type) {
        case 'recommendedForYouSection':
          return 'Curated just for you';
        case 'topSection':
          return 'Most popular nearby';
        case 'fullCardSection':
          return 'Premium dining options';
        default:
          return 'Explore more';
      }
    };
    
    // Recommended Section (Grid Layout - 2 columns)
    if (section.type === 'recommendedForYouSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
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
        </Animated.View>
      );
    }
    
    // Top Section (Horizontal Scroll)
    else if (section.type === 'topSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
          
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
        </Animated.View>
      );
    }
    
    // Full Card Section (Vertical List)
    else if (section.type === 'fullCardSection') {
      return (
        <Animated.View key={sectionKey} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Text style={styles.sectionSubtitle}>{getSubtitle(section.type)}</Text>
            </View>
          </View>
          <View style={styles.fullCardContainer}>
            {section.sectionData.slice(0, 4).map((item, itemIndex) => (
              <View key={`${sectionKey}-full-${item.id}-${itemIndex}`}>
                {renderFullCardItem({ item })}
              </View>
            ))}
          </View>
        </Animated.View>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.appLogo}>FoodApp</Text>
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding delicious food near you...</Text>
        </View>
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

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          activeOpacity={0.8}
        >
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
              if (viewableItems.length > 0) {
                setActiveSlide(viewableItems[0].index || 0);
              }
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            snapToInterval={width - 40}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
          
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot, 
                  activeSlide === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        {homeFilters.length > 0 && (
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
        )}

        {/* Dynamic Sections */}
        {sections.length > 0 ? (
          sections.map((section, index) => renderSection(section, index))
        ) : (
          <View style={styles.noSectionsContainer}>
            <Text style={styles.noSectionsText}>🍽️ Discover amazing restaurants in your area</Text>
          </View>
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showProductModal}
        product={selectedProduct}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
      />

      {/* Floating Cart */}
      <FloatingCart
        cartItems={cartItems}
        cartTotal={cartTotal}
        onPress={handleCartPress}
        onClose={handleCloseCart}
      />

      {/* Cart Modal */}
      <CartModal
        visible={showCartModal}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onClose={() => setShowCartModal(false)}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
      />

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} cartCount={cartCount} />

{/* Floating Girl Assistant - keep it LAST so it overlays everything */}
<FloatingGirlAssistant
defaultVisible={true}
size={72} // small & cute
startDock="right" // start near bottom-right
bottomOffset={96} // distance from bottom so she stays above your BottomTabs/FloatingCart
snapToEdges={true} // dock to screen edges on release
bubbleMode="reposition" // or "overlay" for wider centered bubble
/>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #0F1220
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  appLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary, // #6EE7F5
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary, // #A5AECA
    fontWeight: '500',
  },

  // Header
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border, // #252A40
    elevation: 0,
    shadowColor: 'transparent',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  locationContainer: { flex: 1 },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text, // #E6EAF6
    marginRight: 6,
  },

  dropdownIcon: {
    fontSize: 14,
    color: COLORS.accent, // #C792EA
    fontWeight: 'bold',
  },

  headerActions: { flexDirection: 'row', alignItems: 'center' },

  profileButton: {},

  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface, // #171A2B
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
    backgroundColor: COLORS.surface,
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

  // Content
  content: { flex: 1 },

  scrollContent: { paddingBottom: 100 },

  // Banner / Carousel
  carouselSection: { marginVertical: 16 },

  bannerWrapper: {
    width: width - 40,
    paddingHorizontal: 4,
  },

  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    elevation: 0,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  bannerLeft: { flex: 1 },

  bannerEmoji: { fontSize: 24, marginBottom: 8 },

  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  bannerButton: {
    backgroundColor: 'rgba(110,231,245,0.12)', // tinted glass
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(110,231,245,0.35)',
  },

  bannerButtonText: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.accent, // Accent for active
    width: 16,
  },

  // Sections
  section: { marginBottom: 24, paddingHorizontal: 16 },

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

  // Categories
  categoriesContainer: { paddingVertical: 8 },

  categoryItem: { alignItems: 'center', marginRight: 24 },

  categoryCard: { alignItems: 'center', position: 'relative' },

  selectedCategoryCard: { transform: [{ scale: 1.05 }] },

  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  selectedCategoryIcon: {
    backgroundColor: 'rgba(199,146,234,0.12)',
    borderColor: COLORS.accent,
  },

  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },

  selectedCategoryName: {
    color: COLORS.accent,
    fontWeight: '800',
  },

  categoryIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },

  // Recommended Cards
  recommendedContainer: { paddingVertical: 8 },

  recommendedRow: { justifyContent: 'space-between' },

  recommendedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    width: (width - 48) / 2,
    overflow: 'hidden',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  recommendedImageContainer: { position: 'relative', height: 120 },

  recommendedImage: { width: '100%', height: '100%', resizeMode: 'cover' },

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
    backgroundColor: 'rgba(15,18,32,0.75)',
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
    backgroundColor: 'rgba(15,18,32,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(110,231,245,0.35)',
  },

  deliveryTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  recommendedInfo: { padding: 12 },

  recommendedName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  cuisineType: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },

  recommendedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },

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

  // Top Section Cards
  topSectionContainer: { paddingVertical: 8 },

  topSectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginRight: 16,
    width: width * 0.7,
    overflow: 'hidden',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  topSectionImageContainer: { position: 'relative', height: 140 },

  topSectionImage: { width: '100%', height: '100%', resizeMode: 'cover' },

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
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15,18,32,0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  ratingText: { color: COLORS.text, fontSize: 10, fontWeight: '700' },

  topSectionInfo: { padding: 12 },

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

  deliveryInfo: { flex: 1 },

  deliveryText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },

  deliveryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Full-width List Cards
  fullCardContainer: { paddingVertical: 8 },

  fullCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  fullCardImageContainer: { position: 'relative', width: width * 0.28 },

  fullCardImage: { width: '100%', height: 100, resizeMode: 'cover' },

  fullCardOfferBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  fullCardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },

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

  fullCardLeft: { flex: 1 },

  fullCardRating: {
    backgroundColor: 'rgba(110,231,245,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(110,231,245,0.35)',
  },

  // Add Button
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    elevation: 0,
  },

  addButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // No Sections
  noSectionsContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },

  noSectionsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Bottom Tabs
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

  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative' },

  tabIconContainer: { marginBottom: 4 },

  activeTabIcon: { transform: [{ scale: 1.12 }] },

  tabIcon: { fontSize: 20, color: COLORS.text },

  tabLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  tabBadge: {
    position: 'absolute',
    top: 4,
    right: width * 0.1,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },

  tabBadgeText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: '800',
  },

  // Floating Cart
  floatingCartContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },

  floatingCart: {
    backgroundColor: COLORS.accent,
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
  },

  cartLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  cartItemsCount: {
    backgroundColor: 'rgba(15,18,32,0.25)',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(230,234,246,0.15)',
  },

  cartItemsCountText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
  },

  cartInfo: { flex: 1 },

  cartItemsText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },

  cartExtraText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },

  cartRight: { alignItems: 'flex-end' },

  cartTotal: {
    color: COLORS.background,
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
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '800',
  },

  // Cart Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,5,22,0.6)',
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
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    backgroundColor: COLORS.background,
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

  cartItemImageContainer: { marginRight: 12 },

  cartItemImage: { width: 60, height: 60, borderRadius: 10, resizeMode: 'cover' },

  cartItemInfo: { flex: 1, marginRight: 16 },

  cartItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  cartItemSpice: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },

  cartItemPrice: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },

  cartItemOriginalPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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

  cartSummary: { marginBottom: 20 },

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

  summaryLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },

  summaryLabelTotal: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  summaryValueTotal: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  cartModalActions: { flexDirection: 'row', gap: 12 },

  clearCartButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  clearCartText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '800' },

  checkoutButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  checkoutButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Product Modal
  productModalContainer: { flex: 1, backgroundColor: COLORS.background },

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

  modalBackText: { fontSize: 20, color: COLORS.text, fontWeight: '800' },

  productModalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  modalPlaceholder: { width: 40 },

  productModalContent: { flex: 1 },

  productImageContainer: { position: 'relative', height: 250 },

  productModalImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  imageOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%' },

  productOfferBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  productRatingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15,18,32,0.75)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  productInfo: { padding: 20 },

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
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  metaItem: { alignItems: 'center' },

  metaIcon: { fontSize: 20, marginBottom: 4, color: COLORS.primary },

  metaText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  ingredientsSection: { marginBottom: 24 },

  // Note: keep sectionTitle alias to not collide with previous
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  ingredientsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  ingredientTag: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  ingredientText: { fontSize: 12, color: COLORS.text, fontWeight: '700' },

  quantitySection: { marginBottom: 20 },

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

  priceSection: { marginRight: 16 },

  totalPrice: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

  originalPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },

  priceNote: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  addToCartButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  addToCartButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Animated Girl Tab
  animatedTabContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },

  girlSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    position: 'relative',
    zIndex: 10,
  },

  girlContainer: { alignItems: 'center', position: 'relative' },

  girlCharacter: { alignItems: 'center', marginBottom: 8 },

  girlBody: { alignItems: 'center', position: 'relative' },

  girlHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4D2B8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 2,
    position: 'relative',
  },

  girlFace: { fontSize: 20 },

  girlHair: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    height: 25,
    backgroundColor: '#3B2D52', // muted violet-brown to match theme
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: -1,
  },

  girlTorso: {
    width: 35,
    height: 25,
    backgroundColor: '#4DBDE0', // muted cyan top
    borderRadius: 8,
    marginBottom: 2,
    position: 'relative',
  },

  girlDress: {
    position: 'absolute',
    bottom: -8,
    left: -10,
    right: -10,
    height: 15,
    backgroundColor: '#9D73D9', // violet skirt to echo accent
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  girlArms: {
    position: 'absolute',
    top: 5,
    left: -12,
    right: -12,
    height: 8,
    backgroundColor: '#F4D2B8',
    borderRadius: 4,
  },

  girlLegs: {
    width: 20,
    height: 12,
    backgroundColor: '#F4D2B8',
    borderRadius: 6,
  },

  speechBubble: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 100,
  },

  speechText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },

  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: 90,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
  },

  dragIndicator: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(110,231,245,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(110,231,245,0.35)',
  },

  dragText: { fontSize: 8, color: COLORS.primary, fontWeight: '700' },

  tabBarContainer: { flex: 1, backgroundColor: COLORS.background },
});

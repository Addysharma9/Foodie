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
  Alert,
  RefreshControl,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

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
        {
          transform: [{ translateY: slideAnim }]
        }
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
            <Text style={styles.cartExtraText}>Extra charges may apply</Text>
          </View>
        </View>
        
        <View style={styles.cartRight}>
          <Text style={styles.cartTotal}>₹{cartTotal}</Text>
          <Text style={styles.cartViewText}>VIEW CART ›</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.closeCartButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.closeCartText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Cart Item Management Hook
const useCart = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1, price: Math.floor(Math.random() * 200) + 100 }];
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

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.cartModal}>
        <View style={styles.cartModalHeader}>
          <Text style={styles.cartModalTitle}>Cart Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cartItemsList}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItemRow}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>₹{item.price}</Text>
              </View>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
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
          <View style={styles.cartTotalSection}>
            <Text style={styles.cartTotalLabel}>Total Amount</Text>
            <Text style={styles.cartTotalAmount}>₹{cartTotal}</Text>
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
              onPress={() => {
                Alert.alert('Checkout', `Proceeding to checkout with ₹${cartTotal}`);
                onClose();
              }}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Bottom Tab Component
const BottomTabs = ({ activeTab, onTabPress, cartCount }) => {
  const tabs = [
    { id: 'delivery', label: 'Delivery', icon: '🏠', activeColor: '#E23744' },
    { id: 'dining', label: 'Dining', icon: '🍽️', activeColor: '#E23744' },
    { id: 'live', label: 'Live', icon: '📺', activeColor: '#E23744' },
    { id: 'reorder', label: 'Reorder', icon: '🔄', activeColor: '#E23744' },
  ];

  return (
    <View style={styles.bottomTabContainer}>
      <View style={styles.bottomTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconContainer, activeTab === tab.id && styles.activeTabIcon]}>
              <Text style={[
                styles.tabIcon,
                { color: activeTab === tab.id ? tab.activeColor : '#9CA3AF' }
              ]}>
                {tab.icon}
              </Text>
            </View>
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? tab.activeColor : '#9CA3AF' }
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

export default function HomeScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [homeFilters, setHomeFilters] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('delivery');
  const [showCartModal, setShowCartModal] = useState(false);
  
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
  
  // Enhanced banners with Zomato-style design
  const banners = [
    {
      id: '1',
      title: 'Free Delivery',
      subtitle: 'On orders above ₹199',
      emoji: '🚚',
      bg: ['#E23744', '#FF4D6D'],
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    },
    {
      id: '2',
      title: '60% OFF',
      subtitle: 'On your first order',
      emoji: '🎉',
      bg: ['#FF6B35', '#FF8E53'],
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    },
    {
      id: '3',
      title: 'Gold Membership',
      subtitle: 'Unlimited free delivery',
      emoji: '👑',
      bg: ['#FFD700', '#FFA500'],
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
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
        console.log('Categories data:', filtersData);
        setHomeFilters(filtersData);
        
        if (filtersData.length > 0) {
          setSelectedCategoryId(filtersData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsForCategory = async (categoryId) => {
    try {
      console.log(`Fetching sections for category ID: ${categoryId}`);
      const sectionsResponse = await fetch(`${baseURL}/api/home-sections/${categoryId}`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        console.log(`Sections data for category ${categoryId}:`, sectionsData);
        
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
      Alert.alert('Error', 'Failed to load sections. Please try again.');
    }
  };

  const handleCategoryPress = (categoryId, categoryName) => {
    console.log(`Category selected: ${categoryName} (ID: ${categoryId})`);
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

  const handleAddToCart = (item) => {
    addToCart(item);
    Alert.alert(
      '🎉 Added to Cart', 
      `${item.name} has been added to your cart!`,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  const handleCartPress = () => {
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    clearCart();
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'reorder') {
      Alert.alert('Cart', `Cart has ${cartCount} items`);
    } else {
      Alert.alert(tabId.charAt(0).toUpperCase() + tabId.slice(1), `${tabId} tab selected`);
    }
  };

  // Zomato-style Banner Component
  const renderBanner = ({ item, index }) => (
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

  // Enhanced Category Component with Zomato styling
  const renderCategory = ({ item, index }) => {
    const isSelected = selectedCategoryId === item.id;
    
    return (
      <Animated.View style={styles.categoryItem}>
        <TouchableOpacity 
          onPress={() => handleCategoryPress(item.id, item.name)}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}>
            <View style={[styles.categoryIcon, isSelected && styles.selectedCategoryIcon]}>
              <Text style={[styles.categoryEmoji]}>🍽️</Text>
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

  // Zomato-style Recommended Item
  const renderRecommendedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recommendedCard}
      onPress={() => {
        Alert.alert('Restaurant Details', `${item.name}\nRating: ${item.rating}\nOffer: ${item.offer}`);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.recommendedImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.recommendedImage} />
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <View style={styles.recommendedOfferBadge}>
          <Text style={styles.offerText}>{item.offer}</Text>
        </View>
        <View style={styles.recommendedRatingBadge}>
          <Text style={styles.ratingText}>★ {item.rating}</Text>
        </View>
        <View style={styles.deliveryTime}>
          <Text style={styles.deliveryTimeText}>25-30 mins</Text>
        </View>
      </View>
      <View style={styles.recommendedInfo}>
        <Text style={styles.recommendedName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cuisineType}>North Indian, Chinese</Text>
        <View style={styles.recommendedFooter}>
          <Text style={styles.priceText}>₹200 for two</Text>
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

  // Top Section Item with enhanced design
  const renderTopSectionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.topSectionCard}
      onPress={() => {
        Alert.alert('Restaurant Details', `${item.name}\nRating: ${item.rating}\nOffer: ${item.offer}`);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.topSectionImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.topSectionImage} />
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.imageGradient}
        />
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>{item.offer}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {item.rating}</Text>
        </View>
      </View>
      <View style={styles.topSectionInfo}>
        <Text style={styles.topSectionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cuisineType}>Multi-cuisine</Text>
        <View style={styles.cardFooter}>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>🕐 30 mins</Text>
            <Text style={styles.priceText}>₹150 for one</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Full Card Section Item
  const renderFullCardItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.fullCard}
      onPress={() => {
        Alert.alert('Restaurant Details', `${item.name}\nRating: ${item.rating}\nOffer: ${item.offer}`);
      }}
      activeOpacity={0.95}
    >
      <View style={styles.fullCardImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.fullCardImage} />
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />
        <View style={styles.fullCardOfferBadge}>
          <Text style={styles.offerText}>{item.offer}</Text>
        </View>
      </View>
      <View style={styles.fullCardContent}>
        <Text style={styles.fullCardName}>{item.name}</Text>
        <Text style={styles.cuisineType}>North Indian, South Indian, Chinese</Text>
        <View style={styles.fullCardMeta}>
          <View style={styles.fullCardLeft}>
            <View style={styles.fullCardRating}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
            <Text style={styles.deliveryText}>• 25-30 mins • ₹300 for two</Text>
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

  const renderSection = (section, index) => {
    if (!section || !section.sectionData || section.sectionData.length === 0) return null;
    
    const sectionKey = `${section.type}-${section.id}-${index}`;
    
    const getSubtitle = (type) => {
      switch(type) {
        case 'recommendedForYouSection':
          return 'Curated for your taste';
        case 'topSection':
          return 'Most popular in your area';
        case 'fullCardSection':
          return 'Premium restaurants nearby';
        default:
          return 'Explore more options';
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
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                Alert.alert('View All', `Show all items from: ${section.name}`);
              }}
            >
              <Text style={styles.seeAll}>See all</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                Alert.alert('View All', `Show all items from: ${section.name}`);
              }}
            >
              <Text style={styles.seeAll}>See all</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                Alert.alert('View All', `Show all items from: ${section.name}`);
              }}
            >
              <Text style={styles.seeAll}>See all</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
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
            <Text style={styles.zomatoLogo}>zomato</Text>
          </View>
          <ActivityIndicator size="large" color="#E23744" />
          <Text style={styles.loadingText}>Finding great food near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Zomato-style Header */}
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
              onPress={() => Alert.alert('Profile', 'Profile screen')}
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
          onPress={() => Alert.alert('Search', 'Search functionality')}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            <Text style={styles.noSectionsText}>Discover restaurants in your area</Text>
          </View>
        )}
      </ScrollView>

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
      <BottomTabs 
        activeTab={activeTab} 
        onTabPress={handleTabPress}
        cartCount={cartCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  zomatoLogo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E23744',
    marginBottom: 20,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Zomato-style Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },

  dropdownIcon: {
    fontSize: 14,
    color: '#E23744',
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileIconText: {
    fontSize: 18,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#6B7280',
  },
  
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Content
  content: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 100, // Space for bottom tabs
  },

  // Banner Section
  carouselSection: {
    marginVertical: 16,
  },
  
  bannerWrapper: {
    width: width - 40,
    paddingHorizontal: 4,
  },
  
  bannerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 140,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  
  bannerButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#E5E7EB',
    marginHorizontal: 3,
  },
  
  activeDot: {
    backgroundColor: '#E23744',
    width: 16,
  },

  // Sections
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
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  seeAll: {
    fontSize: 14,
    color: '#E23744',
    fontWeight: '600',
    marginRight: 2,
  },
  
  arrow: {
    fontSize: 18,
    color: '#E23744',
    fontWeight: 'bold',
  },

  // Categories
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
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  
  selectedCategoryIcon: {
    backgroundColor: '#FEF2F2',
    borderColor: '#E23744',
  },
  
  categoryEmoji: {
    fontSize: 24,
  },
  
  categoryName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  selectedCategoryName: {
    color: '#E23744',
    fontWeight: 'bold',
  },

  categoryIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: '#E23744',
    borderRadius: 2,
  },

  // Recommended Cards
  recommendedContainer: {
    paddingVertical: 8,
  },
  
  recommendedRow: {
    justifyContent: 'space-between',
  },
  
  recommendedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: (width - 48) / 2,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    height: '50%',
  },
  
  recommendedOfferBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E23744',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  recommendedRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryTime: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  deliveryTimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  recommendedInfo: {
    padding: 12,
  },
  
  recommendedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  cuisineType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },

  recommendedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Top Section Cards
  topSectionContainer: {
    paddingVertical: 8,
  },
  
  topSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    width: width * 0.7,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    backgroundColor: '#E23744',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  offerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  topSectionInfo: {
    padding: 12,
  },
  
  topSectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#6B7280',
    marginBottom: 2,
  },

  // Full Cards
  fullCardContainer: {
    paddingVertical: 8,
  },
  
  fullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    backgroundColor: '#E23744',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  
  fullCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  
  fullCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  // Add Button
  addButton: {
    backgroundColor: '#E23744',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // No sections
  noSectionsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  noSectionsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Bottom Tabs
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    transform: [{ scale: 1.1 }],
  },

  tabIcon: {
    fontSize: 20,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  tabBadge: {
    position: 'absolute',
    top: 4,
    right: width * 0.1,
    backgroundColor: '#E23744',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Floating Cart Styles
  floatingCartContainer: {
    position: 'absolute',
    bottom: 90, // Above bottom tabs
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },

  floatingCart: {
    backgroundColor: '#E23744',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  cartItemsCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cartItemsCountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cartInfo: {
    flex: 1,
  },

  cartItemsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  cartExtraText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '400',
  },

  cartRight: {
    alignItems: 'flex-end',
  },

  cartTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  cartViewText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  closeCartButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  closeCartText: {
    color: '#E23744',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Cart Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000,
    elevation: 20,
  },

  cartModal: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F3F4F6',
  },

  cartModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cartItemsList: {
    maxHeight: height * 0.4,
    paddingHorizontal: 20,
  },

  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },

  cartItemInfo: {
    flex: 1,
    marginRight: 16,
  },

  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  cartItemPrice: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 4,
  },

  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },

  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E23744',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },

  cartModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  cartTotalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  cartTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E23744',
  },

  cartModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  clearCartButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  clearCartText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },

  checkoutButton: {
    flex: 2,
    backgroundColor: '#E23744',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
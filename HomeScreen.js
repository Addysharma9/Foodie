import React, { useState, useRef, useEffect ,useCallback} from 'react';
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
  RefreshControl,
  Platform,
  SafeAreaView,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import FloatingGirlAssistant from './components/Animatedgirl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from './hooks/useCart';
import BannerCard, { banners } from './components/BannerCard';
// Import constants and helpers
import {
  width,
  height,
  isTablet,
  SPACING,
  SCREEN_PADDING,
  CARD_SPACING,
  BORDER_RADIUS,
  FONTS,
  COLORS,
  baseURL,
  VALID_SECTION_TYPES,
} from './constants/AppConstants';
import { formatPrice, getImageUrl, formatAddress } from './utils/helpers';

// Import components
import { SkeletonLine, SkeletonCircle, SkeletonCard } from './components/SkeletonComponents';
import AddressDropdownModal from './components/AddressDropdownModal';
import ProductDetailModal from './components/ProductDetailModal';
import FloatingCart from './components/FloatingCart';
import CartModal from './components/CartModal';
import CategoryItem from './components/CategoryItem';
import RecommendedCard from './components/RecommendedCard';
import TopSectionCard from './components/TopSectionCard';
import FullRowCard from './components/FullRowCard';

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
// In your HomeScreen component
// Replace your current useFocusEffect with this improved version
useFocusEffect(
  useCallback(() => {
    // Only refresh if the component has already been initialized
    if (!loading) {
      const refreshAllData = async () => {
        console.log('Refreshing all screen data...');
        
        try {
          // Don't set main loading to true on refresh - use a separate state
          setSectionsLoading(true);
          
          // Refresh data without showing full screen loader
          await Promise.all([
            selectedCategoryId ? fetchSectionsForCategory(selectedCategoryId) : Promise.resolve(),
            refreshCart(),
          ]);
          
          console.log('All data refreshed successfully');
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setSectionsLoading(false);
        }
      };

      refreshAllData();
    }
  }, [selectedCategoryId, refreshCart, loading]) // Add loading as dependency
);

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
    removeCoupon = () => { },
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


  // In your render function, change:
  const renderBanner = ({ item, index }) => (
    <BannerCard item={item} index={index} onPress={(item) => console.log('Banner pressed:', item)} />
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
            onPress={() => navigation.navigate('Profile')}
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
            data={banners}  // Use the imported banners data
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
  // Enhanced Top Section Card Styles
  topSectionScrollContainer: {
    paddingVertical: SPACING.md,
  },
  topSectionSkeletonContainer: {
    paddingVertical: SPACING.md,
  },
  // Enhanced Full Card Styles
  fullCardSectionContainer: {
    paddingVertical: SPACING.md,
  },
  fullCardSkeletonContainer: {
    paddingVertical: SPACING.md,
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
});

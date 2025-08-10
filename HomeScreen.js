import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Data for food selling app
const banners = [
  {
    id: '1',
    title: 'Fresh Daily',
    subtitle: 'Made with love, delivered hot',
    bg: ['#FF6B35', '#F7931E'],
    icon: '🍽️',
  },
  {
    id: '2',
    title: '30% OFF',
    subtitle: 'On bulk orders above ₹500',
    bg: ['#2C2C2C', '#000000'],
    icon: '🎉',
  },
  {
    id: '3',
    title: 'Family Combo',
    subtitle: 'Complete meals for families',
    bg: ['#FF6B35', '#FFB347'],
    icon: '👨‍👩‍👧‍👦',
  },
];

const categories = [
  { id: '1', name: 'Main Course', icon: '🍛', color: '#FF6B35' },
  { id: '2', name: 'Starters', icon: '🥗', color: '#F7931E' },
  { id: '3', name: 'Snacks', icon: '🍟', color: '#FF6B35' },
  { id: '4', name: 'Beverages', icon: '🥤', color: '#F7931E' },
  { id: '5', name: 'Desserts', icon: '🍰', color: '#FF6B35' },
];

const featuredItems = [
  {
    id: '1',
    name: 'Special Thali',
    price: '₹149',
    rating: '4.8',
    image: '🍛',
    badge: 'Bestseller',
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    price: '₹179',
    rating: '4.6',
    image: '🧈',
    badge: 'New',
  },
  {
    id: '3',
    name: 'Biryani Special',
    price: '₹199',
    rating: '4.9',
    image: '🍚',
    badge: 'Hot',
  },
];

export default function HomeScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setActiveSlide(current => {
        const next = (current + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const renderBanner = ({ item }) => (
    <View style={styles.bannerWrapper}>
      <LinearGradient colors={item.bg} style={styles.bannerCard}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerIcon}>{item.icon}</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        <Text style={styles.itemEmoji}>{item.image}</Text>
        <View style={styles.itemBadge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemPrice}>{item.price}</Text>
          <Text style={styles.itemRating}>⭐ {item.rating}</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.locationSection}>
          <Text style={styles.deliverTo}>Our Kitchen</Text>
          <TouchableOpacity>
            <Text style={styles.location}>📍 Fresh Food Corner</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for delicious food..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
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
                style={[styles.dot, activeSlide === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Special</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View Menu</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredItems}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
  },
  locationSection: {
    flex: 1,
  },
  deliverTo: {
    fontSize: Math.min(width * 0.032, 12),
    color: '#6B7280',
    fontWeight: '500',
  },
  location: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  profileButton: {
    width: Math.min(width * 0.1, 40),
    height: Math.min(width * 0.1, 40),
    borderRadius: Math.min(width * 0.05, 20),
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: Math.min(width * 0.05, 20),
    color: '#fff',
  },

  // Search
  searchSection: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: Math.min(width * 0.045, 18),
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#1F2937',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },

  // Banner
  bannerSection: {
    marginBottom: height * 0.025,
  },
  bannerWrapper: {
    width: width - 40,
    paddingHorizontal: 5,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    height: height * 0.15,
    justifyContent: 'center',
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: Math.min(width * 0.1, 40),
    marginRight: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#fff',
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.015,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF6B35',
    width: 20,
  },

  // Sections
  section: {
    marginBottom: height * 0.025,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.015,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.015,
  },
  seeAll: {
    fontSize: Math.min(width * 0.037, 15),
    color: '#FF6B35',
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: width * 0.05,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: width * 0.06,
  },
  categoryIcon: {
    width: Math.min(width * 0.15, 60),
    height: Math.min(width * 0.15, 60),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: Math.min(width * 0.06, 24),
  },
  categoryName: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Featured Items
  itemsContainer: {
    paddingHorizontal: width * 0.05,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: width * 0.6,
  },
  itemImageContainer: {
    height: height * 0.1,
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemEmoji: {
    fontSize: Math.min(width * 0.08, 32),
  },
  itemBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: Math.min(width * 0.028, 11),
    fontWeight: 'bold',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemPrice: {
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  itemRating: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#374151',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '600',
  },
});

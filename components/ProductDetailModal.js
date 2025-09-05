import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Animated,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet, 
  height, 
  SCREEN_PADDING 
} from '../constants/AppConstants';
import { getImageUrl, formatPrice } from '../utils/helpers';

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
      }
    } catch (error) {
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

const styles = StyleSheet.create({
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
  },
});

export default ProductDetailModal;

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet, 
  width, 
  CARD_SPACING 
} from '../constants/AppConstants';
import { getImageUrl, formatPrice } from '../utils/helpers';
import { SkeletonCard } from './SkeletonComponents';

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

const styles = StyleSheet.create({
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
});

export default TopSectionCard;

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
  SCREEN_PADDING, 
  CARD_SPACING 
} from '../constants/AppConstants';
import { getImageUrl, formatPrice } from '../utils/helpers';
import { SkeletonCard } from './SkeletonComponents';

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

const styles = StyleSheet.create({
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
});

export default RecommendedCard;

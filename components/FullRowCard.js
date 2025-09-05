import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  isTablet 
} from '../constants/AppConstants';
import { getImageUrl, formatPrice } from '../utils/helpers';
import { SkeletonCard } from './SkeletonComponents';

const FullRowCard = React.memo(({ item, onPress, addToCart, isItemInCart, getItemQuantity }) => {
  const displayPrice = item.sale_price || item.price || 220;
  const hasDiscount = item.sale_price && item.price !== item.sale_price;
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const inCart = isItemInCart ? isItemInCart(item.id) : false;
  const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const imageSize = isTablet ? 130 : 110;

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
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
      <TouchableOpacity style={styles.fullCardNew} onPress={() => onPress(item)} activeOpacity={0.95}>
        <View style={[styles.fullCardImageSection, { width: imageSize }]}>
          {!loaded && <SkeletonCard height={imageSize} borderRadius={BORDER_RADIUS.xl} style={{ width: imageSize }} />}
          <Image
            source={{ uri: getImageUrl(item.featured_image || item.imageUrl) }}
            style={[styles.fullCardImageNew, { width: imageSize, height: imageSize }, !loaded && { opacity: 0, position: 'absolute' }]}
            onLoadEnd={() => setLoaded(true)}
          />
          {hasDiscount && (
            <View style={styles.fullDiscountBadge}>
              <Text style={styles.fullDiscountText}>SALE</Text>
            </View>
          )}
        </View>
        
        <View style={styles.fullCardContentNew}>
          <View style={styles.fullCardMainInfo}>
            <Text style={styles.fullCardNameNew}>{item.name}</Text>
            <Text style={styles.fullCardCuisine}>
              {item.is_featured ? 'Premium Restaurant' : 'Popular Restaurant'}
            </Text>
            
            <View style={styles.fullCardMetaRow}>
              {item.average_rating > 0 && (
                <View style={styles.fullRatingChip}>
                  <Text style={styles.fullRatingText}>★ {item.average_rating}</Text>
                </View>
              )}
              <Text style={styles.fullDeliveryText}>{item.preparation_time || 25} mins</Text>
            </View>
          </View>
          
          <View style={styles.fullCardActions}>
            <View style={styles.fullPriceInfo}>
              <Text style={styles.fullPriceText}>₹{formatPrice(displayPrice)}</Text>
              {hasDiscount && <Text style={styles.fullOriginalPrice}>₹{item.price}</Text>}
            </View>
            
            <TouchableOpacity
              style={[styles.fullAddButton, inCart && styles.fullAddedButton]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              <Text style={[styles.fullAddButtonText, inCart && styles.fullAddedButtonText]}>
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
  fullCardNew: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  fullCardImageSection: {
    position: 'relative',
  },
  fullCardImageNew: {
    resizeMode: 'cover',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
  },
  fullDiscountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  fullDiscountText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
  },
  fullCardContentNew: {
    flex: 1,
    padding: isTablet ? SPACING.lg : SPACING.md,
    justifyContent: 'space-between',
  },
  fullCardMainInfo: {
    flex: 1,
  },
  fullCardNameNew: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  fullCardCuisine: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  fullCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fullRatingChip: {
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.md,
  },
  fullRatingText: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  fullDeliveryText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  fullCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullPriceInfo: {
    flex: 1,
  },
  fullPriceText: {
    fontSize: FONTS.lg,
    color: COLORS.primary,
    fontWeight: '800',
  },
  fullOriginalPrice: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  fullAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    minWidth: 60,
  },
  fullAddedButton: {
    backgroundColor: COLORS.success,
  },
  fullAddButtonText: {
    color: COLORS.textInverse,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullAddedButtonText: {
    color: COLORS.textInverse,
  },
});

export default FullRowCard;

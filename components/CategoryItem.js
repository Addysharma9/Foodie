import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, isTablet } from '../constants/AppConstants';
import { getImageUrl } from '../utils/helpers';
import { SkeletonCard } from './SkeletonComponents';

const CategoryItem = React.memo(({ item, onPress, isSelected }) => {
  const [loaded, setLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress(item.id, item.name);
  };
  
  return (
    <Animated.View style={[styles.categoryItemContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}>
          <View style={[styles.categoryIconContainer, isSelected && styles.selectedCategoryIconContainer]}>
            {!loaded && <SkeletonCard height={isTablet ? 80 : 70} borderRadius={BORDER_RADIUS.xl} style={{ width: isTablet ? 80 : 70 }} />}
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.categoryImage, !loaded && { opacity: 0, position: 'absolute' }]}
              onLoadEnd={() => setLoaded(true)}
            />
            {isSelected && <View style={styles.categorySelectionOverlay} />}
          </View>
          <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
            {item.name}
          </Text>
          {isSelected && (
            <View style={styles.categoryActiveIndicator}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.categoryIndicatorGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  categoryItemContainer: {
    alignItems: 'center',
    marginRight: isTablet ? SPACING.xxxl : SPACING.xxl,
  },
  categoryCard: {
    alignItems: 'center',
    position: 'relative',
  },
  selectedCategoryCard: {},
  categoryIconContainer: {
    width: isTablet ? 80 : 70,
    height: isTablet ? 80 : 70,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  selectedCategoryIconContainer: {
    backgroundColor: COLORS.primaryUltraLight,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  categoryImage: {
    width: isTablet ? 70 : 60,
    height: isTablet ? 70 : 60,
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: 'cover',
  },
  categorySelectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryName: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: isTablet ? 90 : 70,
  },
  selectedCategoryName: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  categoryActiveIndicator: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryIndicatorGradient: {
    flex: 1,
  },
});

export default CategoryItem;

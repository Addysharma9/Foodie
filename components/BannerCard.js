import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, isTablet, width, height, SCREEN_PADDING } from '../constants/AppConstants';

// Professional banner data with subtle animations
const banners = [
  { 
    id: '1', 
    title: 'Free Delivery', 
    subtitle: 'On orders above ₹199', 
    emoji: '🚚', 
    bg: [COLORS.primary, COLORS.primaryDark],
    floatingEmojis: ['🍕', '🍔', '🥗'],
    theme: 'food'
  },
  { 
    id: '2', 
    title: '50% OFF', 
    subtitle: 'On your first order', 
    emoji: '🎉', 
    bg: [COLORS.secondary, '#357ABD'],
    floatingEmojis: ['🎊', '🎈', '🎁'],
    theme: 'offer'
  },
  { 
    id: '3', 
    title: 'Premium Plus', 
    subtitle: 'Unlimited free delivery', 
    emoji: '👑', 
    bg: [COLORS.accent, '#E6A429'],
    floatingEmojis: ['⭐', '💎', '🏆'],
    theme: 'premium'
  },
];

// Subtle floating emoji animation
const FloatingEmoji = ({ emoji, delay = 0 }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -8,
            duration: 2000 + (delay * 200),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 8,
            duration: 2000 + (delay * 200),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay * 100);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.Text
      style={[
        styles.floatingEmoji,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

// Subtle shimmer effect
const ShimmerEffect = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.shimmerOverlay,
        {
          opacity: shimmer.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.15, 0],
          }),
          transform: [{
            translateX: shimmer.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, width],
            })
          }]
        }
      ]}
    />
  );
};

const BannerCard = React.memo(({ item, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    if (onPress) onPress(item);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
        <View style={styles.bannerContainer}>
          <LinearGradient colors={item.bg} style={styles.enhancedBannerCard}>
            
            {/* Subtle shimmer effect */}
            <ShimmerEffect />

            {/* Minimalistic floating emojis */}
            <View style={styles.floatingContainer}>
              {item.floatingEmojis.slice(0, 3).map((emoji, i) => (
                <View
                  key={`${item.id}-${i}`}
                  style={[
                    styles.emojiPosition,
                    i === 0 && { top: '15%', right: '15%' },
                    i === 1 && { bottom: '20%', right: '25%' },
                    i === 2 && { top: '45%', right: '8%' },
                  ]}
                >
                  <FloatingEmoji emoji={emoji} delay={i} />
                </View>
              ))}
            </View>

            {/* Clean content section */}
            <View style={styles.bannerContentSection}>
              <View style={styles.bannerMainContent}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.bannerEmojiNew}>{item.emoji}</Text>
                </View>
                
                <Text style={styles.bannerTitleNew}>{item.title}</Text>
                <Text style={styles.bannerSubtitleNew}>{item.subtitle}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  bannerContainer: {
    width: width - (SCREEN_PADDING * 1.2),
    paddingHorizontal: SPACING.xs,
  },
  enhancedBannerCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    height: isTablet ? 170 : 160, // Compact professional size
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 100,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  emojiPosition: {
    position: 'absolute',
  },
  floatingEmoji: {
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  bannerContentSection: {
    flex: 1,
    padding: isTablet ? SPACING.xl : SPACING.lg,
    justifyContent: 'center',
    zIndex: 5,
  },
  bannerMainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginBottom: SPACING.sm,
  },
  bannerEmojiNew: {
    fontSize: isTablet ? 28 : 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerTitleNew: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitleNew: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
});

export default BannerCard;
export { banners };

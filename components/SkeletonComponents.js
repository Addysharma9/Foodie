import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';

// Enhanced animated pulse component
const Pulse = ({ style, children }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[{ opacity: pulseAnim }, style]}>
      {children || <View style={[{ backgroundColor: '#F1F3F4', borderRadius: 8 }, style]} />}
    </Animated.View>
  );
};

// Professional skeleton components
export const SkeletonLine = ({ height = 14, width = '100%', borderRadius = 6, style }) => (
  <Pulse style={[{ height, width, borderRadius }, style]} />
);

export const SkeletonCircle = ({ size = 48, style }) => (
  <Pulse style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />
);

export const SkeletonCard = ({ height = 120, borderRadius = 16, style }) => (
  <Pulse style={[{ height, borderRadius, backgroundColor: '#F8F9FA' }, style]} />
);

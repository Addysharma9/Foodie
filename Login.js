import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
  Alert,
  Easing,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

// Professional spacing system (matching HomeScreen)
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const SCREEN_PADDING = width * 0.04;

// Enhanced border radius system
const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
};

// Professional typography scale
const FONT_SCALE = Math.min(width / 375, 1.3);
const FONTS = {
  xs: 11 * FONT_SCALE,
  sm: 13 * FONT_SCALE,
  base: 15 * FONT_SCALE,
  lg: 17 * FONT_SCALE,
  xl: 19 * FONT_SCALE,
  xxl: 22 * FONT_SCALE,
  xxxl: 26 * FONT_SCALE,
  huge: 32 * FONT_SCALE,
};

// Professional color palette (matching HomeScreen)
const COLORS = {
  // Primary brand colors with depth
  primary: '#FF6B35',
  primaryDark: '#E8541C',
  primaryLight: '#FFE8E0',
  primaryUltraLight: '#FFF5F2',
  
  // Enhanced secondary colors
  secondary: '#4A90E2',
  accent: '#F7B731',
  accentLight: '#FEF3CD',
  
  // Sophisticated neutrals
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  surfaceCard: '#FFFFFF',
  
  // Typography hierarchy
  text: '#1A1D29',
  textPrimary: '#2C2F36',
  textSecondary: '#6C7278',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Enhanced borders and dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F1F3F4',
  
  // Professional shadows
  shadow: 'rgba(17, 25, 40, 0.12)',
  shadowDark: 'rgba(17, 25, 40, 0.25)',
  shadowLight: 'rgba(17, 25, 40, 0.06)',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBlur: 'rgba(255, 255, 255, 0.2)',
};

const banners = [
  {
    id: '1',
    title: 'Fresh & Delicious',
    subtitle: 'Get your favorite meals delivered',
    bg: [COLORS.primary, COLORS.primaryDark],
    emoji: '🍕',
    pattern: '🍕🍔🍟'
  },
  {
    id: '2',
    title: 'Special Offers',
    subtitle: 'Save up to 30% on your orders',
    bg: [COLORS.secondary, '#357ABD'],
    emoji: '🎉',
    pattern: '🎊🎈🎁'
  },
  {
    id: '3',
    title: 'Quick Delivery',
    subtitle: 'Hot food delivered in 30 minutes',
    bg: [COLORS.accent, '#E6A429'],
    emoji: '⚡',
    pattern: '⭐💫✨'
  },
];

export default function Login() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const initializationRef = useRef(false);

  // Reset authentication state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Login screen focused, resetting states');
      setIsGoogleLoading(false);
      setIsAuthenticating(false);
      setNavigationAttempted(false);
      initializationRef.current = false;
    }, [])
  );

  // **FIXED: Check cached user and navigate to Home if valid**
  const checkCachedUserAndNavigate = async (userToken, userEmail) => {
    try {
      console.log('🔍 Checking cached user status...');
      console.log('📧 Email to check:', userEmail);
      console.log('🔑 Token to verify:', userToken);
      
      const response = await fetch('http://212.38.94.189:8000/api/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      if (!response.ok) {
        console.log('❌ User verification failed - staying on login screen');
        return false;
      }
      const responseData = await response.json();
      console.log('🔍 User verification response:', responseData);
      
      // FIXED: Check responseData.data instead of responseData
      if(responseData.data && 
         (responseData.data.name == "" || !responseData.data.name) && 
         (responseData.data.phone == "" || !responseData.data.phone) && 
         (responseData.data.area == "" || !responseData.data.area) && 
         (responseData.data.city == "" || !responseData.data.city) && 
         (responseData.data.full_address == "" || !responseData.data.full_address)){
        
        console.log('🆕 Incomplete profile detected - navigating to UserDetailsScreen');
        navigation.navigate('UserDetailsScreen');
        return true;
      }
      
      console.log('✅ Cached user verification response:', responseData);

      if (responseData.status === 'success' || responseData.status === 'ok') {
        // Check if email and token match from response
        if (responseData.data?.email === userEmail && responseData.data?.token === userToken) {
          console.log('✅ Cached user verified - navigating to Home');
          
          // Update local storage with latest user data
          const updatedUserData = {
            email: userEmail,
            name: responseData.data?.name || '',
            phone: responseData.data?.phone || '',
            area: responseData.data?.area || '',
            city: responseData.data?.city || '',
            full_address: responseData.data?.full_address || '',
            new_user: false,
            token: userToken,
            loginTime: new Date().toISOString(),
            status: 'success',
            profileCompleted: true
          };
          
          await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUserData));
          
          setNavigationAttempted(true);
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }, 500);
          
          return true;
        } else {
          console.log('❌ Email or token mismatch - staying on login screen');
          return false;
        }
      } else {
        console.log('❌ Invalid response status - staying on login screen');
        return false;
      }

    } catch (error) {
      console.error('❌ Error checking cached user:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initializations
      if (initializationRef.current || navigationAttempted) {
        console.log('⚠️ Initialization already attempted, skipping');
        return;
      }

      initializationRef.current = true;
      setIsInitializing(true);
      
      try {
        console.log('🚀 Starting app initialization...');
        
        // Configure Google Sign-In
        const config = {
          webClientId: '88618355277-6vaut5msg35h3q2qkf1mq7ec1v8vikc2.apps.googleusercontent.com',
        };

        if (Platform.OS === 'ios') {
          config.iosClientId = '88618355277-tqbeqvv88c7f4cm37g1d4urblpmonvio.apps.googleusercontent.com';
        } else if (Platform.OS === 'android') {
          config.offlineAccess = false;
        }

        GoogleSignin.configure(config);
        console.log(`Google Sign-In configured successfully for ${Platform.OS}`);

        // **FIXED: Check cached token/email and navigate if valid**
        const userToken = await AsyncStorage.getItem('@user_token');
        const userEmail = await AsyncStorage.getItem('@user_email');
        
        console.log('🔍 Cache check - Token exists:',userToken, !!userToken);
        console.log('🔍 Cache check - Email exists:', !!userEmail);
        
        if (userToken && userEmail && !navigationAttempted && isFocused) {
          console.log('🔄 Found cached token/email - verifying with backend...');
          
          const navigated = await checkCachedUserAndNavigate(userToken, userEmail);
          
          if (navigated) {
            return; // User was verified and navigation happened
          }
          // If not navigated, continue to show login screen
        }
        
        console.log('ℹ️ No cached session or verification failed - showing login screen');
      } catch (error) {
        console.error("❌ App initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Only initialize when screen is focused and not already attempted
    if (isFocused && !navigationAttempted) {
      initializeApp();
    }
  }, [navigation, isFocused, navigationAttempted]);

  // Enhanced Animation effects
  useEffect(() => {
    if (!isInitializing && !navigationAttempted && isFocused) {
      // Logo rotation animation
      Animated.loop(
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Main animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]).start();

      // Enhanced banner carousel
      const interval = setInterval(() => {
        setActiveSlide(current => {
          const next = (current + 1) % banners.length;
          flatListRef.current?.scrollToIndex({ 
            index: next, 
            animated: true 
          });
          return next;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isInitializing, navigationAttempted, isFocused]);

  // Enhanced banner render with professional design
  const renderBanner = ({ item }) => (
    <View style={styles.bannerWrapper}>
      <LinearGradient colors={item.bg} style={styles.bannerCard}>
        <View style={styles.bannerPattern}>
          <Text style={styles.bannerPatternText}>{item.pattern}</Text>
        </View>
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerEmoji}>{item.emoji}</Text>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const showAlert = (title, message, onPress = null) => {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  };

  // **ENHANCED: Google Sign-In with proper new_user logic**
  const handleLogingoogle = async () => {
    console.log('🚀 GOOGLE LOGIN CLICKED - Starting authentication');
    
    if (isAuthenticating) {
      console.log('⚠️ Authentication already in progress');
      return;
    }

    if (!termsAccepted) {
      showAlert('Terms Required', 'Please accept terms and conditions first');
      return;
    }

    setIsAuthenticating(true);
    setIsGoogleLoading(true);
    
    try {
      console.log('🔄 Step 1: Starting Google Sign-In...');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log('ℹ️ No existing Google session to sign out');
      }
      
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo) {
        throw new Error('No user information received from Google Sign-In');
      }

      console.log('✅ Step 2: Google Sign-In successful');

      // Extract email and token from Google response
      let email, token;
      
      if (userInfo.data && userInfo.data.user) {
        email = userInfo.data.user.email;
        token = userInfo.data.idToken;
      } else if (userInfo.user) {
        email = userInfo.user.email;
        token = userInfo.idToken;
      } else {
        email = userInfo.email;
        token = userInfo.idToken;
      }

      if (!email || !token) {
        throw new Error('Essential authentication data missing from Google response');
      }

      console.log('📧 Email:', email);
      console.log('🔑 Google token received');

      // **Step 3: Send to backend for authentication**
      console.log('🚀 Step 3: Sending login request to backend...');
      
      const response = await fetch('http://212.38.94.189:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          google_token: token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend login failed: ${response.status}`);
      }

      const backendData = await response.json();
      console.log('✅ Step 4: Backend response received:', backendData);

      if (backendData.data && backendData.data.token) {
        // **ROUTING LOGIC: Check new_user and navigate accordingly**
        const isNewUser = backendData.data.new_user === true;
        
        console.log('🎯 Backend new_user field:', backendData.data.new_user);
        console.log('🎯 Is new user:', isNewUser);
        
        if (isNewUser) {
          console.log('🆕 NEW USER (new_user=true) - Navigating to UserDetailsScreen');
          
          // Store token and email for new user
          await AsyncStorage.setItem('@user_token', backendData.data.token);
          await AsyncStorage.setItem('@user_email', email);
          
          const userDataToStore = {
            email: email,
            name: backendData.data.name || '',
            new_user: true,
            token: backendData.data.token,
            loginTime: new Date().toISOString(),
            status: backendData.status,
            profileCompleted: false
          };
          
          await AsyncStorage.setItem('@user_data', JSON.stringify(userDataToStore));
          
          setNavigationAttempted(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserDetailsScreen' }],
          });
          
        } else {
          console.log('👨‍💼 EXISTING USER (new_user=false) - Storing data and navigating to Home');
          
          // Store response token and email
          await AsyncStorage.setItem('@user_token', backendData.data.token);
          await AsyncStorage.setItem('@user_email', email);
          
          const userDataToStore = {
            email: email,
            name: backendData.data.name || '',
            phone: backendData.data.phone || '',
            area: backendData.data.area || '',
            city: backendData.data.city || '',
            full_address: backendData.data.full_address || '',
            new_user: false,
            token: backendData.data.token,
            loginTime: new Date().toISOString(),
            status: backendData.status,
            profileCompleted: true
          };
          
          await AsyncStorage.setItem('@user_data', JSON.stringify(userDataToStore));
          
          setNavigationAttempted(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
        
      } else {
        throw new Error('No token received from backend');
      }

    } catch (error) {
      console.error('❌ Google login error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled Google Sign-In');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showAlert('Please Wait', 'Sign-in is already in progress. Please wait a moment.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showAlert('Service Unavailable', 'Google Play Services is not available on this device.');
      } else {
        showAlert('Sign-In Failed', error.message || 'Unable to complete Google Sign-In. Please try again.');
      }
    } finally {
      // Reset states
      setIsAuthenticating(false);
      setIsGoogleLoading(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Enhanced loading screen
  if (isInitializing || navigationAttempted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Animated.View 
              style={[
                styles.loadingLogo,
                { transform: [{ rotate: logoRotation }] }
              ]}
            >
              <LinearGradient
                colors={[COLORS.surface, COLORS.surfaceElevated]}
                style={styles.loadingLogoCircle}
              >
                <Text style={styles.loadingLogoText}>F</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.loadingTitle}>Foodie</Text>
            <Text style={styles.loadingSubtitle}>
              {navigationAttempted ? 'Redirecting...' : 'Loading...'}
            </Text>
            <View style={styles.loadingDots}>
              <View style={[styles.loadingDot, { animationDelay: '0ms' }]} />
              <View style={[styles.loadingDot, { animationDelay: '200ms' }]} />
              <View style={[styles.loadingDot, { animationDelay: '400ms' }]} />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background} 
        translucent={false}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>F</Text>
              <View style={styles.logoRing} />
            </LinearGradient>
          </View>
          <Text style={styles.appTitle}>Foodie</Text>
          <Text style={styles.appSubtitle}>Delicious food delivered to you</Text>
        </View>

        {/* FIXED Enhanced Carousel */}
        <View style={styles.carouselSection}>
          <FlatList
            ref={flatListRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.carousel}
            snapToInterval={width - (SCREEN_PADDING * 2)} // FIXED: Perfect snap interval
            decelerationRate="fast"
            contentContainerStyle={{}} // FIXED: No extra padding needed
          />
          
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index && styles.activeDot,
                ]}
                onPress={() => {
                  setActiveSlide(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>

        {/* Enhanced Login Section */}
        <View style={styles.loginSection}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceElevated]}
            style={styles.loginGradient}
          >
            <Text style={styles.loginTitle}>Get Started</Text>
            <Text style={styles.loginSubtitle}>
              Sign in with your Google account to continue
            </Text>

            {/* Enhanced Google Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!termsAccepted || isAuthenticating) && styles.disabledButton,
              ]}
              onPress={handleLogingoogle}
              disabled={!termsAccepted || isAuthenticating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.surface, COLORS.surfaceAlt]}
                style={styles.googleButtonGradient}
              >
                <View style={styles.buttonIconContainer}>
                  <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primaryUltraLight]}
                    style={styles.buttonIcon}
                  >
                    <Text style={styles.googleIcon}>G</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.buttonText}>
                  {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
                {isGoogleLoading && (
                  <View style={styles.loadingIndicator}>
                    <Text style={styles.loadingDots}>●●●</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Enhanced Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.8}
              disabled={isAuthenticating}
            >
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={termsAccepted}
                  onValueChange={setTermsAccepted}
                  color={termsAccepted ? COLORS.primary : COLORS.border}
                  style={styles.checkbox}
                />
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Enhanced Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    marginBottom: SPACING.xl,
  },
  loadingLogoCircle: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingLogoText: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '900',
    color: COLORS.primary,
  },
  loadingTitle: {
    fontSize: isTablet ? FONTS.huge : FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  loadingSubtitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  // Enhanced Content Styles
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.xxl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxxl : SPACING.xl,
    justifyContent: 'space-between',
  },

  // Enhanced Header Styles
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  logoRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: isTablet ? 44 : 34,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  logoText: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  appTitle: {
    fontSize: isTablet ? FONTS.huge : FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // FIXED Enhanced Carousel Styles
  carouselSection: {
    marginVertical: SPACING.xl,
  },
  carousel: {
    height: isTablet ? 200 : 180,
  },
  bannerWrapper: {
    width: width - (SCREEN_PADDING * 2), // FIXED: Exact screen width minus both sides padding
    paddingHorizontal: 0, // FIXED: No extra padding
    marginHorizontal: 0, // FIXED: No margin
  },
  bannerCard: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    height: isTablet ? 180 : 160,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    position: 'relative',
    marginHorizontal: SPACING.md, // FIXED: Small margin for visual separation
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
  bannerContent: {
    flex: 1,
    padding: isTablet ? SPACING.xxl : SPACING.xl,
    justifyContent: 'center',
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerEmoji: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    marginBottom: SPACING.md,
  },
  bannerTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  bannerSubtitle: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    lineHeight: isTablet ? 22 : 20,
  },

  // Enhanced Dots Styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },

  // Enhanced Login Section Styles
  loginSection: {
    borderRadius: BORDER_RADIUS.xxl,
    elevation: 8,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  loginGradient: {
    padding: isTablet ? SPACING.xxxl : SPACING.xxl,
  },
  loginTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  loginSubtitle: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    fontWeight: '500',
    lineHeight: isTablet ? 24 : 20,
  },

  // Enhanced Login Button Styles
  loginButton: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  buttonIconContainer: {
    marginRight: SPACING.md,
  },
  buttonIcon: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  googleIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '800',
    color: COLORS.primary,
  },
  buttonText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  loadingIndicator: {
    marginLeft: SPACING.md,
  },
  loadingDots: {
    color: COLORS.textMuted,
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
  },

  // Enhanced Terms Styles
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  checkboxContainer: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  checkbox: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    borderRadius: BORDER_RADIUS.xs,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    lineHeight: isTablet ? 22 : 18,
    fontWeight: '500',
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

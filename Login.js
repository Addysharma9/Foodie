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
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const banners = [
  {
    id: '1',
    title: 'Fresh & Delicious',
    subtitle: 'Get your favorite meals delivered',
    bg: ['#FF6B35', '#F7931E'],
    emoji: '🍕'
  },
  {
    id: '2',
    title: 'Special Offers',
    subtitle: 'Save up to 30% on your orders',
    bg: ['#f093fb', '#f5576c'],
    emoji: '🎉'
  },
  {
    id: '3',
    title: 'Quick Delivery',
    subtitle: 'Hot food delivered in 30 minutes',
    bg: ['#FF6B35', '#FFB347'],
    emoji: '⚡'
  },
];

export default function Login() {
  const navigation = useNavigation();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Configure Google Sign-In
      try {
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
      } catch (error) {
        console.error("Google Sign-In configuration error:", error);
      }

      // Check Apple Sign-In availability
      if (Platform.OS === 'ios') {
        try {
          const isAvailable = await AppleAuthentication.isAvailableAsync();
          setIsAppleLoginAvailable(isAvailable);
          console.log("Apple Sign-In available:", isAvailable);
        } catch (error) {
          console.error("Apple Sign-In availability check error:", error);
          setIsAppleLoginAvailable(false);
        }
      }

      // Check stored user
      try {
        const storedUserData = await AsyncStorage.getItem('@foodie_user_data');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('🔄 Stored user found:', userData.displayName || userData.email);
          setUser(userData);
          
          // Navigate immediately
          navigation.navigate('UserDetailsScreen');
        } else {
          console.log('No stored user data found');
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      }
    };

    initializeApp();
  }, [navigation]);

  // Animation effects
  useEffect(() => {
    if (!user) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      const interval = setInterval(() => {
        setActiveSlide(current => {
          const next = (current + 1) % banners.length;
          flatListRef.current?.scrollToIndex({ 
            index: next, 
            animated: true 
          });
          return next;
        });
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [user]);

  const renderBanner = ({ item }) => (
    <View style={styles.bannerWrapper}>
      <LinearGradient colors={item.bg} style={styles.bannerCard}>
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

  // Store user data locally
  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('@foodie_user_data', JSON.stringify(userData));
      console.log('✅ User data stored locally');
      console.log('📋 === CACHED USER DATA ===');
      console.log(JSON.stringify(userData, null, 2));
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  };

  // Handle successful login
  const handleSuccessfulLogin = async (userData) => {
    try {
      await storeUserData(userData);
      setUser(userData);
      
      console.log('✅ Login successful for:', userData.displayName || userData.email);
      
      // Navigate directly
      navigation.navigate('UserDetailsScreen');
    } catch (error) {
      console.error('❌ Error in handleSuccessfulLogin:', error);
      showAlert('Error', 'Login was successful but navigation failed. Please try again.');
    }
  };

  // Google Sign-In Handler
  const handleLogingoogle = async () => {
    if (!termsAccepted || isAuthenticating) {
      showAlert('Terms Required', 'Please accept terms and conditions first');
      return;
    }

    setIsAuthenticating(true);
    setIsGoogleLoading(true);
    
    try {
      console.log('🔄 Starting Google Sign-In process...');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      let googleUser;
      if (userInfo.data && userInfo.data.user) {
        googleUser = userInfo.data.user;
      } else if (userInfo.user) {
        googleUser = userInfo.user;
      } else {
        googleUser = {
          id: userInfo.id,
          name: userInfo.name || userInfo.displayName,
          email: userInfo.email,
          photo: userInfo.photo || userInfo.photoURL,
          givenName: userInfo.givenName,
          familyName: userInfo.familyName,
        };
      }

      const customUserData = {
        uid: googleUser.id || userInfo.id || `google_${Date.now()}`,
        email: googleUser.email || userInfo.email,
        displayName: googleUser.name || userInfo.name || userInfo.displayName,
        firstName: googleUser.givenName || userInfo.givenName || '',
        lastName: googleUser.familyName || userInfo.familyName || '',
        photoURL: googleUser.photo || userInfo.photo || userInfo.photoURL || '',
        provider: 'google',
        providerId: 'google.com',
        providerData: {
          googleId: googleUser.id || userInfo.id,
          serverAuthCode: userInfo.data?.serverAuthCode || userInfo.serverAuthCode,
          idToken: (userInfo.data?.idToken || userInfo.idToken) ? 'present' : 'not_available',
        },
        loginTime: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: '1.0.0',
        isEmailVerified: true,
        preferences: {
          notifications: true,
          location: false,
        },
        profile: {
          isComplete: false,
          phoneNumber: '',
          address: '',
        }
      };

      await handleSuccessfulLogin(customUserData);

    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled Google Sign-In');
      } else {
        showAlert('Sign-In Failed', error.message || 'Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
      setIsAuthenticating(false);
    }
  };

  // Apple Sign-In Handler
  const handleLoginApple = async () => {
    if (!termsAccepted || isAuthenticating) {
      showAlert('Terms Required', 'Please accept terms and conditions first');
      return;
    }

    if (Platform.OS !== 'ios' || !isAppleLoginAvailable) {
      showAlert('Not Available', 'Apple Sign-In is not available on this device');
      return;
    }

    setIsAuthenticating(true);
    setIsAppleLoading(true);
    
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const customUserData = {
        uid: credential.user || `apple_${Date.now()}`,
        email: credential.email || '',
        displayName: credential.fullName ? 
          `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
          'Apple User',
        firstName: credential.fullName?.givenName || '',
        lastName: credential.fullName?.familyName || '',
        photoURL: '',
        provider: 'apple',
        providerId: 'apple.com',
        providerData: {
          appleId: credential.user,
          identityToken: credential.identityToken ? 'present' : 'not_available',
          authorizationCode: credential.authorizationCode ? 'present' : 'not_available',
        },
        loginTime: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: '1.0.0',
        isEmailVerified: credential.email ? true : false,
        preferences: {
          notifications: true,
          location: false,
        },
        profile: {
          isComplete: false,
          phoneNumber: '',
          address: '',
        }
      };

      await handleSuccessfulLogin(customUserData);
      
    } catch (error) {
      console.error('🍎 Apple Sign-In error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        console.log('🍎 Apple Sign-In was canceled by user');
      } else {
        showAlert('Error', 'Apple Sign-In failed. Please try again.');
      }
    } finally {
      setIsAppleLoading(false);
      setIsAuthenticating(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8fafc" 
        translucent={false}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>F</Text>
            </LinearGradient>
          </View>
          <Text style={styles.appTitle}>Foodie</Text>
          <Text style={styles.appSubtitle}>Delicious food delivered to you</Text>
        </View>

        {/* Carousel */}
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
            snapToInterval={width - 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />
          
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Login Section */}
        <View style={styles.loginSection}>
          <Text style={styles.loginTitle}>Get Started</Text>
          <Text style={styles.loginSubtitle}>
            Choose your preferred way to continue
          </Text>

          {/* Google Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              styles.googleButton,
              (!termsAccepted || isAuthenticating) && styles.disabledButton,
            ]}
            onPress={handleLogingoogle}
            disabled={!termsAccepted || isAuthenticating}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIcon}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.buttonText}>
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
            {isGoogleLoading && <Text style={styles.loadingDots}>●●●</Text>}
          </TouchableOpacity>

          {/* Apple Button (iOS only) */}
          {Platform.OS === 'ios' && isAppleLoginAvailable && (
            <TouchableOpacity
              style={[
                styles.loginButton,
                styles.appleButton,
                (!termsAccepted || isAuthenticating) && styles.disabledButton,
              ]}
              onPress={handleLoginApple}
              disabled={!termsAccepted || isAuthenticating}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIcon}>
                <Text style={styles.appleIcon}>🍎</Text>
              </View>
              <Text style={[styles.buttonText, styles.appleButtonText]}>
                {isAppleLoading ? 'Signing in...' : 'Continue with Apple'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.8}
          >
            <Checkbox
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              color={termsAccepted ? '#FF6B35' : '#d1d5db'}
              style={styles.checkbox}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}



// Keep all your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.02 : height * 0.05,
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  loadingDots: {
    marginLeft: 10,
    color: '#6b7280',
    fontSize: 12,
  },
  header: {
    alignItems: 'center',
    paddingBottom: height * 0.01,
  },
  logoContainer: {
    marginBottom: height * 0.01,
  },
  logoCircle: {
    width: Math.min(width * 0.15, 60),
    height: Math.min(width * 0.15, 60),
    borderRadius: Math.min(width * 0.075, 30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    color: '#fff',
  },
  appTitle: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
    textAlign: 'center',
  },
  carouselSection: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: height * 0.32,
  },
  carousel: {
    height: Math.min(height * 0.25, 170),
  },
  bannerWrapper: {
    width: width - (width * 0.1),
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
  },
  bannerContent: {
    padding: width * 0.05,
    height: Math.min(height * 0.22, 150),
    justifyContent: 'center',
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerEmoji: {
    fontSize: Math.min(width * 0.08, 32),
    marginBottom: 8,
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
    marginBottom: height * 0.05,
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
  loginSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.1,
  },
  loginTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 12,
    marginBottom: height * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  appleIcon: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#fff',
  },
  buttonText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#374151',
  },
  appleButtonText: {
    color: '#fff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: height * 0.015,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: Math.min(width * 0.035, 14),
    color: '#6b7280',
    lineHeight: 20,
  },
  linkText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});

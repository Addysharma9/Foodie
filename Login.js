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
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';

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
  const isFocused = useIsFocused();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
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

  // Animation effects
  useEffect(() => {
    if (!isInitializing && !navigationAttempted && isFocused) {
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
  }, [isInitializing, navigationAttempted, isFocused]);

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

  // Show loading screen during initialization
  if (isInitializing || navigationAttempted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>F</Text>
          </LinearGradient>
          <Text style={[styles.appTitle, { marginTop: 20 }]}>Foodie</Text>
          <Text style={styles.appSubtitle}>
            {navigationAttempted ? 'Redirecting...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Sign in with your Google account to continue
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

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.8}
            disabled={isAuthenticating}
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
    paddingBottom: height * 0.02, // Add bottom padding
    backgroundColor: 'transparent', // Ensure no background
    zIndex: 1,
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
  // FIXED CAROUSEL SECTION
  carouselSection: {
    marginVertical: height * 0.02, // Add top and bottom margin
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 180, // Minimum height to prevent collapsing
    maxHeight: 220, // Maximum height for consistency
  },
  carousel: {
    height: Math.min(height * 0.25, 180), // Responsive but capped height
    width: '100%',
  },
  bannerWrapper: {
    width: width - (width * 0.1), // Responsive width
    paddingHorizontal: 5,
    alignSelf: 'center', // Center the banner
    marginBottom: 10, // Space below banner
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FF6B35', // Fallback background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6, // Android shadow
  },
  bannerContent: {
    padding: width * 0.05,
    height: 150, // Fixed height for consistency
    justifyContent: 'center',
    minHeight: 120, // Minimum height
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
  // FIXED DOTS CONTAINER
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    paddingBottom: height * 0.03, // Extra bottom padding
    backgroundColor: 'transparent',
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
  // FIXED LOGIN SECTION
  loginSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: height * 0.02, // Space above login section
    marginBottom: Platform.OS === 'ios' ? height * 0.1 : height * 0.12, // Responsive bottom margin
    marginHorizontal: width * 0.02, // Side margins
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
    marginBottom: height * 0.02,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018, // Slightly larger tap area
    paddingHorizontal: width * 0.05,
    borderRadius: 12,
    marginBottom: height * 0.015,
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
  buttonText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#374151',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: height * 0.02,
    paddingVertical: 8,
    paddingHorizontal: 4, // Side padding
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

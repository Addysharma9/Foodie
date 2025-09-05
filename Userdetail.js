import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
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

const cityAreaData = {
  jalandhar: {
    name: 'Jalandhar',
    areas: [
      { id: '16', name: 'Lovely Professional University', icon: '🎓' },
      { id: '11', name: 'Civil Lines', icon: '🏛️' },
      { id: '12', name: 'Model Town', icon: '🏘️' },
      { id: '13', name: 'Cantt Area', icon: '🏭' },
      { id: '14', name: 'Guru Gobind Singh Avenue', icon: '🛤️' },
      { id: '15', name: 'Jalandhar City Centre', icon: '🏪' },
    ],
  },
  pune: {
    name: 'Pune',
    areas: [
      { id: '17', name: 'Koregaon Park', icon: '🌳' },
      { id: '18', name: 'Baner', icon: '🏢' },
      { id: '19', name: 'Hinjewadi IT Hub', icon: '💻' },
      { id: '20', name: 'Viman Nagar', icon: '✈️' },
      { id: '21', name: 'Kothrud', icon: '🏘️' },
      { id: '22', name: 'Deccan Gymkhana', icon: '🏟️' },
      { id: '23', name: 'FC Road', icon: '🛍️' },
      { id: '24', name: 'Camp Area', icon: '🏪' },
    ],
  },
};

export default function UserDetailsScreen() {
  console.log('🎯 UserDetailsScreen - Profile Setup Form loaded!');

  const navigation = useNavigation();

  // Form state - Same as your reference
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Backend integration state
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [cacheData, setCacheData] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const formScaleAnim = useRef(new Animated.Value(0.95)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 10000,
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
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(formScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Load user data for backend integration
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('📱 Loading stored user data...');

      const token = await AsyncStorage.getItem('@user_token');
      const email = await AsyncStorage.getItem('@user_email');
      const userData = await AsyncStorage.getItem('@user_data');

      console.log('📱 Token:', token);
      console.log('📱 Email:', email);

      if (token && email) {
        setUserToken(token);
        setUserEmail(email);

        // Set cache data for display
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            setCacheData(parsedData);

            // Pre-fill form with existing data
            if (parsedData.name) setName(parsedData.name);

            console.log('📋 Pre-filled existing data');
          } catch (error) {
            console.log('⚠️ Error parsing existing user data');
          }
        } else {
          // Create basic cache data
          setCacheData({
            email: email,
            displayName: '',
            uid: token.substring(0, 8),
            provider: 'google',
            loginTime: new Date().toISOString()
          });
        }
      } else {
        console.log('❌ No valid token found, redirecting to login');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.length < 10) newErrors.phone = 'Enter valid phone number';
    if (!selectedCity) newErrors.city = 'Please select a city';
    if (!selectedArea) newErrors.area = 'Please select an area';
    if (!fullAddress.trim()) newErrors.fullAddress = 'Full address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // **UPDATED: Backend integration with register API**
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        console.log('💾 Saving profile data to backend...');
        console.log('🔑 Using token:', userToken);

        // Prepare data in the exact format specified
        const profileData = {
          email: userEmail,
          name: name.trim(),
          phone: phone.trim(),
          area: getSelectedAreaName(), // Send area name
          city: cityAreaData[selectedCity].name, // Send city name
          full_address: fullAddress.trim(),
        };

        console.log('📤 Sending data:', profileData);

        // Send to your register API endpoint
        const response = await fetch('http://212.38.94.189:8000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userToken}`, // User token in header
          },
          body: JSON.stringify(profileData),
        });

        console.log('📡 Registration response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Backend error:', errorText);
          throw new Error(`Registration failed: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('✅ Registration successful:', responseData);

        // Check if status is ok before proceeding
        if (responseData.status === 'ok' || responseData.status === 'success') {
          // Update local storage with complete data
          const updatedUserData = {
            ...cacheData,
            name: name.trim(),
            displayName: name.trim(),
            phone: phone.trim(),
            full_address: fullAddress.trim(),
            area: getSelectedAreaName(),
            city: cityAreaData[selectedCity].name,
            profileCompleted: true,
            registrationCompleted: true,
            completedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };

          await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUserData));
          console.log('💾 Updated user data stored locally');

          // Success message and navigate to Home
          Alert.alert(
            'Registration Complete!',
            `Welcome ${name}! Your profile has been registered successfully.\n\nDelivery area: ${getSelectedAreaName()}, ${cityAreaData[selectedCity].name}`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  console.log('🏠 Navigating to Home after registration');
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }], // ✅ correct stack route
                    })
                  );

                }
              }
            ]
          );
        } else {
          throw new Error(responseData.message || 'Registration failed - invalid status');
        }

      } catch (error) {
        console.error('❌ Registration error:', error);
        Alert.alert(
          'Registration Failed',
          error.message || 'Unable to complete your registration. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectCity = (cityKey) => {
    setSelectedCity(cityKey);
    setSelectedArea(''); // Reset area when city changes
    setShowCityModal(false);
    setErrors(prev => ({ ...prev, city: '', area: '' }));
  };

  const selectArea = (areaId) => {
    setSelectedArea(areaId);
    setShowAreaModal(false);
    setErrors(prev => ({ ...prev, area: '' }));
  };

  const getSelectedAreaName = () => {
    if (!selectedCity || !selectedArea) return '';
    const area = cityAreaData[selectedCity]?.areas.find(a => a.id === selectedArea);
    return area ? area.name : '';
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderCityModal = () => (
    <Modal
      visible={showCityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: formScaleAnim }] }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity onPress={() => setShowCityModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {Object.keys(cityAreaData).map((cityKey) => (
              <TouchableOpacity
                key={cityKey}
                style={[
                  styles.modalItem,
                  selectedCity === cityKey && styles.selectedModalItem
                ]}
                onPress={() => selectCity(cityKey)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedCity === cityKey
                      ? [COLORS.primaryUltraLight, COLORS.primaryLight]
                      : [COLORS.surface, COLORS.surfaceAlt]
                  }
                  style={styles.modalItemGradient}
                >
                  <Text style={styles.modalItemIcon}>
                    {cityKey === 'jalandhar' ? '🏛️' : '🏙️'}
                  </Text>
                  <Text style={[
                    styles.modalItemText,
                    selectedCity === cityKey && styles.selectedModalItemText
                  ]}>
                    {cityAreaData[cityKey].name}
                  </Text>
                  {selectedCity === cityKey && (
                    <View style={styles.selectedIndicator}>
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.selectedIndicatorGradient}
                      >
                        <Text style={styles.checkIcon}>✓</Text>
                      </LinearGradient>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderAreaModal = () => (
    <Modal
      visible={showAreaModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAreaModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: formScaleAnim }] }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select Area in {cityAreaData[selectedCity]?.name}
            </Text>
            <TouchableOpacity onPress={() => setShowAreaModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {selectedCity && cityAreaData[selectedCity]?.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.modalItem,
                  selectedArea === area.id && styles.selectedModalItem
                ]}
                onPress={() => selectArea(area.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedArea === area.id
                      ? [COLORS.primaryUltraLight, COLORS.primaryLight]
                      : [COLORS.surface, COLORS.surfaceAlt]
                  }
                  style={styles.modalItemGradient}
                >
                  <Text style={styles.modalItemIcon}>{area.icon}</Text>
                  <Text style={[
                    styles.modalItemText,
                    selectedArea === area.id && styles.selectedModalItemText
                  ]}>
                    {area.name}
                  </Text>
                  {selectedArea === area.id && (
                    <View style={styles.selectedIndicator}>
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.selectedIndicatorGradient}
                      >
                        <Text style={styles.checkIcon}>✓</Text>
                      </LinearGradient>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* FIXED: KeyboardAvoidingView for proper keyboard handling */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.View style={[{ transform: [{ rotate: logoRotation }] }]}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.logoCircle}
                >
                  <Text style={styles.logoText}>📍</Text>
                  <View style={styles.logoRing} />
                </LinearGradient>
              </Animated.View>
            </View>
            <Text style={styles.appTitle}>
              Almost <Text style={styles.appTitleAccent}>There!</Text>
            </Text>
            <Text style={styles.appSubtitle}>
              Help us deliver to your doorstep
            </Text>

            {/* Display user info if available */}
            {cacheData && (
              <View style={styles.userInfoContainer}>
                <LinearGradient
                  colors={[COLORS.primaryUltraLight, COLORS.primaryLight]}
                  style={styles.userInfoGradient}
                >
                  <Text style={styles.userInfoText}>
                    Welcome, {cacheData.displayName || userEmail}!
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Enhanced Form Card */}
          <Animated.View
            style={[
              styles.formCard,
              { transform: [{ scale: formScaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceElevated]}
              style={styles.formGradient}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                    <LinearGradient
                      colors={[COLORS.surfaceAlt, COLORS.surface]}
                      style={styles.inputGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Text style={styles.inputIcon}>👤</Text>
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your full name"
                        placeholderTextColor={COLORS.textMuted}
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                        }}
                      />
                    </LinearGradient>
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                    <LinearGradient
                      colors={[COLORS.surfaceAlt, COLORS.surface]}
                      style={styles.inputGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Text style={styles.inputIcon}>📱</Text>
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your phone number"
                        placeholderTextColor={COLORS.textMuted}
                        value={phone}
                        onChangeText={(text) => {
                          setPhone(text.replace(/[^0-9]/g, ''));
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </LinearGradient>
                  </View>
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                {/* City Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TouchableOpacity
                    style={[styles.dropdownContainer, errors.city && styles.inputError]}
                    onPress={() => setShowCityModal(true)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[COLORS.surfaceAlt, COLORS.surface]}
                      style={styles.dropdownGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Text style={styles.inputIcon}>🏙️</Text>
                      </View>
                      <Text style={[
                        styles.dropdownText,
                        !selectedCity && styles.placeholderText
                      ]}>
                        {selectedCity ? cityAreaData[selectedCity].name : 'Select your city'}
                      </Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                </View>

                {/* Area Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Area</Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownContainer,
                      !selectedCity && styles.disabledDropdown,
                      errors.area && styles.inputError
                    ]}
                    onPress={() => selectedCity && setShowAreaModal(true)}
                    disabled={!selectedCity}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={!selectedCity ? [COLORS.borderLight, COLORS.borderLight] : [COLORS.surfaceAlt, COLORS.surface]}
                      style={styles.dropdownGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Text style={styles.inputIcon}>📍</Text>
                      </View>
                      <Text style={[
                        styles.dropdownText,
                        (!selectedArea || !selectedCity) && styles.placeholderText
                      ]}>
                        {selectedArea && selectedCity ? getSelectedAreaName() : 'Select your area'}
                      </Text>
                      <Text style={[
                        styles.dropdownArrow,
                        !selectedCity && styles.disabledArrow
                      ]}>▼</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
                </View>

                {/* Full Address Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Address</Text>
                  <View style={[styles.addressContainer, errors.fullAddress && styles.inputError]}>
                    <LinearGradient
                      colors={[COLORS.surfaceAlt, COLORS.surface]}
                      style={styles.addressGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Text style={styles.inputIcon}>🏠</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.addressInput]}
                        placeholder="House/flat number, street, etc."
                        placeholderTextColor={COLORS.textMuted}
                        value={fullAddress}
                        onChangeText={(text) => {
                          setFullAddress(text);
                          if (errors.fullAddress) setErrors(prev => ({ ...prev, fullAddress: '' }));
                        }}
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </LinearGradient>
                  </View>
                  {errors.fullAddress && <Text style={styles.errorText}>{errors.fullAddress}</Text>}
                </View>

                {/* Enhanced Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.disabledButton]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? 'Registering...' : 'Complete Registration'}
                    </Text>
                    {!isLoading && <Text style={styles.submitArrow}>→</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Enhanced Modals */}
      {renderCityModal()}
      {renderAreaModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // FIXED: Keyboard handling
  keyboardAvoidingView: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.xxl,
    paddingBottom: SPACING.lg,
  },

  // Enhanced Header Styles
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: isTablet ? 70 : 60,
    height: isTablet ? 70 : 60,
    borderRadius: isTablet ? 35 : 30,
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
    borderRadius: isTablet ? 39 : 34,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  logoText: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
  },
  appTitle: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  appTitleAccent: {
    color: COLORS.primary,
  },
  appSubtitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Enhanced User info container
  userInfoContainer: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  userInfoGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userInfoText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Enhanced Form Card
  formCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xxl,
    elevation: 8,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  formGradient: {
    flex: 1,
    padding: isTablet ? SPACING.xxl : SPACING.xl,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // Enhanced Input Groups
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.2,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    minHeight: isTablet ? 56 : 48,
  },
  addressContainer: {
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  addressGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    minHeight: isTablet ? 100 : 80,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIconContainer: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  inputIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
  },
  textInput: {
    flex: 1,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  addressInput: {
    minHeight: isTablet ? 60 : 48,
    textAlignVertical: 'top',
    paddingTop: 0,
  },

  // Enhanced Dropdown
  dropdownContainer: {
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  dropdownGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    minHeight: isTablet ? 56 : 48,
  },
  disabledDropdown: {
    opacity: 0.6,
  },
  dropdownText: {
    flex: 1,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  dropdownArrow: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  disabledArrow: {
    color: COLORS.textDisabled,
  },

  // Enhanced Error Text
  errorText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.error,
    marginTop: SPACING.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },

  // Enhanced Submit Button
  submitButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  submitButtonText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginRight: SPACING.md,
    letterSpacing: 0.3,
  },
  submitArrow: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textInverse,
    fontWeight: '800',
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: height * 0.6,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  closeButton: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  closeButtonText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  modalScrollView: {
    maxHeight: height * 0.4,
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
  },
  modalItem: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  selectedModalItem: {},
  modalItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    paddingHorizontal: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  modalItemIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    marginRight: SPACING.md,
    width: isTablet ? 28 : 24,
  },
  modalItemText: {
    flex: 1,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  selectedModalItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectedIndicator: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  selectedIndicatorGradient: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textInverse,
    fontWeight: '900',
  },
});

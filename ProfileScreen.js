import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
  TextInput,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const baseURL = 'http://212.38.94.189:8000';

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
  
  // Additional colors
  purple: '#9C27B0',
  teal: '#009688',
  indigo: '#3F51B5',
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

// Enhanced Pulse Animation Component
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
      {children || <View style={[{ backgroundColor: COLORS.borderLight, borderRadius: 8 }, style]} />}
    </Animated.View>
  );
};

// Professional skeleton components
const SkeletonLine = ({ height = 14, width = '100%', borderRadius = 6, style }) => (
  <Pulse style={[{ height, width, borderRadius }, style]} />
);

const SkeletonCircle = ({ size = 48, style }) => (
  <Pulse style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />
);

const ProfileSkeleton = () => (
  <View style={styles.profileCard}>
    <View style={styles.skeletonProfile}>
      <SkeletonCircle size={isTablet ? 80 : 70} style={{ marginRight: SPACING.lg }} />
      <View style={{ flex: 1 }}>
        <SkeletonLine height={FONTS.xl} width="70%" style={{ marginBottom: SPACING.sm }} />
        <SkeletonLine height={FONTS.sm} width="50%" style={{ marginBottom: SPACING.xs }} />
        <SkeletonLine height={FONTS.sm} width="60%" />
      </View>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [userData, setUserData] = useState({ name: '', email: '', phone: '', id: null });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);

  // Edit profile states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading]);

  // Validation functions
  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Name is required';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 50) return 'Name is too long';
    return null;
  };

  const validatePhone = (phone) => {
    const clean = phone.trim().replace(/\D/g, '');
    if (!clean) return 'Phone number is required';
    if (clean.length < 10) return 'Please enter a valid phone number';
    return null;
  };

  const validateAddress = (address) => {
    const trimmed = address.trim();
    if (!trimmed) return 'Address is required';
    if (trimmed.length < 10) return 'Please enter a detailed address';
    return null;
  };

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, []);

  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('@user_email');
      if (!email) {
        navigation.replace('Login');
        return;
      }
      setUserData((p) => ({ ...p, email }));

      const response = await fetch(`${baseURL}/api/get-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const cleanedData = {
            id: result.data.id,
            name: result.data.name || 'User',
            email: result.data.email || email,
            phone: result.data.phone || '+91 0000000000',
          };
          setUserData(cleanedData);
          setEditName(cleanedData.name);
          setEditPhone(cleanedData.phone);
          await AsyncStorage.setItem('@user_data', JSON.stringify(cleanedData));
        }
      }
    } catch (error) {
      const email = await AsyncStorage.getItem('@user_email');
      const fallback = { name: 'User', email: email || 'user@email.com', phone: '+91 9876543210', id: 1 };
      setUserData(fallback);
      setEditName(fallback.name);
      setEditPhone(fallback.phone);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const email = await AsyncStorage.getItem('@user_email');
      if (!email) return;

      const response = await fetch(`${baseURL}/api/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === true && Array.isArray(result.data)) {
          setAddresses(result.data);
        }
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = async () => {
    const addressValidation = validateAddress(newAddress);
    if (addressValidation) return Alert.alert('Error', addressValidation);
    if (!selectedCity) return Alert.alert('Error', 'Please select a city');
    if (!selectedArea) return Alert.alert('Error', 'Please select an area');

    try {
      setAddingAddress(true);
      const email = await AsyncStorage.getItem('@user_email');
      if (!email) return;

      const areaName = getSelectedAreaName();
      const addressData = {
        email,
        type: newAddressType,
        city: cityAreaData[selectedCity].name,
        area: areaName,
        full_address: newAddress.trim(),
      };

      const response = await fetch(`${baseURL}/api/add-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();
      if (response.ok && (result.status === 'success' || result.status === true)) {
        setNewAddress('');
        setNewAddressType('Home');
        setSelectedCity('');
        setSelectedArea('');
        setAddAddressModalVisible(false);
        Alert.alert('Success', 'Address added successfully!');
        fetchAddresses();
      }
    } catch {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleRemoveAddress = (addressId) => {
    Alert.alert('Remove Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const email = await AsyncStorage.getItem('@user_email');
            const response = await fetch(`${baseURL}/api/removeaddress`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, address_id: addressId }),
            });
            const result = await response.json();
            if (response.ok && (result.status === 'success' || result.status === true)) {
              Alert.alert('Success', 'Address removed successfully!');
              fetchAddresses();
            }
          } catch {
            Alert.alert('Error', 'Failed to remove address. Please try again.');
          }
        },
      },
    ]);
  };

  const selectCity = (cityKey) => {
    setSelectedCity(cityKey);
    setSelectedArea('');
    setShowCityModal(false);
  };

  const selectArea = (areaId) => {
    setSelectedArea(areaId);
    setShowAreaModal(false);
  };

  const getSelectedAreaName = () => {
    if (!selectedCity || !selectedArea) return '';
    const area = cityAreaData[selectedCity]?.areas.find((a) => a.id === selectedArea);
    return area ? area.name : '';
  };

  const handleSaveProfile = async () => {
    const nameValidation = validateName(editName);
    if (nameValidation) return Alert.alert('Validation Error', nameValidation);
    const phoneValidation = validatePhone(editPhone);
    if (phoneValidation) return Alert.alert('Validation Error', phoneValidation);

    try {
      setSavingProfile(true);
      const formattedPhone = editPhone.trim().startsWith('+91')
        ? editPhone.trim()
        : `+91 ${editPhone.trim().replace(/^\+?91/, '')}`;

      const updateData = { id: userData.id, name: editName.trim(), email: userData.email, phone: formattedPhone };
      const response = await fetch(`${baseURL}/api/edit-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setEditModalVisible(false);
        await fetchUserData();
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBackToHome = () => {
    navigation.navigate('Home', { userDetails: userData });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['@user_token', '@user_email', '@user_data']);
            navigation.replace('Login');
          } catch {}
        },
      },
    ]);
  };

  // Enhanced City Modal
  const renderCityModal = () => (
    <Modal visible={showCityModal} transparent animationType="slide" onRequestClose={() => setShowCityModal(false)}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity onPress={() => setShowCityModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(cityAreaData).map((cityKey) => (
              <TouchableOpacity
                key={cityKey}
                style={[styles.modalItem, selectedCity === cityKey && styles.selectedModalItem]}
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
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemIcon}>{cityKey === 'jalandhar' ? '🏛️' : '🏙️'}</Text>
                    <View style={styles.modalItemText}>
                      <Text style={[styles.modalItemTitle, selectedCity === cityKey && styles.selectedModalItemTitle]}>
                        {cityAreaData[cityKey].name}
                      </Text>
                      <Text style={styles.modalItemSubtitle}>
                        {cityAreaData[cityKey].areas.length} areas available
                      </Text>
                    </View>
                    {selectedCity === cityKey && (
                      <View style={styles.selectedIndicator}>
                        <LinearGradient
                          colors={[COLORS.primary, COLORS.primaryDark]}
                          style={styles.selectedIndicatorGradient}
                        >
                          <Text style={styles.selectedIndicatorText}>✓</Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  // Enhanced Area Modal
  const renderAreaModal = () => (
    <Modal visible={showAreaModal} transparent animationType="slide" onRequestClose={() => setShowAreaModal(false)}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Area</Text>
            <TouchableOpacity onPress={() => setShowAreaModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {selectedCity && cityAreaData[selectedCity]?.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[styles.modalItem, selectedArea === area.id && styles.selectedModalItem]}
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
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemIcon}>{area.icon}</Text>
                    <View style={styles.modalItemText}>
                      <Text style={[styles.modalItemTitle, selectedArea === area.id && styles.selectedModalItemTitle]}>
                        {area.name}
                      </Text>
                    </View>
                    {selectedArea === area.id && (
                      <View style={styles.selectedIndicator}>
                        <LinearGradient
                          colors={[COLORS.primary, COLORS.primaryDark]}
                          style={styles.selectedIndicatorGradient}
                        >
                          <Text style={styles.selectedIndicatorText}>✓</Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        {/* Enhanced Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>
        </LinearGradient>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileSkeleton />
          <View style={styles.skeletonOptions}>
            {[1, 2].map((item) => (
              <View key={item} style={styles.skeletonOption}>
                <SkeletonCircle size={isTablet ? 48 : 44} style={{ marginRight: SPACING.lg }} />
                <View style={{ flex: 1 }}>
                  <SkeletonLine height={FONTS.base} width="60%" />
                  <SkeletonLine height={FONTS.sm} width="40%" style={{ marginTop: SPACING.xs }} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Enhanced Professional Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
            <LinearGradient
              colors={[COLORS.glass, COLORS.glassBlur]}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backIcon}>←</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>My Profile</Text>
          
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editHeaderButton}>
            <LinearGradient
              colors={[COLORS.glass, COLORS.glassBlur]}
              style={styles.editButtonGradient}
            >
              <Text style={styles.editHeaderIcon}>✎</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { 
          opacity: fadeAnim, 
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ] 
        }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Enhanced Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={[COLORS.surface, COLORS.surfaceElevated]} style={styles.profileGradient}>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>
                <View style={styles.avatarRing} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name || 'User'}</Text>
                <View style={styles.profileDetails}>
                  <View style={styles.profileDetail}>
                    <View style={styles.profileDetailIcon}>
                      <Text style={styles.profileDetailIconText}>📧</Text>
                    </View>
                    <Text style={styles.profileDetailText}>{userData.email}</Text>
                  </View>
                  <View style={styles.profileDetail}>
                    <View style={styles.profileDetailIcon}>
                      <Text style={styles.profileDetailIconText}>📱</Text>
                    </View>
                    <Text style={styles.profileDetailText}>{userData.phone}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Options Card */}
        <View style={styles.optionsCard}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setAddressModalVisible(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceAlt]}
              style={styles.optionGradient}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIconContainer}>
                  <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primaryUltraLight]}
                    style={styles.optionIconGradient}
                  >
                    <Text style={styles.optionIcon}>📍</Text>
                  </LinearGradient>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Delivery Addresses</Text>
                  <Text style={styles.optionSubtitle}>Manage your saved addresses</Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <View style={styles.optionBadge}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.optionBadgeGradient}
                  >
                    <Text style={styles.optionBadgeText}>{addresses.length}</Text>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.optionDivider} />

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setContactModalVisible(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceAlt]}
              style={styles.optionGradient}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIconContainer}>
                  <LinearGradient
                    colors={[COLORS.accentLight, COLORS.accent + '40']}
                    style={styles.optionIconGradient}
                  >
                    <Text style={styles.optionIcon}>💬</Text>
                  </LinearGradient>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Customer Support</Text>
                  <Text style={styles.optionSubtitle}>Get help when you need it</Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionArrow}>›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Enhanced Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.errorLight, COLORS.error + '20']}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Made with ❤️ for food lovers</Text>
        </View>
      </Animated.ScrollView>

      {/* Enhanced Contact Modal */}
      <Modal visible={contactModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Support</Text>
              <TouchableOpacity onPress={() => setContactModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => {
                  Linking.openURL('mailto:amaclestudio@amaclestuio.com');
                  setContactModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.infoLight, COLORS.info + '20']}
                  style={styles.contactGradient}
                >
                  <View style={styles.contactIconContainer}>
                    <Text style={styles.contactIcon}>📧</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Email Support</Text>
                    <Text style={styles.contactSubtitle}>amaclestudio@amaclestuio.com</Text>
                    <Text style={styles.contactDescription}>Get detailed help via email</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => {
                  Linking.openURL('tel:9797472900');
                  setContactModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.successLight, COLORS.success + '20']}
                  style={styles.contactGradient}
                >
                  <View style={styles.contactIconContainer}>
                    <Text style={styles.contactIcon}>📞</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Phone Support</Text>
                    <Text style={styles.contactSubtitle}>+91 9797472900</Text>
                    <Text style={styles.contactDescription}>Instant help over phone call</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Enhanced Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  editable={!savingProfile}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={userData.email}
                  editable={false}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.formHint}>Email cannot be changed for security reasons</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  editable={!savingProfile}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, savingProfile && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={[COLORS.primary, COLORS.primaryDark]} 
                  style={styles.saveButtonGradient}
                >
                  {savingProfile && <ActivityIndicator size="small" color={COLORS.surface} style={{ marginRight: 8 }} />}
                  <Text style={styles.saveButtonText}>
                    {savingProfile ? 'Updating...' : 'Update Profile'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Enhanced Address Manager Modal */}
      <Modal visible={addressModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.addressViewModal, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Addresses ({addresses.length})</Text>
              <TouchableOpacity
                onPress={() => setAddressModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.addressViewList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {loadingAddresses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
              ) : addresses.length > 0 ? (
                addresses.map((address) => (
                  <View key={address.id} style={styles.addressDisplayItem}>
                    <LinearGradient
                      colors={[COLORS.surface, COLORS.surfaceAlt]}
                      style={styles.addressItemGradient}
                    >
                      <View style={styles.addressHeader}>
                        <View style={styles.addressTypeContainer}>
                          <Text style={styles.addressTypeIcon}>
                            {address.type === 'Home' ? '🏠' : address.type === 'Work' ? '🏢' : '📍'}
                          </Text>
                          <Text style={styles.addressType}>{address.type}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveAddress(address.id)}
                          style={styles.removeAddressButton}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={[COLORS.errorLight, COLORS.error + '20']}
                            style={styles.removeButtonGradient}
                          >
                            <Text style={styles.removeAddressIcon}>🗑️</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.addressText}>{address.full_address}</Text>
                      <Text style={styles.addressLocation}>
                        {address.area}, {address.city}
                      </Text>
                    </LinearGradient>
                  </View>
                ))
              ) : (
                <View style={styles.emptyAddressContainer}>
                  <Text style={styles.emptyAddressIcon}>📍</Text>
                  <Text style={styles.emptyAddressTitle}>No addresses saved</Text>
                  <Text style={styles.emptyAddressText}>
                    Add your first delivery address by tapping the + button below
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={() => {
                  setAddressModalVisible(false);
                  setAddAddressModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[COLORS.teal, '#00695C']} style={styles.floatingAddButtonGradient}>
                  <Text style={styles.floatingAddIcon}>+</Text>
                  <Text style={styles.floatingAddText}>Add New Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Enhanced Add Address Modal */}
      <Modal visible={addAddressModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.addAddressModal, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity
                onPress={() => {
                  setAddAddressModalVisible(false);
                  setNewAddress('');
                  setNewAddressType('Home');
                  setSelectedCity('');
                  setSelectedArea('');
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.addFormScrollView}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {/* Enhanced Address Type Selector */}
              <View style={styles.newTypeSelector}>
                {[
                  { type: 'Home', icon: '🏠', gradient: [COLORS.success, COLORS.success + 'DD'] },
                  { type: 'Work', icon: '🏢', gradient: [COLORS.info, COLORS.info + 'DD'] },
                  { type: 'Other', icon: '📍', gradient: [COLORS.purple, COLORS.purple + 'DD'] },
                ].map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption.type}
                    style={[styles.newTypeButton, newAddressType === typeOption.type && styles.selectedNewType]}
                    onPress={() => setNewAddressType(typeOption.type)}
                    activeOpacity={0.8}
                  >
                    {newAddressType === typeOption.type ? (
                      <LinearGradient colors={typeOption.gradient} style={styles.newTypeButtonGradient}>
                        <Text style={styles.newTypeButtonIcon}>{typeOption.icon}</Text>
                        <Text style={styles.selectedNewTypeText}>{typeOption.type}</Text>
                      </LinearGradient>
                    ) : (
                      <LinearGradient colors={[COLORS.surface, COLORS.surfaceAlt]} style={styles.unselectedNewType}>
                        <Text style={styles.unselectedNewTypeIcon}>{typeOption.icon}</Text>
                        <Text style={styles.unselectedNewTypeText}>{typeOption.type}</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* City Dropdown */}
              <TouchableOpacity
                style={styles.newFormDropdown}
                onPress={() => setShowCityModal(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.surface, COLORS.surfaceAlt]}
                  style={styles.dropdownGradient}
                >
                  <Text style={[styles.newFormDropdownText, !selectedCity && styles.newFormDropdownPlaceholder]}>
                    {selectedCity ? cityAreaData[selectedCity].name : 'Select City'}
                  </Text>
                  <Text style={styles.newFormDropdownArrow}>▼</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Area Dropdown */}
              <TouchableOpacity
                style={[styles.newFormDropdown, !selectedCity && styles.disabledNewFormDropdown]}
                onPress={() => selectedCity && setShowAreaModal(true)}
                disabled={!selectedCity}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.surface, COLORS.surfaceAlt]}
                  style={[styles.dropdownGradient, !selectedCity && { opacity: 0.5 }]}
                >
                  <Text style={[styles.newFormDropdownText, (!selectedArea || !selectedCity) && styles.newFormDropdownPlaceholder]}>
                    {selectedArea && selectedCity ? getSelectedAreaName() : 'Select Area'}
                  </Text>
                  <Text style={styles.newFormDropdownArrow}>▼</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Address Input */}
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={styles.newAddressTextInput}
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="Enter complete address (House no., Street, Landmark...)"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Enhanced Add Button */}
              <TouchableOpacity
                style={[
                  styles.newAddAddressButton,
                  (addingAddress || !newAddress.trim() || !selectedCity || !selectedArea) && styles.disabledButton,
                ]}
                onPress={handleAddAddress}
                disabled={addingAddress || !newAddress.trim() || !selectedCity || !selectedArea}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={[COLORS.indigo, COLORS.indigo + 'DD']} 
                  style={styles.newAddAddressButtonGradient}
                >
                  {addingAddress && <ActivityIndicator size="small" color={COLORS.surface} style={{ marginRight: 8 }} />}
                  <Text style={styles.newAddAddressButtonText}>
                    {addingAddress ? 'Adding Address...' : '✅ Save Address'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* City and Area Modals */}
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

  // Enhanced Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.lg,
    paddingBottom: SPACING.xl,
    elevation: 8,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
  },
  backButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  backButtonGradient: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  editHeaderButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  editButtonGradient: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editHeaderIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    color: COLORS.textInverse,
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: SPACING.xl,
  },

  // Enhanced Profile Card Styles
  profileCard: {
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.xl,
    elevation: 8,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: isTablet ? SPACING.xxxl : SPACING.xl,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isTablet ? SPACING.xl : SPACING.lg,
  },
  avatar: {
    width: isTablet ? 80 : 70,
    height: isTablet ? 80 : 70,
    borderRadius: isTablet ? 40 : 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: isTablet ? 44 : 39,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  avatarText: {
    fontSize: isTablet ? FONTS.xxxl : FONTS.xxl,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  profileDetails: {
    gap: SPACING.sm,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailIcon: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    borderRadius: isTablet ? 12 : 10,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileDetailIconText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
  },
  profileDetailText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },

  // Enhanced Options Card Styles
  optionsCard: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    elevation: 4,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  optionItem: {
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginRight: isTablet ? SPACING.lg : SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionIconGradient: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  optionSubtitle: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionRight: {
    alignItems: 'center',
  },
  optionBadge: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
  },
  optionBadgeGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: isTablet ? 32 : 28,
    alignItems: 'center',
  },
  optionBadgeText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  optionArrow: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: isTablet ? SPACING.xl : SPACING.lg,
  },

  // Enhanced Logout Button Styles
  logoutButton: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  logoutIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    marginRight: SPACING.md,
  },
  logoutText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.2,
  },

  // App Info Styles
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  appInfoText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  appInfoSubtext: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: height * 0.8,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  
  addressViewModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    height: height * 0.8,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  
  addAddressModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    height: height * 0.85,
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
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingTop: SPACING.xl,
  },

  // Enhanced Modal Item Styles
  modalItem: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedModalItem: {},
  modalItemGradient: {
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    paddingHorizontal: isTablet ? SPACING.lg : SPACING.md,
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemIcon: {
    fontSize: isTablet ? FONTS.xl : FONTS.lg,
    marginRight: isTablet ? SPACING.lg : SPACING.md,
    width: isTablet ? 32 : 28,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  selectedModalItemTitle: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalItemSubtitle: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
  selectedIndicatorText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textInverse,
    fontWeight: '800',
  },

  // Enhanced Contact Option Styles
  contactOption: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
  },
  contactIconContainer: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? SPACING.xl : SPACING.lg,
    elevation: 2,
  },
  contactIcon: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  contactSubtitle: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  contactDescription: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Enhanced Form Styles
  formGroup: {
    marginBottom: SPACING.xl,
  },
  formLabel: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.2,
  },
  formInput: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: COLORS.surfaceAlt,
    color: COLORS.textMuted,
  },
  formHint: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xl,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
  },
  saveButtonText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Address View Styles
  addressViewList: {
    flex: 1,
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
  },
  addressDisplayItem: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    elevation: 3,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  addressItemGradient: {
    padding: isTablet ? SPACING.xl : SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    marginRight: SPACING.md,
  },
  addressType: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  removeAddressButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    elevation: 2,
  },
  removeButtonGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  removeAddressIcon: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
  },
  addressText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    lineHeight: isTablet ? 24 : 20,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  addressLocation: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Empty State Styles
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyAddressIcon: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  emptyAddressTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyAddressText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 26 : 22,
    fontWeight: '500',
  },

  // Floating Add Button Styles
  addButtonContainer: {
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  floatingAddButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  floatingAddButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  floatingAddIcon: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    color: COLORS.textInverse,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  floatingAddText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },

  // Add Form Styles
  addFormScrollView: {
    flex: 1,
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingTop: SPACING.xl,
  },

  // Enhanced Type Selector
  newTypeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  newTypeButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedNewType: {
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  newTypeButtonGradient: {
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    alignItems: 'center',
  },
  unselectedNewType: {
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    alignItems: 'center',
  },
  newTypeButtonIcon: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    marginBottom: SPACING.md,
  },
  selectedNewTypeText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  unselectedNewTypeIcon: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  unselectedNewTypeText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Form Dropdown Styles
  newFormDropdown: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  disabledNewFormDropdown: {
    opacity: 0.5,
  },
  dropdownGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  newFormDropdownText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  newFormDropdownPlaceholder: {
    color: COLORS.textMuted,
  },
  newFormDropdownArrow: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Address Input Styles
  addressInputContainer: {
    marginBottom: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  newAddressTextInput: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    minHeight: isTablet ? 140 : 120,
    textAlignVertical: 'top',
    fontWeight: '500',
  },

  // Add Button Styles
  newAddAddressButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  newAddAddressButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
  },
  newAddAddressButtonText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  loadingText: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    fontWeight: '500',
  },

  // Skeleton Styles
  skeletonProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? SPACING.xxxl : SPACING.xl,
  },
  skeletonOptions: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: isTablet ? SPACING.xl : SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  skeletonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? SPACING.xl : SPACING.lg,
  },
});

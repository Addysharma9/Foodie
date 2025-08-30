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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
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
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
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
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
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

  const renderCityModal = () => (
    <Modal
      visible={showCityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select City</Text>
          <ScrollView style={styles.modalScrollView}>
            {Object.keys(cityAreaData).map((cityKey) => (
              <TouchableOpacity
                key={cityKey}
                style={[
                  styles.modalItem,
                  selectedCity === cityKey && styles.selectedModalItem
                ]}
                onPress={() => selectCity(cityKey)}
              >
                <Text style={styles.modalItemIcon}>
                  {cityKey === 'jalandhar' ? '🏛️' : '🏙️'}
                </Text>
                <Text style={styles.modalItemText}>{cityAreaData[cityKey].name}</Text>
                {selectedCity === cityKey && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCityModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Select Area in {cityAreaData[selectedCity]?.name}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {selectedCity && cityAreaData[selectedCity]?.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.modalItem,
                  selectedArea === area.id && styles.selectedModalItem
                ]}
                onPress={() => selectArea(area.id)}
              >
                <Text style={styles.modalItemIcon}>{area.icon}</Text>
                <Text style={styles.modalItemText}>{area.name}</Text>
                {selectedArea === area.id && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAreaModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
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
              <Text style={styles.logoText}>📍</Text>
            </LinearGradient>
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
              <Text style={styles.userInfoText}>
                Welcome, {cacheData.displayName || userEmail}!
              </Text>
            </View>
          )}
        </View>

        {/* Form Card */}
        <Animated.View 
          style={[
            styles.formCard,
            { transform: [{ scale: formScaleAnim }] }
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ''));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* City Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TouchableOpacity
                style={[styles.dropdownContainer, errors.city && styles.inputError]}
                onPress={() => setShowCityModal(true)}
              >
                <Text style={styles.inputIcon}>🏙️</Text>
                <Text style={[
                  styles.dropdownText,
                  !selectedCity && styles.placeholderText
                ]}>
                  {selectedCity ? cityAreaData[selectedCity].name : 'Select your city'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
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
              >
                <Text style={styles.inputIcon}>📍</Text>
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
              </TouchableOpacity>
              {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
            </View>

            {/* Full Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Address</Text>
              <View style={[styles.addressContainer, errors.fullAddress && styles.inputError]}>
                <Text style={styles.inputIcon}>🏠</Text>
                <TextInput
                  style={[styles.textInput, styles.addressInput]}
                  placeholder="House/flat number, street, etc."
                  placeholderTextColor="#9CA3AF"
                  value={fullAddress}
                  onChangeText={(text) => {
                    setFullAddress(text);
                    if (errors.fullAddress) setErrors(prev => ({ ...prev, fullAddress: '' }));
                  }}
                  multiline={true}
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
              {errors.fullAddress && <Text style={styles.errorText}>{errors.fullAddress}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.submitGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </Text>
                {!isLoading && <Text style={styles.submitArrow}>→</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Modals */}
      {renderCityModal()}
      {renderAreaModal()}
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
    paddingTop: height * 0.04,
    paddingBottom: height * 0.02,
    justifyContent: 'space-between',
  },

  // Header - Compact for small screens
  header: {
    alignItems: 'center',
    paddingBottom: height * 0.015,
  },
  logoContainer: {
    marginBottom: height * 0.01,
  },
  logoCircle: {
    width: Math.min(width * 0.12, 50),
    height: Math.min(width * 0.12, 50),
    borderRadius: Math.min(width * 0.06, 25),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: Math.min(width * 0.06, 24),
  },
  appTitle: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
    textAlign: 'center',
  },
  appTitleAccent: {
    color: '#FF6B35',
  },
  appSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // User info container
  userInfoContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FEF3E2',
    borderRadius: 10,
    borderColor: '#FF6B35',
    borderWidth: 1,
  },
  userInfoText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#FF6B35',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Form Card - Responsive
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    maxHeight: height * 0.75,
  },

  // Input Groups - Compact spacing
  inputGroup: {
    marginBottom: height * 0.015,
  },
  inputLabel: {
    fontSize: Math.min(width * 0.037, 15),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: height * 0.012,
    minHeight: height * 0.05,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: height * 0.012,
    minHeight: height * 0.065,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: Math.min(width * 0.045, 18),
    marginRight: 10,
    marginTop: 1,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.037, 15),
    color: '#1F2937',
    fontWeight: '500',
  },
  addressInput: {
    minHeight: height * 0.05,
    textAlignVertical: 'top',
    paddingTop: 0,
  },

  // Dropdown - Responsive
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: height * 0.014,
    minHeight: height * 0.05,
  },
  disabledDropdown: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  dropdownText: {
    flex: 1,
    fontSize: Math.min(width * 0.037, 15),
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  disabledArrow: {
    color: '#D1D5DB',
  },

  // Error Text - Compact
  errorText: {
    fontSize: Math.min(width * 0.032, 12),
    color: '#EF4444',
    marginTop: 3,
    fontWeight: '500',
  },

  // Submit Button - Responsive
  submitButton: {
    marginTop: height * 0.015,
    borderRadius: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 14,
  },
  submitButtonText: {
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  submitArrow: {
    fontSize: Math.min(width * 0.037, 15),
    color: '#fff',
    fontWeight: 'bold',
  },

  // Modal - Responsive
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: width * 0.045,
    maxHeight: height * 0.5,
  },
  modalScrollView: {
    maxHeight: height * 0.35,
  },
  modalTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
  },
  selectedModalItem: {
    backgroundColor: '#FEF3E2',
    borderColor: '#FF6B35',
    borderWidth: 1.5,
  },
  modalItemIcon: {
    fontSize: Math.min(width * 0.045, 18),
    marginRight: 10,
  },
  modalItemText: {
    flex: 1,
    fontSize: Math.min(width * 0.037, 15),
    color: '#1F2937',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: Math.min(width * 0.037, 15),
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: height * 0.015,
    paddingVertical: height * 0.012,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: Math.min(width * 0.037, 15),
    color: '#6B7280',
    fontWeight: '600',
  },
});
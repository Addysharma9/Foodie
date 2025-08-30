import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// City and area data - same as UserDetailsScreen
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

export default function ProfileScreen() {
  const navigation = useNavigation();
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    id: null
  });
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // New address form states
  const [newAddress, setNewAddress] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  // VALIDATION FUNCTIONS
  const validateName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Name cannot be empty';
    }
    if (trimmedName.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (trimmedName.length > 50) {
      return 'Name cannot be longer than 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  };

  const validatePhone = (phone) => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      return 'Phone number cannot be empty';
    }
    
    // Remove any non-digit characters for validation
    const cleanPhone = trimmedPhone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (cleanPhone.length > 15) {
      return 'Phone number cannot be longer than 15 digits';
    }
    
    // Check if it's a valid Indian phone number format
    const indianPhoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      return 'Please enter a valid Indian phone number';
    }
    
    return null;
  };

  const validateAddress = (address) => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      return 'Address cannot be empty';
    }
    if (trimmedAddress.length < 10) {
      return 'Please enter a detailed address (minimum 10 characters)';
    }
    if (trimmedAddress.length > 200) {
      return 'Address is too long (maximum 200 characters)';
    }
    return null;
  };

  // ENHANCED REFRESH DATA FUNCTION with loading state
  const refreshAllData = async (showLoading = false) => {
    console.log('Refreshing all data...');
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Refresh both user data and addresses
      await Promise.all([
        fetchUserData(),
        fetchAddresses()
      ]);
      
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Add useEffect to refresh data when modal opens
  useEffect(() => {
    if (addressModalVisible) {
      console.log('Address modal opened, refreshing addresses...');
      fetchAddresses();
    }
  }, [addressModalVisible]);

  useEffect(() => {
    console.log('ProfileScreen mounted, starting data fetch...');
    fetchUserData();
    fetchAddresses();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Starting fetchUserData...');
      
      const email = await AsyncStorage.getItem('@user_email');
      console.log('Retrieved email from storage:', email);
      
      if (!email) {
        console.log('No email found, navigating to login');
        Alert.alert('Error', 'No user email found');
        navigation.replace('Login');
        return;
      }

      setUserData(prev => ({ ...prev, email: email }));

      console.log('Making API call to fetch user data...');
      const response = await fetch(`${baseURL}/api/get-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === 'success' && result.data) {
        console.log('Setting user data:', result.data);
        
        const cleanedData = {
          id: result.data.id,
          name: result.data.name || 'User',
          email: result.data.email || email,
          phone: result.data.phone || '+91 0000000000',
          token: result.data.token,
          created_at: result.data.created_at || result.data['created_at'],
          updated_at: result.data.updated_at || result.data['updated_at']
        };
        
        console.log('Setting cleaned user data:', cleanedData);
        
        setUserData(cleanedData);
        setEditName(cleanedData.name);
        setEditPhone(cleanedData.phone);
        
        await AsyncStorage.setItem('@user_data', JSON.stringify(cleanedData));
        console.log('User data stored in AsyncStorage successfully');
        
      } else {
        console.log('API returned error status:', result);
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('API Error:', error);
      
      // Try to load cached data as fallback
      try {
        console.log('Attempting to load cached data...');
        const cachedData = await AsyncStorage.getItem('@user_data');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          console.log('Loaded cached data:', parsed);
          setUserData(parsed);
          setEditName(parsed.name || '');
          setEditPhone(parsed.phone || '');
          Alert.alert('Info', 'Loaded cached profile data. Some information may be outdated.');
        } else {
          console.log('No cached data, setting default data');
          const email = await AsyncStorage.getItem('@user_email');
          const defaultData = {
            name: 'User',
            email: email || 'user@email.com',
            phone: '+91 9876543210',
            id: 1
          };
          setUserData(defaultData);
          setEditName(defaultData.name);
          setEditPhone(defaultData.phone);
          Alert.alert('Error', 'Network error. Using default profile data.');
        }
      } catch (cacheError) {
        console.error('Cache error:', cacheError);
        const finalFallback = {
          name: 'User',
          email: 'user@email.com',
          phone: '+91 9876543210',
          id: 1
        };
        setUserData(finalFallback);
        setEditName(finalFallback.name);
        setEditPhone(finalFallback.phone);
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // IMPROVED fetchAddresses with better state management
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const email = await AsyncStorage.getItem('@user_email');
      
      if (!email) {
        console.log('No email found for fetching addresses');
        setAddresses([]); // Clear addresses if no email
        return;
      }

      console.log('Fetching addresses for user:', email);
      
      const response = await fetch(`${baseURL}/api/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Addresses API response:', result);
        
        if (result.status === true && result.data && Array.isArray(result.data)) {
          console.log('Setting addresses:', result.data);
          setAddresses(result.data);
        } else {
          console.log('No addresses found or invalid data format');
          setAddresses([]); // Ensure empty array instead of keeping old data
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch addresses:', response.status, errorText);
        setAddresses([]); // Clear addresses on error
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]); // Clear addresses on error
    } finally {
      setLoadingAddresses(false);
    }
  };

  // FIXED Add new address with better refresh handling and proper success message
  const handleAddAddress = async () => {
    // COMPREHENSIVE VALIDATION
    const addressValidation = validateAddress(newAddress);
    if (addressValidation) {
      Alert.alert('Invalid Address', addressValidation);
      return;
    }

    if (!selectedCity) {
      Alert.alert('Missing City', 'Please select a city');
      return;
    }

    if (!selectedArea) {
      Alert.alert('Missing Area', 'Please select an area');
      return;
    }

    if (!newAddressType) {
      Alert.alert('Missing Type', 'Please select an address type');
      return;
    }

    try {
      setAddingAddress(true);
      const email = await AsyncStorage.getItem('@user_email');
      
      if (!email) {
        Alert.alert('Error', 'No user email found');
        return;
      }

      const addressData = {
        email: email,
        type: newAddressType,
        city: cityAreaData[selectedCity].name,
        area: getSelectedAreaName(),
        full_address: newAddress.trim(),
      };

      console.log('Adding address:', addressData);

      const response = await fetch(`${baseURL}/api/add-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();
      console.log('Add address response:', result);

      if (response.ok && (result.status === 'success' || result.status === true)) {
        // Reset form FIRST
        setNewAddress('');
        setNewAddressType('Home');
        setSelectedCity('');
        setSelectedArea('');
        
        // Show success message
        Alert.alert('Success', 'Address added successfully!', [
          {
            text: 'OK',
            onPress: async () => {
              // Force refresh addresses after user acknowledges success
              console.log('Address added successfully, refreshing addresses...');
              await fetchAddresses();
            }
          }
        ]);
        
        // Also refresh immediately for real-time update
        setTimeout(async () => {
          await fetchAddresses();
        }, 100);
        
      } else {
        console.error('Failed to add address:', result);
        Alert.alert('Error', result.message || 'Failed to add address. Please try again.');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setAddingAddress(false);
    }
  };

  // IMPROVED Remove address with better refresh handling
  const handleRemoveAddress = (addressId) => {
    Alert.alert(
      'Remove Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const email = await AsyncStorage.getItem('@user_email');
              
              if (!email) {
                Alert.alert('Error', 'No user email found');
                return;
              }

              console.log('Removing address ID:', addressId);

              const response = await fetch(`${baseURL}/api/removeaddress`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email,
                  address_id: addressId,
                }),
              });

              const result = await response.json();
              console.log('Remove address response:', result);

              if (response.ok && (result.status === 'success' || result.status === true)) {
                // Show success message and refresh
                Alert.alert('Success', 'Address removed successfully!', [
                  {
                    text: 'OK',
                    onPress: async () => {
                      // Force immediate refresh of addresses
                      console.log('Address removed successfully, refreshing addresses...');
                      await fetchAddresses();
                    }
                  }
                ]);
                
                // Also refresh immediately for real-time update
                setTimeout(async () => {
                  await fetchAddresses();
                }, 100);
                
              } else {
                Alert.alert('Error', result.message || 'Failed to remove address');
              }
            } catch (error) {
              console.error('Error removing address:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Helper functions for dropdowns
  const selectCity = (cityKey) => {
    setSelectedCity(cityKey);
    setSelectedArea(''); // Reset area when city changes
    setShowCityModal(false);
  };

  const selectArea = (areaId) => {
    setSelectedArea(areaId);
    setShowAreaModal(false);
  };

  const getSelectedAreaName = () => {
    if (!selectedCity || !selectedArea) return '';
    const area = cityAreaData[selectedCity]?.areas.find(a => a.id === selectedArea);
    return area ? area.name : '';
  };

  // Other existing functions
  const handleBackToHome = () => {
    navigation.replace('Home', { userDetails: userData });
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  // IMPROVED handleSaveProfile with better refresh
  const handleSaveProfile = async () => {
    // COMPREHENSIVE VALIDATION
    const nameValidation = validateName(editName);
    if (nameValidation) {
      Alert.alert('Invalid Name', nameValidation);
      return;
    }

    const phoneValidation = validatePhone(editPhone);
    if (phoneValidation) {
      Alert.alert('Invalid Phone Number', phoneValidation);
      return;
    }

    try {
      setSavingProfile(true);

      // Format phone number consistently
      const formattedPhone = editPhone.trim().startsWith('+91') 
        ? editPhone.trim() 
        : `+91 ${editPhone.trim().replace(/^\+?91/, '')}`;

      const updateData = {
        id: userData.id,
        name: editName.trim(),
        email: userData.email, // Keep original email
        phone: formattedPhone,
      };

      console.log('Updating user profile:', updateData);

      const response = await fetch(`${baseURL}/api/edit-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Update profile response:', result);

      if (response.ok && result.status === 'success') {
        // Close modal first
        setEditModalVisible(false);
        
        // Force immediate refresh of user data
        console.log('Profile updated successfully, refreshing user data...');
        await fetchUserData(); // Direct refresh of user data
        
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleContactSupport = () => {
    setContactModalVisible(true);
  };

  const handleCallSupport = () => {
    if (userData?.phone) {
      Linking.openURL(`tel:${userData.phone}`);
    }
    setContactModalVisible(false);
  };

  const handleEmailSupport = () => {
    if (userData?.email) {
      Linking.openURL(`mailto:${userData.email}`);
    }
    setContactModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@user_token');
              await AsyncStorage.removeItem('@user_email');
              await AsyncStorage.removeItem('@user_data');
              
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleAddresses = () => {
    setAddressModalVisible(true);
  };

  // Simple dropdown modals (keeping your preferred simple version)
  const renderCityModal = () => (
    <Modal
      visible={showCityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.simpleDropdownModal}>
          <Text style={styles.simpleModalTitle}>Select City</Text>
          
          <ScrollView style={styles.simpleScrollView} showsVerticalScrollIndicator={false}>
            {Object.keys(cityAreaData).map((cityKey) => (
              <TouchableOpacity
                key={cityKey}
                style={[
                  styles.simpleDropdownItem,
                  selectedCity === cityKey && styles.selectedSimpleItem
                ]}
                onPress={() => selectCity(cityKey)}
              >
                <Text style={styles.cityIcon}>
                  {cityKey === 'jalandhar' ? '🏛️' : '🏙️'}
                </Text>
                <Text style={styles.simpleItemText}>
                  {cityAreaData[cityKey].name}
                </Text>
                {selectedCity === cityKey && (
                  <Text style={styles.simpleCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.simpleCancelButton}
            onPress={() => setShowCityModal(false)}
          >
            <Text style={styles.simpleCancelText}>Cancel</Text>
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
        <View style={styles.simpleDropdownModal}>
          <Text style={styles.simpleModalTitle}>
            Select Area in {cityAreaData[selectedCity]?.name}
          </Text>
          
          <ScrollView style={styles.simpleScrollView} showsVerticalScrollIndicator={false}>
            {selectedCity && cityAreaData[selectedCity]?.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.simpleDropdownItem,
                  selectedArea === area.id && styles.selectedSimpleItem
                ]}
                onPress={() => selectArea(area.id)}
              >
                <Text style={styles.cityIcon}>{area.icon}</Text>
                <Text style={styles.simpleItemText}>{area.name}</Text>
                {selectedArea === area.id && (
                  <Text style={styles.simpleCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.simpleCancelButton}
            onPress={() => setShowAreaModal(false)}
          >
            <Text style={styles.simpleCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const profileOptions = [
    {
      id: '1',
      title: 'Contact Support',
      subtitle: 'Get help and support',
      icon: '💬',
      onPress: handleContactSupport,
    },
    {
      id: '2',
      title: 'Addresses',
      subtitle: 'Manage delivery addresses',
      icon: '📍',
      onPress: handleAddresses,
    },
  ];

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
          <Text style={styles.loadingSubtext}>Please wait</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('Rendering ProfileScreen with data:', userData);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header with Back Button and Refresh */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refreshAllData(true)}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {userData?.name && userData.name !== 'Loading...' 
                  ? userData.name.charAt(0).toUpperCase() 
                  : '👤'
                }
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'user@email.com'}</Text>
          <Text style={styles.userPhone}>{userData?.phone || '+91 9876543210'}</Text>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <View key={option.id} style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>App v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Made with ❤️ for users</Text>
        </View>
      </ScrollView>

      {/* Contact Support Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            
            <TouchableOpacity style={styles.contactOption} onPress={handleEmailSupport}>
              <Text style={styles.contactIcon}>📧</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{userData?.email || 'support@app.com'}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactOption} onPress={handleCallSupport}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{userData?.phone || '+91 9876543210'}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setContactModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal with Enhanced Validation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: height * 0.6 }]}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    editName.trim().length < 2 && editName.trim().length > 0 && styles.invalidInput
                  ]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name (minimum 2 characters)"
                  editable={!savingProfile}
                  maxLength={50}
                />
                {editName.trim().length > 0 && editName.trim().length < 2 && (
                  <Text style={styles.validationError}>Name must be at least 2 characters</Text>
                )}
              </View>
              
              {/* Display email as read-only information */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email (Read Only)</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{userData?.email || 'user@email.com'}</Text>
                  <Text style={styles.readOnlyIcon}>🔒</Text>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    editPhone.trim() && validatePhone(editPhone) && styles.invalidInput
                  ]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number (e.g., +91 9876543210)"
                  keyboardType="phone-pad"
                  editable={!savingProfile}
                  maxLength={15}
                />
                {editPhone.trim() && validatePhone(editPhone) && (
                  <Text style={styles.validationError}>{validatePhone(editPhone)}</Text>
                )}
                <Text style={styles.inputHint}>Format: +91 followed by 10 digits</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
                disabled={savingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  savingProfile && styles.disabledButton
                ]} 
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                <Text style={styles.saveButtonText}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Management Modal with Enhanced Validation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalContent}>
            <Text style={styles.modalTitle}>Manage Addresses</Text>
            
            {/* Existing Addresses List */}
            <View style={styles.addressListContainer}>
              <Text style={styles.sectionTitle}>Your Addresses</Text>
              <ScrollView 
                style={styles.addressList}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {loadingAddresses ? (
                  <View style={styles.loadingAddressesContainer}>
                    <ActivityIndicator size="small" color="#FF6B35" />
                    <Text style={styles.loadingAddressesText}>Loading addresses...</Text>
                  </View>
                ) : addresses.length > 0 ? (
                  addresses.map((address) => (
                    <View key={address.id} style={styles.addressItem}>
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressType}>{address.type}</Text>
                        <Text style={styles.addressText}>
                          {address.full_address}
                        </Text>
                        <Text style={styles.addressLocation}>
                          {address.area}, {address.city}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeAddressButton}
                        onPress={() => handleRemoveAddress(address.id)}
                      >
                        <Text style={styles.removeAddressText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.noAddressesContainer}>
                    <Text style={styles.noAddressesText}>No addresses found</Text>
                    <Text style={styles.noAddressesSubtext}>Add your first address below</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            
            {/* Add New Address Section with Validation */}
            <View style={styles.addAddressContainer}>
              <ScrollView 
                style={styles.addAddressScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <View style={styles.addAddressSection}>
                  <Text style={styles.addAddressTitle}>Add New Address</Text>
                  
                  {/* Address Type Selector */}
                  <View style={styles.addressTypeSelector}>
                    {['Home', 'Work', 'Other'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.addressTypeButton,
                          newAddressType === type && styles.selectedAddressType
                        ]}
                        onPress={() => setNewAddressType(type)}
                      >
                        <Text style={[
                          styles.addressTypeButtonText,
                          newAddressType === type && styles.selectedAddressTypeText
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Simple City Dropdown */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TouchableOpacity
                      style={[
                        styles.simpleDropdownContainer,
                        !selectedCity && styles.requiredField
                      ]}
                      onPress={() => setShowCityModal(true)}
                    >
                      <Text style={styles.dropdownIcon}>🏙️</Text>
                      <Text style={[
                        styles.simpleDropdownText,
                        !selectedCity && styles.placeholderText
                      ]}>
                        {selectedCity ? cityAreaData[selectedCity].name : 'Select your city'}
                      </Text>
                      <Text style={styles.simpleArrow}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Simple Area Dropdown */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Area *</Text>
                    <TouchableOpacity
                      style={[
                        styles.simpleDropdownContainer,
                        !selectedCity && styles.disabledDropdown,
                        selectedCity && !selectedArea && styles.requiredField
                      ]}
                      onPress={() => selectedCity && setShowAreaModal(true)}
                      disabled={!selectedCity}
                    >
                      <Text style={styles.dropdownIcon}>📍</Text>
                      <Text style={[
                        styles.simpleDropdownText,
                        (!selectedArea || !selectedCity) && styles.placeholderText
                      ]}>
                        {selectedArea && selectedCity ? getSelectedAreaName() : 'Select your area'}
                      </Text>
                      <Text style={[
                        styles.simpleArrow,
                        !selectedCity && styles.disabledArrow
                      ]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Full Address Input with Validation */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Address *</Text>
                    <TextInput
                      style={[
                        styles.addressInput,
                        newAddress.trim() && validateAddress(newAddress) && styles.invalidInput
                      ]}
                      value={newAddress}
                      onChangeText={setNewAddress}
                      placeholder="Enter full address (house/flat number, street, etc.)"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                    />
                    {newAddress.trim() && validateAddress(newAddress) && (
                      <Text style={styles.validationError}>{validateAddress(newAddress)}</Text>
                    )}
                    <Text style={styles.inputHint}>
                      {newAddress.length}/200 characters (minimum 10 required)
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[
                      styles.addAddressButton,
                      (addingAddress || !newAddress.trim() || !selectedCity || !selectedArea) && styles.disabledButton
                    ]} 
                    onPress={handleAddAddress}
                    disabled={addingAddress || !newAddress.trim() || !selectedCity || !selectedArea}
                  >
                    <Text style={styles.addAddressButtonText}>
                      {addingAddress ? 'Adding...' : 'Add Address'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setAddressModalVisible(false);
                // Reset form when closing
                setNewAddress('');
                setNewAddressType('Home');
                setSelectedCity('');
                setSelectedArea('');
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Selection Modal */}
      {renderCityModal()}
      
      {/* Area Selection Modal */}
      {renderAreaModal()}
    </SafeAreaView>
  );
}

// Complete StyleSheet with all styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  editProfileButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  editProfileText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Options
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionCard: {
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FF6B3520',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },

  // Logout
  logoutButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Contact Modal
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },

  // Edit Profile Modal
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  
  // Read-only email display styles
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  readOnlyIcon: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Validation styles
  invalidInput: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  validationError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  requiredField: {
    borderColor: '#F59E0B',
    borderWidth: 1,
  },

  // Address Modal
  addressModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    width: width * 0.95,
    height: height * 0.85,
    maxHeight: height * 0.85,
  },
  
  // Address list container
  addressListContainer: {
    flex: 0.35,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  addressList: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
  },
  
  // Add address container
  addAddressContainer: {
    flex: 0.6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  addAddressScrollView: {
    flex: 1,
  },

  // Loading states
  loadingAddressesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingAddressesText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  noAddressesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAddressesText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  noAddressesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 5,
  },

  // Address items
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
    lineHeight: 18,
  },
  addressLocation: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  removeAddressButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeAddressText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },

  // Add address section
  addAddressSection: {
    paddingBottom: 10,
  },
  addAddressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  addressTypeSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  addressTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    marginBottom: 8,
  },
  selectedAddressType: {
    backgroundColor: '#FF6B35',
  },
  addressTypeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedAddressTypeText: {
    color: '#ffffff',
  },

  // Address form
  inputGroup: {
    marginBottom: 15,
  },

  // Simple dropdown styles
  simpleDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 15,
    paddingVertical: 14,
    minHeight: 50,
  },
  simpleDropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
  },
  dropdownIcon: {
    fontSize: 18,
  },
  simpleArrow: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 10,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  disabledDropdown: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  disabledArrow: {
    color: '#D1D5DB',
  },

  // Simple modal styles
  simpleDropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.6,
  },
  simpleModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  simpleScrollView: {
    maxHeight: height * 0.4,
  },
  simpleDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#F9FAFB',
  },
  selectedSimpleItem: {
    backgroundColor: '#FEF3E2',
    borderColor: '#FF6B35',
    borderWidth: 1,
  },
  cityIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 25,
  },
  simpleItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  simpleCheck: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  simpleCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  simpleCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Address input
  addressInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    height: 90,
    textAlignVertical: 'top',
  },
  
  addAddressButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },
  
  addAddressButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#9CA3AF',
  },
});

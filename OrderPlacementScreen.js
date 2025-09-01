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
  TextInput,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const baseURL = 'http://212.38.94.189:8000';

// City and area data
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

export default function OrderPlacementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get cart data from route params
  const { cartItems = [], cartTotal = 0, subtotal = 0, deliveryFee = 25, couponDiscount = 0, appliedCoupon = null } = route.params || {};

  // ✅ ADD USER ID STATE
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Add address modal states
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  
  // Order states
  // ✅ FIXED PAYMENT METHOD: Use lowercase values matching Laravel validation
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' instead of 'COD'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // ✅ FETCH USER ID ON MOUNT (CRITICAL FIX)
  useEffect(() => {
    async function getUserId() {
      try {
        setUserLoading(true);
        const email = await AsyncStorage.getItem('@user_email');
        
        if (!email) {
          console.log('❌ No email found');
          Alert.alert('Error', 'No user email found. Please login again.');
          return;
        }

        console.log('👤 Fetching user ID for email:', email);

        const response = await fetch(`${baseURL}/api/get-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ User data received:', data);
        
        if (!data.data || !data.data.id) {
          throw new Error('Invalid user data received');
        }

        setUserId(data.data.id);
        console.log('✅ User ID set:', data.data.id);

      } catch (error) {
        console.error('💥 Error fetching user ID:', error);
        Alert.alert('Error', 'Failed to fetch user data. Please try again.');
      } finally {
        setUserLoading(false);
      }
    }

    getUserId();
  }, []);

  // Fetch addresses after user ID is loaded
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  // VALIDATION FUNCTIONS
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

  // FETCH ADDRESSES
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const email = await AsyncStorage.getItem('@user_email');
      
      if (!email) {
        console.log('No email found for fetching addresses');
        setAddresses([]);
        return;
      }

      console.log('📍 Fetching addresses for user:', email);
      
      const response = await fetch(`${baseURL}/api/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Addresses API response:', result);
        
        if (result.status === true && result.data && Array.isArray(result.data)) {
          console.log('Setting addresses:', result.data);
          setAddresses(result.data);
          // Auto-select first address if none selected
          if (result.data.length > 0 && !selectedAddress) {
            setSelectedAddress(result.data[0]);
          }
        } else {
          console.log('No addresses found or invalid data format');
          setAddresses([]);
        }
      } else {
        console.error('❌ Failed to fetch addresses:', response.status);
        setAddresses([]);
      }
    } catch (error) {
      console.error('💥 Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // ADD NEW ADDRESS
  const handleAddAddress = async () => {
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

      console.log('📍 Adding address:', addressData);

      const response = await fetch(`${baseURL}/api/add-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();
      console.log('✅ Add address response:', result);

      if (response.ok && (result.status === 'success' || result.status === true)) {
        // Reset form
        setNewAddress('');
        setNewAddressType('Home');
        setSelectedCity('');
        setSelectedArea('');
        setShowAddAddressModal(false);
        
        // Show success and refresh addresses
        Alert.alert('Success', 'Address added successfully!', [
          {
            text: 'OK',
            onPress: async () => {
              await fetchAddresses();
            }
          }
        ]);
        
      } else {
        console.error('❌ Failed to add address:', result);
        Alert.alert('Error', result.message || 'Failed to add address. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error adding address:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setAddingAddress(false);
    }
  };

  // ✅ FIXED PLACE ORDER FUNCTION WITH CORRECT PAYMENT METHOD VALUES
 const handlePlaceOrder = async () => {
  if (!userId) {
    Alert.alert('Error', 'User information not loaded yet. Please wait a moment and try again.');
    return;
  }

  if (!selectedAddress) {
    Alert.alert('Address Required', 'Please select a delivery address');
    return;
  }

  if (cartItems.length === 0) {
    Alert.alert('Empty Cart', 'Your cart is empty');
    return;
  }

  try {
    setPlacingOrder(true);
    const email = await AsyncStorage.getItem('@user_email');
    if (!email) {
      Alert.alert('Error', 'No user email found');
      return;
    }

    // Calculate discounted subtotal and total
 const calculatedSubtotal = cartItems.reduce((acc, item) => {
  const discountedPrice = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price;
  return acc + discountedPrice * item.quantity;
}, 0);

const calculatedTotal = calculatedSubtotal - couponDiscount + deliveryFee;

    const orderData = {
      app_user_id: userId,
      email: email,
      address_id: selectedAddress.id,
      items: cartItems.map(item => ({
  product_id: item.id,
  quantity: item.quantity,
  price: parseFloat(item.sale_price && item.sale_price > 0 ? item.sale_price : item.price) || 0,
  spice_level: item.spice_level || 'None'
})),

     subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
discount: parseFloat(couponDiscount) || 0,
delivery_fee: parseFloat(deliveryFee) || 0,
total_amount: parseFloat(calculatedTotal.toFixed(2)),

      payment_method: paymentMethod,
      coupon_code: appliedCoupon?.code || null,
      special_instructions: specialInstructions.trim() || null,
    };

    console.log('🚀 Placing order:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${baseURL}/api/orders/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed response:', result);
    } catch {
      throw new Error('Invalid response from server');
    }

    if (response.ok && result.message === 'Order placed successfully') {
      Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } else {
      throw new Error(result.message || 'Failed to place order. Please try again.');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    Alert.alert('❌ Order Failed', error.message || 'Failed to place order. Please try again.');
  } finally {
    setPlacingOrder(false);
  }
};


  // Helper functions for dropdowns
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
    const area = cityAreaData[selectedCity]?.areas.find(a => a.id === selectedArea);
    return area ? area.name : '';
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  // ✅ FIXED RADIO BUTTON WITH CORRECT VALUES
  const RadioButton = ({ selected, onPress, label, icon }) => (
    <TouchableOpacity
      style={[styles.paymentMethod, selected && styles.selectedPaymentMethod]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radioContainer}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.paymentIcon}>{icon}</Text>
        <Text style={styles.paymentText}>{label}</Text>
      </View>
      {selected && <Text style={styles.checkIcon}>✓</Text>}
    </TouchableOpacity>
  );

  // ✅ LOADING STATE WHILE FETCHING USER ID
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
            Loading user information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // RENDER MODALS
  const renderCityModal = () => (
    <Modal
      visible={showCityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModal}>
          <Text style={styles.modalTitle}>Select City</Text>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.keys(cityAreaData).map((cityKey) => (
              <TouchableOpacity
                key={cityKey}
                style={[
                  styles.dropdownItem,
                  selectedCity === cityKey && styles.selectedItem
                ]}
                onPress={() => selectCity(cityKey)}
              >
                <Text style={styles.cityIcon}>
                  {cityKey === 'jalandhar' ? '🏛️' : '🏙️'}
                </Text>
                <Text style={styles.itemText}>
                  {cityAreaData[cityKey].name}
                </Text>
                {selectedCity === cityKey && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCityModal(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
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
        <View style={styles.dropdownModal}>
          <Text style={styles.modalTitle}>
            Select Area in {cityAreaData[selectedCity]?.name}
          </Text>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {selectedCity && cityAreaData[selectedCity]?.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.dropdownItem,
                  selectedArea === area.id && styles.selectedItem
                ]}
                onPress={() => selectArea(area.id)}
              >
                <Text style={styles.cityIcon}>{area.icon}</Text>
                <Text style={styles.itemText}>{area.name}</Text>
                {selectedArea === area.id && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowAreaModal(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => setShowAddAddressModal(true)}
            >
              <Text style={styles.addAddressText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {loadingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addresses.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addressContainer}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddress?.id === address.id && styles.selectedAddressCard
                  ]}
                  onPress={() => setSelectedAddress(address)}
                >
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressType}>{address.type}</Text>
                    {selectedAddress?.id === address.id && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {address.full_address}
                  </Text>
                  <Text style={styles.addressLocation}>
                    {address.area}, {address.city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressText}>No addresses found</Text>
              <Text style={styles.noAddressSubtext}>Add your delivery address to continue</Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>
          <View style={styles.orderSummary}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemDetails}>
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
            
            <View style={styles.orderSummaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.orderSummaryRow}>
                <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>-{formatCurrency(couponDiscount)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ✅ FIXED PAYMENT METHOD WITH CORRECT VALUES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          <View style={styles.paymentMethods}>
            <RadioButton
              selected={paymentMethod === 'cod'}
              onPress={() => setPaymentMethod('cod')} // ✅ 'cod' instead of 'COD'
              label="Cash on Delivery"
              icon="💵"
            />
            <RadioButton
              selected={paymentMethod === 'online'}
              onPress={() => setPaymentMethod('online')} // ✅ 'online' instead of 'Online'
              label="Online Payment"
              icon="💳"
            />
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Special Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Add cooking instructions, delivery notes, etc."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.characterCount}>{specialInstructions.length}/200</Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.finalPrice}>{formatCurrency(cartTotal)}</Text>
          <Text style={styles.priceLabel}>Total Amount</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.placeOrderButton, 
            (placingOrder || !selectedAddress || !userId) && { opacity: 0.6 }
          ]}
          onPress={handlePlaceOrder}
          disabled={placingOrder || !selectedAddress || !userId}
        >
          <Text style={styles.placeOrderText}>
            {placingOrder ? '⏳ Placing Order...' : !userId ? '⚠️ Loading User...' : '🚀 Place Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddAddressModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddAddressModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Add New Address</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Address Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Type</Text>
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
            </View>

            {/* City Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowCityModal(true)}
              >
                <Text style={styles.dropdownIcon}>🏙️</Text>
                <Text style={[
                  styles.dropdownText,
                  !selectedCity && styles.placeholderText
                ]}>
                  {selectedCity ? cityAreaData[selectedCity].name : 'Select your city'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Area Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Area *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownContainer,
                  !selectedCity && styles.disabledDropdown
                ]}
                onPress={() => selectedCity && setShowAreaModal(true)}
                disabled={!selectedCity}
              >
                <Text style={styles.dropdownIcon}>📍</Text>
                <Text style={[
                  styles.dropdownText,
                  (!selectedArea || !selectedCity) && styles.placeholderText
                ]}>
                  {selectedArea && selectedCity ? getSelectedAreaName() : 'Select your area'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Full Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Address *</Text>
              <TextInput
                style={styles.addressInput}
                value={newAddress}
                onChangeText={setNewAddress}
                placeholder="Enter house/flat number, street, landmark, etc."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.characterCount}>{newAddress.length}/200 characters</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addAddressSubmitButton,
                (addingAddress || !newAddress.trim() || !selectedCity || !selectedArea) && styles.disabledButton
              ]}
              onPress={handleAddAddress}
              disabled={addingAddress || !newAddress.trim() || !selectedCity || !selectedArea}
            >
              <Text style={styles.addAddressSubmitText}>
                {addingAddress ? '⏳ Adding...' : '✅ Add Address'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* City Selection Modal */}
      {renderCityModal()}
      
      {/* Area Selection Modal */}
      {renderAreaModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  headerPlaceholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addAddressButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addAddressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  addressContainer: {
    marginTop: 8,
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: width * 0.7,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedAddressCard: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF7ED',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  selectedBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  addressLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  noAddressContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noAddressText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  noAddressSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 5,
  },
  orderSummary: {
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderItemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentMethods: {
    marginTop: 8,
  },
  paymentMethod: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedPaymentMethod: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF7ED',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#FF6B35',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  checkIcon: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceContainer: {
    marginRight: 16,
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  placeOrderButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  addressTypeSelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addressTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
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
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  dropdownIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  disabledDropdown: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  addAddressSubmitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  addAddressSubmitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#9CA3AF',
  },

  // Dropdown Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.6,
    width: width * 0.85,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: height * 0.4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
  },
  selectedItem: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B35',
    borderWidth: 1,
  },
  cityIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});

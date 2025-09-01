import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { cartApi } from '../services/cartApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = 'http://212.38.94.189:8000';
let APP_USER_ID = null; // Will be set dynamically
const DELIVERY_FEE = 0;

// Helper function for price formatting
const formatPrice = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [userId, setUserId] = useState(null);

  // Debouncing refs
  const quantityTimers = useRef({});

  // Get user ID on mount
  useEffect(() => {
    async function getUserId() {
      try {
        const email = await AsyncStorage.getItem('@user_email');
        console.log('Retrieved email from storage:', email);

        if (!email) {
          console.log('No email found');
          Alert.alert('Error', 'No user email found');
          return;
        }

        const response = await fetch(`${baseURL}/api/get-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data.data.id);
        APP_USER_ID = data.data.id;
        setUserId(data.data.id);

        // Load cart after getting user ID
        loadCartFromAPI();

      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      }
    }

    getUserId();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(quantityTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  const loadCartFromAPI = async () => {
    if (!APP_USER_ID) {
      console.log('No user ID available yet');
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.getUserCart(APP_USER_ID);
      
      console.log('Cart API Response:', JSON.stringify(response, null, 2));
      
      if (response && response.cart_items && Array.isArray(response.cart_items)) {
        const transformedItems = response.cart_items.map((item, index) => {
          try {
            if (!item || !item.product_id) {
              console.warn('Invalid cart item:', item);
              return null;
            }

            // Handle different possible structures
            let productData = null;
            
            // Case 1: item has product property (after Laravel fix)
            if (item.product && typeof item.product === 'object') {
              productData = item.product;
            }
            // Case 2: Create fallback product data (current API structure)
            else {
              productData = {
                id: item.product_id,
                name: `Product ${item.product_id}`,
                description: 'Product details loading...',
                price: item.price,
                sale_price: null,
                featured_image: null,
                preparation_time: 25,
                average_rating: 0,
                is_featured: false,
                spice_level: 'None',
                ingredients: [],
                slug: ''
              };
            }

            // ✅ FIXED: Use sale_price if available, otherwise use regular price
            const finalPrice = productData.sale_price && parseFloat(productData.sale_price) > 0 
              ? parseFloat(productData.sale_price)
              : parseFloat(item.price) || parseFloat(productData.price) || 0;

            return {
              id: productData.id,
              cartId: item.id,
              name: productData.name || `Product ${item.product_id}`,
              price: finalPrice, // ✅ Use discounted price if available
              quantity: parseInt(item.quantity) || 1,
              featured_image: productData.featured_image || null,
              imageUrl: productData.featured_image || productData.image || null,
              spice_level: productData.spice_level || 'None',
              slug: productData.slug || '',
              description: productData.description || '',
              sale_price: productData.sale_price || null,
              original_price: productData.price || item.price, // ✅ Keep original price for display
              preparation_time: productData.preparation_time || 25,
              average_rating: productData.average_rating || 0,
              is_featured: productData.is_featured || false,
              ingredients: productData.ingredients || [],
            };
          } catch (itemError) {
            console.error('Error processing cart item:', itemError);
            return null;
          }
        }).filter(item => item !== null);

        setCartItems(transformedItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Enhanced addToCart to send price information
  const addToCart = async (product, quantity = 1, options = {}) => {
    if (!APP_USER_ID) {
      Alert.alert('Error', 'User not logged in');
      return { success: false };
    }

    try {
      setSyncing(true);
      
      if (!product || !product.id) {
        throw new Error('Invalid product data');
      }

      // ✅ FIXED: Send the correct price to the API
      const priceToUse = product.sale_price || product.price;
      
      console.log('Adding to cart with price:', {
        productId: product.id,
        price: priceToUse,
        sale_price: product.sale_price,
        original_price: product.original_price || product.price
      });
      
      // ✅ You might need to modify your cartApi.addToCart to accept price parameter
      // If your API supports it, pass the price:
      await cartApi.addToCart(APP_USER_ID, product.id, quantity, priceToUse);
      
      // Alternative: Update local cart immediately with correct price, then sync
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        setCartItems(prev => prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        // Add new item with correct price
        const newCartItem = {
          id: product.id,
          cartId: `temp_${Date.now()}`, // Temporary ID
          name: product.name,
          price: priceToUse, // ✅ Use the discounted price
          quantity: quantity,
          featured_image: product.featured_image,
          imageUrl: product.featured_image || product.image,
          spice_level: product.spice_level || 'None',
          slug: product.slug || '',
          description: product.description || '',
          sale_price: product.sale_price || null,
          original_price: product.original_price || product.price,
          preparation_time: product.preparation_time || 25,
          average_rating: product.average_rating || 0,
          is_featured: product.is_featured || false,
          ingredients: product.ingredients || [],
        };
        
        setCartItems(prev => [...prev, newCartItem]);
      }
      
      // Then sync with API (this might overwrite with server data)
      await loadCartFromAPI();
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
      return { success: false };
    } finally {
      setSyncing(false);
    }
  };

  // DEBOUNCED updateQuantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    // Cancel any existing timer for this product
    if (quantityTimers.current[productId]) {
      clearTimeout(quantityTimers.current[productId]);
    }

    // Update UI immediately (user sees change right away)
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Set timer to call API after 800ms of no more clicks
    quantityTimers.current[productId] = setTimeout(async () => {
      await performUpdateQuantity(productId, newQuantity);
      // Clean up the timer
      delete quantityTimers.current[productId];
    }, 800);
  };

  // Separate function for actual API call
  const performUpdateQuantity = async (productId, newQuantity) => {
    if (!APP_USER_ID) return;

    try {
      setSyncing(true);
      
      const cartItem = cartItems.find(item => item.id === productId);
      if (!cartItem || !cartItem.cartId) {
        throw new Error('Cart item not found');
      }
      
      await cartApi.updateCartItem(cartItem.cartId, newQuantity, APP_USER_ID);
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity');
      // If error, reload cart to sync with server
      await loadCartFromAPI();
    } finally {
      setSyncing(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!APP_USER_ID) return;

    try {
      setSyncing(true);
      
      const cartItem = cartItems.find(item => item.id === productId);
      if (!cartItem || !cartItem.cartId) {
        throw new Error('Cart item not found');
      }
      
      await cartApi.removeFromCart(cartItem.cartId, APP_USER_ID);
      setCartItems(prev => prev.filter(item => item.id !== productId));
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
      await loadCartFromAPI();
    } finally {
      setSyncing(false);
    }
  };

  const clearCart = async () => {
    if (!APP_USER_ID) return;

    try {
      setLoading(true);
      await cartApi.clearUserCart(APP_USER_ID);
      setCartItems([]);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      
      const validCoupons = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'FLAT50': { discount: 50, type: 'fixed' },
        'FIRST20': { discount: 20, type: 'percentage' },
      };
      
      const coupon = validCoupons[couponCode.toUpperCase()];
      if (!coupon) {
        Alert.alert('Invalid Coupon', 'Please enter a valid coupon code');
        return false;
      }
      
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      Alert.alert('Error', 'Failed to apply coupon');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Order Placed Successfully!', 
        'Your order will be delivered in 25-30 minutes.',
        [{ text: 'OK' }]
      );
      
      await clearCart();
      return { success: true };
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate totals using the price field (which should be discounted price)
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = safeCartItems.reduce((sum, item) => {
    // Use item.price which should already be the discounted price
    const itemPrice = parseFloat(item.price) || 0;
    const itemQuantity = parseInt(item.quantity) || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0);
  
  const calculatedCouponDiscount = appliedCoupon 
    ? appliedCoupon.type === 'percentage' 
      ? Math.round((subtotal * appliedCoupon.discount) / 100 * 100) / 100
      : appliedCoupon.discount
    : 0;
  
  const cartTotal = Math.max(0, subtotal + DELIVERY_FEE - calculatedCouponDiscount);
  const cartCount = safeCartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  // Helper functions
  const isItemInCart = (productId) => {
    if (!productId) return false;
    return safeCartItems.some(item => item.id === productId);
  };
  
  const getItemQuantity = (productId) => {
    if (!productId) return 0;
    const item = safeCartItems.find(item => item.id === productId);
    return item ? (parseInt(item.quantity) || 0) : 0;
  };

  return {
    cartItems: safeCartItems,
    cartCount,
    cartTotal: parseFloat(cartTotal.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: DELIVERY_FEE,
    appliedCoupon,
    couponDiscount: parseFloat(calculatedCouponDiscount.toFixed(2)),
    loading,
    syncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    placeOrder,
    getItemQuantity,
    isItemInCart,
    refreshCart: loadCartFromAPI,
    formatPrice, // Export the helper function
  };
};

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const cartItems = [
  {
    id: '1',
    name: 'Special Thali',
    price: 149,
    quantity: 2,
    image: '🍛',
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    price: 179,
    quantity: 1,
    image: '🧈',
  },
];

export default function CartScreen() {
  const [items, setItems] = useState(cartItems);

  const updateQuantity = (id, increment) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <Text style={styles.itemImage}>{item.image}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartEmoji}>🛒</Text>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtext}>Add some delicious items to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{getTotalPrice()}</Text>
            </View>
            
            <TouchableOpacity style={styles.checkoutButton}>
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <Text style={styles.checkoutArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#6B7280',
    marginTop: 4,
  },
  cartList: {
    padding: width * 0.05,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    width: Math.min(width * 0.15, 60),
    height: Math.min(width * 0.15, 60),
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImage: {
    fontSize: Math.min(width * 0.06, 24),
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: '600',
    color: '#FF6B35',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  emptyCartEmoji: {
    fontSize: Math.min(width * 0.2, 80),
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  checkoutButton: {
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    borderRadius: 16,
  },
  checkoutText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  checkoutArrow: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#fff',
    fontWeight: 'bold',
  },
});

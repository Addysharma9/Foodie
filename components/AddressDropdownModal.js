import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, isTablet, height, SCREEN_PADDING } from '../constants/AppConstants';

const AddressDropdownModal = ({ visible, addresses, selectedId, onSelect, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.addressModalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.addressDropdown,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.addressDropdownHeader}>
            <Text style={styles.addressDropdownTitle}>Choose Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.addressCloseButton}>
              <Text style={styles.addressCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.addressList} showsVerticalScrollIndicator={false}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressItem,
                  selectedId === address.id && styles.selectedAddressItem
                ]}
                onPress={() => onSelect(address)}
                activeOpacity={0.7}
              >
                <View style={styles.addressItemContent}>
                  <View style={styles.addressTypeContainer}>
                    <View style={styles.addressTypeChip}>
                      <Text style={styles.addressType}>{address.type}</Text>
                    </View>
                    {selectedId === address.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressFullText}>{address.full_address}</Text>
                  <Text style={styles.addressArea}>{address.area}, {address.city}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  addressDropdown: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SCREEN_PADDING,
    borderRadius: BORDER_RADIUS.xl,
    maxHeight: height * 0.65,
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  addressDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? SPACING.xxl : SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceAlt,
  },
  addressDropdownTitle: {
    fontSize: isTablet ? FONTS.xxl : FONTS.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addressCloseButton: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressCloseText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addressList: {
    maxHeight: height * 0.45,
  },
  addressItem: {
    paddingHorizontal: isTablet ? SPACING.xxl : SPACING.xl,
    paddingVertical: isTablet ? SPACING.xl : SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  selectedAddressItem: {
    backgroundColor: COLORS.primaryUltraLight,
  },
  addressItemContent: {
    flex: 1,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addressTypeChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  addressType: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedIndicator: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: isTablet ? FONTS.sm : FONTS.xs,
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  addressFullText: {
    fontSize: isTablet ? FONTS.lg : FONTS.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: isTablet ? 28 : 24,
  },
  addressArea: {
    fontSize: isTablet ? FONTS.base : FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default AddressDropdownModal;

// components/DynamicCodeRenderer.js
import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Animated,
  StatusBar, FlatList, ScrollView, Image, RefreshControl, Platform,
  SafeAreaView, Modal, TextInput, Alert, ImageBackground, Easing,
  Dimensions // ✅ Keep Dimensions import
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../hooks/useCart';
import FloatingGirlAssistant from '../Animatedgirl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const DynamicCodeRenderer = ({ code, additionalProps = {} }) => {
  const navigation = useNavigation();
  const cartHook = useCart();

  try {
    if (!code) {
      return (
        <View style={fallbackStyles.container}>
          <Text style={fallbackStyles.errorText}>No dynamic code provided</Text>
        </View>
      );
    }

    const ReactNative = {
      StyleSheet, Text, View, Dimensions, TouchableOpacity, Animated,
      StatusBar, FlatList, ScrollView, Image, RefreshControl, Platform,
      SafeAreaView, Modal, TextInput, Alert, ImageBackground, Easing
    };

    const componentProps = {
      React,
      ReactNative,
      // ✅ ADD windowDimensions back
      windowDimensions: Dimensions.get('window'),
      screenDimensions: Dimensions.get('screen'),
      useNavigation: () => navigation,
      useCart: () => cartHook,
      FloatingGirlAssistant,
      AsyncStorage,
      LinearGradient,
      ...additionalProps
    };

    const createComponent = new Function(
      'props',
      `
      try {
        ${code}
        return DynamicHomeScreen;
      } catch (error) {
        console.error('Dynamic component execution error:', error);
        throw new Error('Component creation failed: ' + error.message);
      }
      `
    );

    const DynamicComponent = createComponent(componentProps);
    return React.createElement(DynamicComponent, componentProps);

  } catch (error) {
    console.error('Error executing dynamic code:', error);
    return (
      <View style={fallbackStyles.container}>
        <Text style={fallbackStyles.errorTitle}>Error Loading Component</Text>
        <Text style={fallbackStyles.errorMessage}>{error.message}</Text>
        <TouchableOpacity 
          style={fallbackStyles.retryButton}
          onPress={() => additionalProps.refreshCode && additionalProps.refreshCode()}
        >
          <Text style={fallbackStyles.retryText}>Retry Loading</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

// Keep your fallback styles the same...
const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFBFC'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 10,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default DynamicCodeRenderer;

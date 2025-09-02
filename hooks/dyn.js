// HomeScreen.js - Now just fetches and renders dynamic code
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDynamicCodeEngine } from './hooks/useDynamicCodeEngine';
import DynamicCodeRenderer from './components/DynamicCodeRenderer';

export default function HomeScreen() {
  const { componentCode, loading, refreshCode } = useDynamicCodeEngine();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
       <></>
      </View>
    );
  }

  return (
    <DynamicCodeRenderer 
      code={componentCode?.code} 
      additionalProps={{
        refreshCode
      }}
    />
  );
}

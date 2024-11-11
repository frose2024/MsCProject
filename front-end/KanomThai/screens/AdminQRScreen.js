import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ScreenTemplate from '../components/ScreenTemplate';

export default function AdminQRScreen() {
  return (
    <ScreenTemplate>
      <View style={styles.content}>
        
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

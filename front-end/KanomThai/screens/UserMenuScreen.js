import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Dimensions, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchMenu } from '../APIs/Menu';
import ScreenTemplate from '../components/ScreenTemplate';

export default function UserMenuScreen() {
  const [menuUrl, setMenuUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('User not authenticated');
        }

        const url = await fetchMenu(token);
        if (url) {
          setMenuUrl(url);
        } else {
          Alert.alert('No menu found', 'There is currently no menu to view.');
        }
      } catch (error) {
        console.error('Error in loadMenu:', error.message);
        Alert.alert('Error', 'Unable to load the menu.');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  return (
    <ScreenTemplate>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : menuUrl ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          minimumZoomScale={1}
          maximumZoomScale={3}
          scrollEnabled={true}
        >
          <Image
            source={{ uri: menuUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => {
              Alert.alert('Error', 'Unable to display the menu.');
            }}
          />
        </ScrollView>
      ) : (
        <View style={styles.noMenuContainer}>
          <Text style={styles.text}>No menu available to display.</Text>
        </View>
      )}
    </ScreenTemplate>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    maxHeight: height * 0.6,
    marginBottom: 20,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.85,
    height: height * 0.49,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

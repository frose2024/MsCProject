import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenTemplate from '../components/ScreenTemplate';
import QRCodeComponent from '../components/QRCodeComponent';

export default function UserHomeScreen({ handleLogout }) {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('token');
        setUserId(storedUserId);
        setToken(storedToken);
        // Debug: console.log('UserHomeScreen userId:', storedUserId, 'token:', storedToken);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.qrCodeContainer}>
          {userId && token ? (
            <QRCodeComponent userId={userId} token={token} />
          ) : (
            <Text>Loading QR Code...</Text>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 45,
  },
  qrCodeContainer: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginTop: '5%',
  },
  qrCodeText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20, 
  },
  logoutButton: {
    width: '75%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
    fontWeight: 'bold',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: 'Montserrat',
    textTransform: 'uppercase',
  },
});
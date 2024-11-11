import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { fetchQRCode } from '../APIs.js/FetchQR';

const QRCodeComponent = ({ userId, token }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getQRCode = async () => {
      try {
        // Debug: console.log('Fetching QR code for userId:', userId);
        await fetchQRCode(userId, token, setQrCode);
      } catch (error) {
        console.error('Error loading QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      getQRCode();
    }
  }, [userId, token]);

  return (
    <View style={styles.qrCodeContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : qrCode ? (
        <Image source={{ uri: qrCode }} style={styles.qrCodeImage} />
      ) : (
        <Text style={styles.errorText}>Failed to load QR Code</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default QRCodeComponent;

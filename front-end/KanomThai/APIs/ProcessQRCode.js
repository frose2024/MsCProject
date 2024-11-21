import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const handleScannedQRCode = async (scannedUrl) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      console.error('Token not found. Please log in again.');
      Alert.alert('Error', 'You must be logged in to scan QR codes.');
      return { success: false };
    }
    const response = await fetch(scannedUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: {
          userId: result.userId,
          points: result.points,
          generationCount: result.generationCount,
        },
      };
    } else {
      console.error('Failed to process QR code:', result.message);
      Alert.alert('Error', result.message || 'Failed to process QR code');
      return { success: false };
    }
  } catch (error) {
    console.error('Error processing QR code:', error);
    Alert.alert('Error', 'Failed to process QR code');
    return { success: false };
  }
};

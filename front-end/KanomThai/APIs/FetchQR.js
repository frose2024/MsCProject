import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export const fetchQRCode = async (userId, setQrCode) => {
  try {
    // Debug: console.log('fetchQRCode called with:', { userId, setQrCode });
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Token not found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/api/user/${userId}/generate-qr`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.qrCode) {
      setQrCode(response.data.qrCode);
    } else {
      throw new Error('Invalid QR code response from the server.');
    }
  } catch (error) {
    console.error('Failed to fetch QR code:', error.message);
    Alert.alert('Error', 'Failed to fetch QR code. Please try again.');
  }
};



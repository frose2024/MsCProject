import axios from 'axios';

import config from '../config';
const API_URL = config.API_URL;

export const fetchQRCode = async (userId, token, setQrCode) => {
  try {
    const response = await axios.get(`${API_URL}/api/user/${userId}/generate-qr`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('QR Code response:', response.data);
    setQrCode(response.data.qrCode);
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    Alert.alert('Error', 'Failed to fetch QR code. Please try again.');
  }
};

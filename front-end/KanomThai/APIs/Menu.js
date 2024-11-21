import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export const fetchMenu = async (token) => {
  try {
    // Debug: console.log('Fetching menu with token:', token);
    const response = await axios.get(`${API_URL}/api/user/menu/view`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Debug: console.log('Fetch menu response:', response.data);

    const menuUrl = response.data.menu?.url
      ? `${API_URL}${response.data.menu.url}`
      : null;

    // Debug: console.log('Constructed Menu URL:', menuUrl);
    return menuUrl;
  } catch (error) {
    console.error('Error fetching the menu:', error.message);
    Alert.alert('Error', 'Unable to load the menu.');
    return null;
  }
};

export const uploadMenu = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const file = await DocumentPicker.getDocumentAsync({
      type: 'image/png',
      copyToCacheDirectory: true,
    });

    if (file.canceled) {
      return null;
    }

    const selectedFile = file.assets ? file.assets[0] : file;
    const { uri, name, mimeType } = selectedFile || {};

    if (!mimeType || !mimeType.includes('image/png')) {
      Alert.alert('Invalid File', 'Please upload a PNG file.');
      return null;
    }

    if (!uri) {
      throw new Error('File URI is missing.');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: uri.replace('file://', ''),
      name: name,
      type: mimeType || 'image/png',
    });

    const response = await axios.post(`${API_URL}/api/admin/menu/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      Alert.alert('Error', error.response.data.message || 'An error occurred during upload.');
    } else {
      Alert.alert('Error', 'An error occurred during upload. Please try again.');
    }
    throw error;
  }
};


import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import config from '../config';
const API_URL = config.API_URL;

export const updateUserPoints = async (userId, pointChange) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('Token not found.');
      Alert.alert('Error', 'Token not found. Please log in again.');
      return { success: false };
    }

    const response = await fetch(`${API_URL}/api/admin/${userId}/manage-points?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ points: pointChange }),
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, newPoints: result.newPoints };
    } else {
      console.error('Error updating points:', result.message);
      Alert.alert('Error', result.message || 'Failed to update points.');
      return { success: false };
    }
  } catch (error) {
    console.error('Error in updateUserPoints:', error);
    Alert.alert('Error', 'An unexpected error occurred while updating points.');
    return { success: false };
  }
};

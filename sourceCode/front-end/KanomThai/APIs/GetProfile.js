import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import config from '../config';
const API_URL = config.API_URL;

// Fetches an authenticated user's profile information
export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found, user not logged in.');
    }

    // Send GET request to fetch profile data
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();     // Parse response JSON 
    // Debug: console.log('Profile data:', data);
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch profile.');
    }
  } catch (error) {
    // Debug: console.log('Profile retrieval error:', error);
    throw error;
  }
};

// Updates the user's birthday on the server
export const updateBirthday = async (birthday) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error("Token is missing");
      return;
    }

     // Send PUT request to update birthday
    const response = await axios.put(
      `${API_URL}/api/user/birthday`,
      { birthday },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in updateBirthday:', error);
    throw error;
  }
};
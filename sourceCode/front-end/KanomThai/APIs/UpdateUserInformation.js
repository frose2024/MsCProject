import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../config";
const API_URL = config.API_URL;

// Updates user information on the server
export const updateUserInformation = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/user/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user information.');
    }

    return data;
  } catch (error) {
    console.error('Error updating user information:', error);
    throw error;
  }
};

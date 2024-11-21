import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export const login = async (identifier, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await response.json();

    if (response.ok && data.token) {
      await AsyncStorage.setItem('token', data.token);
      const { role } = JSON.parse(atob(data.token.split('.')[1]));
      await AsyncStorage.setItem('role', role);

      return { token: data.token, role };
    } else {
      throw new Error(data.message || 'Login failed.' );
    }
  } catch (error) {
    console.log('Login error:', error);
    throw error;
  }
};

export const register = async (username, password, role = 'user', email ) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, email }),
    });
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
};

import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import ScreenTemplate from '../components/ScreenTemplate';
import { login } from '../APIs/LoginAndRegistration';

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export default function LoginScreen({ navigation, setIsLoggedIn, setIsAdmin, setUserId }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await login(identifier, password);

      const { role, token } = response || {};
      const decodedToken = decodeJWT(token);
      const userId = decodedToken?.userId;

      if (!userId || !token) {
        throw new Error('Login response is missing userId or token.');
      }

      setUserId(userId);
      setIsAdmin(role === 'admin');
      setIsLoggedIn(true);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);

      navigation.navigate('MainTabs');

    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Error', error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ScreenTemplate>
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Username or Email"
              value={identifier}
              onChangeText={setIdentifier}
              style={styles.input}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                style={styles.toggleIcon}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
              <Text style={styles.registerLink}>
                Don't have an account? Register here.
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenTemplate>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: -60,
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat',
  },
  toggleIcon: {
    marginLeft: 10,
  },
  loginButton: {
    width: '75%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },
  registerLink: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
});

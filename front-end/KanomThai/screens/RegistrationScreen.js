import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

import ScreenTemplate from '../components/ScreenTemplate';
import { register } from '../APIs.js/LoginAndRegistration'; 

export default function RegistrationScreen({ navigation }){
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistration = async () => {
    try {
      const response = await register(username, password, 'user', email);
      Alert.alert('Registration Success', 'You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'Registration failed');
    }
    console.log('Data sent to server:', { username, password, email });

  };

  return (
    <ScreenTemplate>
      <View style={styles.formContainer}>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.registrationButton} onPress={handleRegistration}>
          <Text style={styles.registrationButtonText}> REGISTER </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}> Already have an account? Login here. </Text>
        </TouchableOpacity>

      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat'
  },
  registrationButton: {
    width: '75%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  registrationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Montserrat'
  },
  loginLink: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Montserrat'
  },
});
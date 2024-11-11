import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = config.API_URL;
import config from '../config';
import ScreenTemplate from "../components/ScreenTemplate";

export default function UpdateUserInformation({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password, oldPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Update Successful', 'Your information has been updated.');
        navigation.goBack();
      } else {
        throw new Error(data.message || 'Failed to update information.');
      }
    } catch (error) {
      Alert.alert('Update Error', error.message);
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="New Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="New Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}> UPDATE </Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

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
  updateButton: {
    width: '75%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Montserrat'
  },
});

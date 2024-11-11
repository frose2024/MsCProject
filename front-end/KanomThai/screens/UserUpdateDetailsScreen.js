import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import ScreenTemplate from '../components/ScreenTemplate';

import { getProfile } from '../APIs.js/GetProfile';
import { updateUserInformation } from '../APIs.js/UpdateUserInformation';

export default function UpdateDetailsScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setUsername(profileData.username);
        setEmail(profileData.email);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdate = async () => {
    if (!oldPassword) {
      Alert.alert('Validation Error', 'Old password is required to update information.');
      return;
    }

    setLoading(true);
    try {
      const response = await updateUserInformation({ username, email, oldPassword, password: newPassword });
      Alert.alert('Success', response.message || 'User information updated successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update user information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.content}>
        <Text style={styles.label}>Update Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new username"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Update Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter old password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password (optional)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.updateButtonText}>{loading ? 'Updating...' : 'Update Information'}</Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  label: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat',
    alignSelf: 'flex-start',
    marginBottom: 4,
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
  updateButton: {
    width: '75%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat',
  },
});

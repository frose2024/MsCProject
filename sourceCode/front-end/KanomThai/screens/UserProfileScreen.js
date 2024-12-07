import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import ScreenTemplate from '../components/ScreenTemplate';
import { getProfile, updateBirthday } from '../APIs/GetProfile';
import ProgressBar from '../components/ProgressBar';

// User Profile Screen for managing user profile data
export default function UserProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null); // Profile data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [birthday, setBirthday] = useState(new Date()); // User's birthday
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch profile data from the server
        const data = await getProfile();
        setProfile(data);
        if (data.birthday) {
          setBirthday(new Date(data.birthday)); // Set birthday state
        }
      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchProfile(); // Fetch profile on component mount
  }, []);

  const handleBirthdayChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setBirthday(selectedDate); // Update birthday locally
      updateBirthday(selectedDate)
        .then(() => Alert.alert('Birthday updated successfully!'))
        .catch((err) => Alert.alert('Error updating birthday', err.message));
    }
  };

  const formattedBirthday = new Date(birthday).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }); // Format birthday for display


  return (
    <ScreenTemplate>
      <View style={styles.content}>
        <View style={styles.usernameContainer}>
          <Text style={styles.usernameText}>
            Hello, {profile?.username?.toUpperCase() || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('UpdateDetails')}>
          <Text style={styles.updateLink}>
            Would you like to update your login details?
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Your birthday has been set to {formattedBirthday}</Text>

        <View style={styles.buttonContainer}>
          <Button title="Change Birthday" onPress={() => setShowDatePicker(true)} />
        </View>

        {showDatePicker && (
          <View style={styles.overlay}>
            <DateTimePicker
              value={birthday}
              mode="date"
              display="default"
              onChange={handleBirthdayChange}
              onTouchCancel={() => setShowDatePicker(false)}
            />
          </View>
        )}

        {typeof profile?.points === 'number' && (
          <View style={styles.progressBarContainer}>
            <ProgressBar points={profile.points} />
          </View>
        )}
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
  usernameContainer: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },
  usernameText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
  },
  updateLink: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Montserrat',
    textDecorationLine: 'underline',
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePicker: {
    marginBottom: 80,
  },
  progressBarContainer: {
    marginTop: 70,
    width: '80%',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import ScreenTemplate from '../components/ScreenTemplate';
import { getProfile, updateBirthday } from '../APIs.js/GetProfile';
import ProgressBar from '../components/ProgressBar';

export default function UserProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthday, setBirthday] = useState(new Date());

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        console.log('Fetched profile data:', data);
        setProfile(data);
        if (data.birthday) {
          setBirthday(new Date(data.birthday));
        }
      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleBirthdayChange = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = selectedDate || birthday;
      setBirthday(currentDate);

      updateBirthday(currentDate)
        .then(() => Alert.alert("Birthday updated successfully!"))
        .catch(err => Alert.alert("Error updating birthday", err.message));
    }
  };

  const formattedBirthday = birthday.toLocaleDateString("en-GB", {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <ScreenTemplate>
      <View style={styles.content}>
        <View style={styles.usernameContainer}>
          <Text style={styles.usernameText}> Hello, {profile?.username?.toUpperCase() || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('UpdateDetails')}>
          <Text style={styles.updateLink}>Would you like to update your login details?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Your birthday has been set to the {formattedBirthday}</Text>

        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          onChange={handleBirthdayChange}
          style={styles.datePicker}
        />

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
    textTransform: 'uppercase',
  },
  updateLink: {
    fontsize: 16,
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
  },
  datePicker: {
    marginBottom: 80,
  },
  progressBarContainer: {
    marginTop: 20,
    width: '80%',
  },
});

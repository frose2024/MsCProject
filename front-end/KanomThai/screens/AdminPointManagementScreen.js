import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import ScreenTemplate from '../components/ScreenTemplate';
import { updateUserPoints } from '../APIs/PointManagement';
import { fetchQRCode } from '../APIs/FetchQR';

const AdminPointManagementScreen = ({ route, navigation }) => {
  const { userId, points, generationCount } = route.params;

  const [currentPoints, setCurrentPoints] = useState(points);
  const [addCount, setAddCount] = useState(0);
  const [removeCount, setRemoveCount] = useState(0);

  const handleAddPoints = () => {
    setCurrentPoints((prev) => prev + 25);
    setAddCount((prev) => prev + 1);
  };

  const handleRemovePoints = () => {
    if (currentPoints >= 25) {
      setCurrentPoints((prev) => prev - 25);
      setRemoveCount((prev) => prev + 1);
    } else {
      Alert.alert('Error', 'Points cannot be negative.');
    }
  };

  const handleReset = () => {
    setCurrentPoints(points);
    setAddCount(0);
    setRemoveCount(0);
  };

  const handleSubmit = async () => {
    const pointChange = currentPoints - points;

    try {
      const result = await updateUserPoints(userId, pointChange);

      if (result.success) {
        Alert.alert('Success', 'Points updated successfully.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AdminHomeScreen'),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update points.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating points.');
    }
  };

  const handleCancel = () => {
    navigation.navigate('AdminHomeScreen');
  };

  const pointDifference = currentPoints - points;

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>USER ID: {userId}</Text>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsColumn}>
              <Text style={styles.columnHeader}>ORIGINAL</Text>
              <Text style={styles.pointsValue}>{points}</Text>
            </View>
            <View style={styles.pointsColumn}>
              <Text style={styles.columnHeader}>UPDATED</Text>
              <Text style={styles.pointsValue}>{currentPoints}</Text>
            </View>
          </View>
          <Text style={styles.differenceText}>DIFFERENCE -    {pointDifference > 0 ? `+${pointDifference}` : pointDifference}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddPoints}>
            <Text style={styles.buttonText}>ADD POINTS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={handleRemovePoints}
          >
            <Text style={styles.buttonText}>REMOVE POINTS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.resetButton, styles.wideButton]} onPress={handleReset}>
          <Text style={styles.resetButtonText}>RESET</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={[styles.submitButton, styles.wideButton]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, styles.smallButton]} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 25,
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },  
  infoBlock: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 16,
    width: '80%',
    alignSelf: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat',
    textTransform: 'uppercase',
  },
  pointsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  pointsColumn: {
    alignItems: 'center',
    flex: 1,
  },
  columnHeader: {
    fontSize: 14,
    textTransform: 'uppercase',
    color: '#666',
    fontFamily: 'Montserrat',
  },
  pointsValue: {
    fontSize: 36,
    color: '#007AFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  differenceText: {
    fontSize: 16,
    color: '#333',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: '40%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
  },
  resetButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignSelf: 'center',
    width: '40%',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wideButton: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width:'40%',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
  },
});



export default AdminPointManagementScreen;

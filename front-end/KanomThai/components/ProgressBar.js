import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ points }) => {
  const progress = Math.min(points / 100, 1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />

        {progress < 1 && (
          <View style={[styles.stripedOverlay, { left: `${progress * 100}%` }]} />
        )}

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>{points} Points</Text>
        </View>
      </View>
      <Text style={styles.pointsText}>
        {points >= 100
          ? 'Congratulations! You’ve earned a free drink!'
          : `You are ${100 - points} points away from a free drink!`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '125%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#155c20',
    borderRadius: 10,
  },
  pointsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#fffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 18,
    marginTop: 8,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
});

export default ProgressBar;

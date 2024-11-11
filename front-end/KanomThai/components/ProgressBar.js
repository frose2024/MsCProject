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
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  stripedOverlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    backgroundImage: 'repeating-linear-gradient(45deg, #ddd, #ddd 10px, transparent 10px, transparent 20px)',
    zIndex: 1,
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

import React from 'react';
import { View, StyleSheet, SafeAreaView, Image } from 'react-native';

export default function ScreenTemplate({ children, showNavBar = false }) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.topDecorContainer}>
        <Image source={require('../assets/greyLeafLeft.png')} style={styles.topLeftLeaf} />
        <Image source={require('../assets/greyLeafRight.png')} style={styles.topRightLeaf} />
      </View>

      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.content}>
        {children}
      </View>

      <View style={styles.bottomDecorContainer}>
        <Image source={require('../assets/greenLLeft.png')} style={styles.bottomLeftFlower} />
        <Image source={require('../assets/greenLRight.png')} style={styles.bottomRightFlower} />
      </View>

      {showNavBar && (
        <View style={styles.navBar}>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
  topDecorContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 45,
  },
  topLeftLeaf: {
    width: 70,
    height: 80,
    resizeMode: 'contain',
  },
  topRightLeaf: {
    width: 70,
    height: 80,
    resizeMode: 'contain',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 120,
  },
  logo: {
    width: 350,
    height: 125,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  bottomDecorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: -18,
  },
  bottomLeftFlower: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  bottomRightFlower: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  navBar: {
    height: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

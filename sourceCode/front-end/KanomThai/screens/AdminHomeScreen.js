import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

import ScreenTemplate from '../components/ScreenTemplate';
import { handleScannedQRCode } from '../APIs/ProcessQRCode';
import { handleBarCodeScanned } from '../APIs/ProcessScannedQRCode';
import { uploadMenu } from '../APIs/Menu';

export default function AdminHomeScreen({ handleLogout }) {
  const [permission, requestPermission] = useCameraPermissions();   // Camera permissions
  const [isCameraOpen, setIsCameraOpen] = useState(false);  // Camera state
  const [scanned, setScanned] = useState(false);  // Barcode scanned state
  const [errorState, setErrorState] = useState(false);  // Error state for scanning
  const [isUploading, setIsUploading] = useState(false);  // Menu upload state
  const navigation = useNavigation();

  // Request camera permissions on mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const openCamera = () => {
    setIsCameraOpen(true);
    setScanned(false);  // Reset scanning state
    setErrorState(false);   // Reset error state
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  const onBarCodeScanned = (scanningResult) => {
    if (scanned || errorState) {
      return; // Prevent re-processing if already scanned OR in error state
    }
    handleBarCodeScanned(scanningResult, setScanned, setErrorState, navigation, handleScannedQRCode);
  };

  const handleUploadMenu = async () => {
    try {
      setIsUploading(true);
      const result = await uploadMenu();
      if (result) {
        Alert.alert('Success', 'Menu uploaded successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to upload the menu.');
    } finally {
      setIsUploading(false); // Reset uploading state
    }
  };

  // Handles cases where the camera permission is pending
  if (!permission) {
    return <View><Text>Requesting camera permissions...</Text></View>;
  }

  // Display if the camera permission isn't granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.cameraButton}>
          <Text style={styles.cameraButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.cameraButton}>
          <Text style={styles.cameraButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenTemplate>
      <View style={styles.content}>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
  
        {isCameraOpen ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} onBarcodeScanned={onBarCodeScanned} />
            <TouchableOpacity style={styles.closeButton} onPress={closeCamera}>
              <Text style={styles.closeButtonText}>Close Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraSection}>
            <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
              <Text style={styles.cameraButtonText}>Open Camera</Text>
            </TouchableOpacity>
            <Text style={styles.cameraDescription}>
              Use your camera to scan a valid QR code
            </Text>
          </View>
        )}
  
        {errorState && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>
              An error occurred while processing the QR code. Please try again.
            </Text>
          </View>
        )}
  
        <View style={styles.menuUploadContainer}>
          {isUploading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <TouchableOpacity style={styles.cameraButton} onPress={handleUploadMenu}>
              <Text style={styles.cameraButtonText}>Upload Menu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenTemplate>
  );
}
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 20,
    },
    logoutButton: {
      width: '80%', 
      backgroundColor: '#7096b5',
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 5,
      marginTop: 10,
    },
    logoutButtonText: {
      fontSize: 14,
      color: '#FFFFFF',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    cameraSection: {
      alignItems: 'center',
    },
    cameraButton: {
      padding: 12,
      backgroundColor: '#007bff',
      borderRadius: 5,
      marginTop: 20,
      width: '60%',
      alignItems: 'center',
    },
    cameraButtonText: {
      color: '#fff',
      fontSize: 16,
      textTransform: 'uppercase',
    },
    cameraDescription: {
      fontSize: 14,
      color: '#333',
      textAlign: 'center',
      marginTop: 10,
    },
    cameraContainer: {
      width: '90%',
      height: 300,
      overflow: 'hidden',
      borderRadius: 10,
      marginTop: 20,
    },
    camera: {
      flex: 1,
      width: '100%',
    },
    closeButton: {
      backgroundColor: '#fff',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
      position: 'absolute',
      bottom: 20,
      left: 30,
    },
    closeButtonText: {
      fontSize: 14,
      color: '#000',
    },
    menuUploadContainer: {
      marginTop: 15,
      marginBottom: 20,
    },
    errorContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    errorMessage: {
      color: 'red',
      fontSize: 14,
      textAlign: 'center',
    },
  });
  
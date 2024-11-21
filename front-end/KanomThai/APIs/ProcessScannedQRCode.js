export const handleBarCodeScanned = async (
    { data },
    setScanned,
    setErrorState,
    navigation,
    handleScannedQRCode
  ) => {
  
  if (!data) {
    console.warn('No data detected in barcode.');
    setErrorState(true);
    return;
  }
  setScanned(true);

  try {
    const result = await handleScannedQRCode(data);
    // Debug: console.log('QR code processing result:', result);

    if (result.success) {
      navigation.navigate('PointManagementScreen', {
        userId: result.data.userId,
        points: result.data.points,
        generationCount: result.data.generationCount,
      });
    } else {
      console.error('Failed to process QR code:', result.message || 'Unknown error');
      setErrorState(true);
    }
  } catch (error) {
    console.error('Error processing QR code:', error);
    setErrorState(true);
  }
};


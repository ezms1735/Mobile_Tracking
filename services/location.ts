import * as Location from 'expo-location';

// Fungsi untuk memastikan driver memberikan izin lokasi dan mendapatkan koordinat saat itu
export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('GPS wajib diaktifkan untuk driver');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

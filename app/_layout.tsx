import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="driver/beranda" />
      <Stack.Screen name="driver/riwayat" />
      <Stack.Screen name="driver/profil" />
      <Stack.Screen name="driver/mulai" />
      <Stack.Screen name="pelanggan/beranda" />
    </Stack>
  );
}

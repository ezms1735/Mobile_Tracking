import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { loginUser } from '../services/api';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔑 Cek login otomatis saat buka app
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      if (token && role) {
        if (role === 'driver') router.replace('/driver/beranda');
        else if (role === 'pelanggan') router.replace('/pelanggan/beranda');
      }
    };

    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password harus diisi!');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(username, password);

      if (result.success) {
        const user = result.user;

        // Simpan token dan data user ke AsyncStorage
        await AsyncStorage.multiSet([
          ['userToken', result.token || ''],
          ['userRole', user?.peran || ''],
          ['driverId', user?.id?.toString() || ''],
          ['userData', JSON.stringify(user || {})],
        ]);

        // Redirect berdasarkan role
        const role = user?.peran;
        if (role === 'driver') router.replace('/driver/beranda');
        else if (role === 'pelanggan') router.replace('/pelanggan/beranda');
        else Alert.alert('Error', 'Role pengguna tidak dikenali');
      } else {
        Alert.alert('Login Gagal', result.message || 'Username atau password salah');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />

        {/* Judul */}
        <Text style={styles.title}>Moya Kristal</Text>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <InputField
          placeholder="Masukkan username"
          value={username}
          onChangeText={setUsername}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <InputField
          placeholder="Masukkan password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Tombol Login */}
        <Button
          title={loading ? 'Memproses...' : 'Masuk'}
          onPress={handleLogin}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    color: '#0066ff',
  },
  label: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 8,
    fontWeight: '500',
  },
});

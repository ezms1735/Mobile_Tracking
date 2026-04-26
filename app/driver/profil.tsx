import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavDriver from '../../components/ButtomNavDriver';
import { api } from '../../services/api';  
import { useRouter } from 'expo-router';

interface ProfileData {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
}

export default function ProfilDriver() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<ProfileData>({
    namaLengkap: '',
    email: '',
    nomorTelepon: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Sesi Habis', 'Silakan login ulang.');
        return;
      }

      const response = await api.get('/api/driver/profil');

      const data = response.data?.data || response.data;

      if (!data || !response.data?.success) {
        throw new Error(response.data?.message || 'Gagal memuat profil');
      }

      const profileData: ProfileData = {
        namaLengkap: data.nama_lengkap || data.name || data.full_name || '',
        email: data.email || '',
        nomorTelepon: data.nomor_telepon || data.telepon || data.phone || data.no_hp || '',
      };

      setProfile(profileData);
      setEditData(profileData);
    } catch (error: any) {
      console.error('Gagal memuat profil:', error);
      const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      Alert.alert('Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    try {
      const payload = {
        nama_lengkap: editData.namaLengkap.trim(),
        email: editData.email.trim(),
        nomor_telepon: editData.nomorTelepon.trim(),
      };

      const response = await api.put('/api/driver/profil', payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Gagal menyimpan');
      }

      const updated = response.data?.data || payload;

      const newProfile: ProfileData = {
        namaLengkap: updated.nama_lengkap || payload.nama_lengkap,
        email: updated.email || payload.email,
        nomorTelepon: updated.nomor_telepon || payload.nomor_telepon,
      };

      setProfile(newProfile);
      setEditData(newProfile);
      setModalVisible(false);

      Alert.alert('Berhasil', 'Profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Gagal update profil:', error);
      const msg = error.response?.data?.message || error.message || 'Gagal menyimpan';
      Alert.alert('Gagal', msg);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/api/driver/logout').catch(() => {});
            } catch {}

            await AsyncStorage.multiRemove([
              'userToken',
              'userRole',
              'driverId',
            ]);

            router.replace('/login');

          },
        },
      ]
    );
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Data profil tidak tersedia</Text>
        <TouchableOpacity onPress={fetchProfile}>
          <Text style={{ color: '#FF9500', marginTop: 16, fontWeight: '600' }}>
            Muat Ulang
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil Driver</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {['namaLengkap', 'email', 'nomorTelepon'].map((key) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {key === 'namaLengkap' ? 'Nama Lengkap' :
               key === 'nomorTelepon'     ? 'Nomor Telepon' : 
               key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <View style={styles.inputBox}>
              <Text style={styles.valueText}>
                {profile[key as keyof ProfileData] || '—'}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>Edit Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.btnText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavDriver />

      {/* Edit */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.namaLengkap}
                onChangeText={v => updateField('namaLengkap', v)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.email}
                onChangeText={v => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.nomorTelepon}
                onChangeText={v => updateField('nomorTelepon', v)}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#333' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },

  fieldContainer: { marginBottom: 24 },
  label: { fontSize: 15, color: '#555', marginBottom: 8, fontWeight: '600' },
  inputBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  addressBox: { minHeight: 80 },
  valueText: { fontSize: 16, color: '#222', lineHeight: 22 },

  buttonWrapper: { marginTop: 40, alignItems: 'center' },
  editBtn: {
    backgroundColor: '#FF9500',
    width: '80%',
    maxWidth: 240,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: '#FF3B30',
    width: '80%',
    maxWidth: 240,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  closeBtn: { padding: 6 },
  closeIcon: { fontSize: 28, color: '#777', fontWeight: 'bold' },

  modalField: { marginBottom: 20 },
  modalInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalAddressInput: { minHeight: 100, textAlignVertical: 'top' },

  saveBtn: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
});
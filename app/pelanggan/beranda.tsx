import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { api } from '../../services/api';
import BottomNavPelanggan from '../../components/ButtomNavPelanggan';

const MOYA_LOGO = require('../../assets/images/logo.png');

interface Pesanan {
  id: number;
  jumlah_pesanan: number;
  status_pesanan: string;
  created_at?: string;
  driver?: {
    id: number;
    nama_lengkap: string;
  };
  nama_driver?: string;
}

const BerandaPelanggan = () => {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [jumlahPesanan, setJumlahPesanan] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPesananPelanggan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pelanggan/pesanan');

      if (response.data?.success) {
        setPesanan(response.data.data || response.data.pesanan || []);
      } else {
        setPesanan([]);
      }
    } catch (err: any) {
      console.error('Gagal ambil pesanan:', err);
      Alert.alert('Error', err.response?.data?.message || 'Gagal memuat daftar pesanan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPesananPelanggan();
  }, [fetchPesananPelanggan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPesananPelanggan();
  };

  const handleTambahPesanan = async () => {
    const jumlah = Number(jumlahPesanan.trim());

    if (!jumlahPesanan || isNaN(jumlah) || jumlah <= 0) {
      Alert.alert('Validasi', 'Masukkan jumlah pesanan yang valid');
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await api.post('/api/pelanggan/pesanan', {
        jumlah_pesanan: jumlah,
      });

      if (response.data?.success) {
        Alert.alert('Sukses', 'Pesanan berhasil dibuat!');
        setModalVisible(false);
        setJumlahPesanan('');
        fetchPesananPelanggan();
      } else {
        throw new Error(response.data?.message || 'Gagal menyimpan pesanan');
      }
    } catch (err: any) {
      console.error('Gagal tambah pesanan:', err);
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderPesananItem = ({ item }: { item: Pesanan }) => {
    const statusColor =
      item.status_pesanan === 'selesai'
        ? '#10B981'
        : item.status_pesanan === 'proses'
        ? '#F59E0B'
        : '#6B7280';

    return (
      <View style={styles.pesananCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.jumlahText}>Jumlah Pesanan: {item.jumlah_pesanan}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: statusColor + '22', color: statusColor }]}>
            {item.status_pesanan.toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.label}>Nama Driver:</Text>
          <Text style={styles.value}>
            {item.nama_driver || item.driver?.nama_lengkap || '-'}
          </Text>
        </View>

        {item.created_at && (
          <Text style={styles.tanggal}>
            Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat pesanan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={MOYA_LOGO} style={styles.moyaLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Pesanan Saat Ini</Text>
        </View>
      </View>

      <FlatList
        data={pesanan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPesananItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
            <Text style={styles.emptySubtitle}>
              Tambahkan pesanan baru untuk memulai pengiriman
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        contentContainerStyle={[
          pesanan.length === 0 ? { flex: 1 } : {},
          { paddingBottom: 100 },
        ]}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabLabel}>Pesanan</Text>
        </View>
      </TouchableOpacity>

      <BottomNavPelanggan />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buat Pesanan Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Jumlah Pesanan</Text>
                <TextInput
                  style={styles.modalInput}
                  value={jumlahPesanan}
                  onChangeText={setJumlahPesanan}
                  keyboardType="numeric"
                  placeholder="Contoh: 5"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, submitLoading && styles.saveBtnDisabled]}
                onPress={handleTambahPesanan}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Pesan Sekarang</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moyaLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  pesananCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jumlahText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  tanggal: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },

  fab: {
    position: 'absolute',
    bottom: 120, 
    right: 10,
    zIndex: 10,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 10,
  },
  fabLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    fontSize: 32,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  btnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default BerandaPelanggan;
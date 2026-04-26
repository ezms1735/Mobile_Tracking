import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import BottomNavPelanggan from "../../components/ButtomNavPelanggan";
import { getPelangganRiwayat } from "../../services/api";

const API_URL = "https://centuried-nonlucid-diana.ngrok-free.dev";

interface RiwayatItem {
  id: number;
  jumlah_terkirim: number;
  jumlah_pesanan: number;
  waktu_selesai: string;
  nama_driver: string;
  nomor_telepon_driver: string;
  bukti_foto?: string;
  pengiriman?: {
    bukti_foto?: string;
  };
}

export default function RiwayatPelanggan() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<RiwayatItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchRiwayat = async () => {
        setLoading(true);
        try {
          const data = await getPelangganRiwayat();
          setRiwayat(data.riwayat || []);
        } catch (err) {
          console.log("Gagal ambil riwayat pelanggan:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRiwayat();
    }, [])
  );

  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getFotoUrl = (item: RiwayatItem) => {
    const path = item.bukti_foto || item.pengiriman?.bukti_foto;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/storage/${path}`;
  };

  const renderItem = ({ item }: { item: RiwayatItem }) => {
    const fotoUrl = getFotoUrl(item);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.driverText}>
              {item.nama_driver || "Driver"}
            </Text>

            <Text style={styles.infoText}>
              Terkirim:{" "}
              <Text style={styles.bold}>
                {item.jumlah_terkirim ?? "-"}
              </Text>
            </Text>

            <Text style={styles.tanggal}>
              {formatTanggal(item.waktu_selesai)}
            </Text>
          </View>

          <View style={styles.cardRight}>
            <View style={styles.badgeSelesai}>
              <Text style={styles.badgeText}>Selesai</Text>
            </View>

            {fotoUrl ? (
              <Image
                source={{ uri: fotoUrl }}
                style={styles.buktiImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.buktiPlaceholder}>
                <Ionicons name="image-outline" size={20} color="#aaa" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00456B" style={{ marginTop: 80 }} />
      ) : riwayat.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada riwayat</Text>
        </View>
      ) : (
        <FlatList
          data={riwayat}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Pengiriman</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                
                <Text style={styles.modalLabel}>Driver</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.nama_driver || "-"}
                </Text>

                <Text style={styles.modalLabel}>No HP</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.nomor_telepon_driver || "-"}
                </Text>

                <Text style={styles.modalLabel}>Jumlah Pesanan</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.jumlah_pesanan ?? "-"}
                </Text>

                <Text style={styles.modalLabel}>Jumlah Terkirim</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.jumlah_terkirim ?? "-"}
                </Text>

                <Text style={styles.modalLabel}>Tanggal</Text>
                <Text style={styles.modalValue}>
                  {formatTanggal(selectedItem.waktu_selesai)}
                </Text>

                <Text style={styles.modalLabel}>Bukti</Text>
                {getFotoUrl(selectedItem) ? (
                  <Image
                    source={{ uri: getFotoUrl(selectedItem)! }}
                    style={styles.modalImage}
                  />
                ) : (
                  <Text style={styles.modalValue}>Tidak ada foto</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavPelanggan />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
    paddingTop: 40,
  },

  header: {
    paddingVertical: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },

  cardLeft: {
    flex: 1,
    gap: 6,
    justifyContent: "space-between",
  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  driverText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  infoText: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },

  bold: {
    fontWeight: "700",
    color: "#000",
  },

  tanggal: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  badgeSelesai: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  buktiImage: {
    width: 75,
    height: 55,
    borderRadius: 6,
    marginTop: 6,
  },

  buktiPlaceholder: {
    width: 75,
    height: 55,
    borderRadius: 6,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 16,
    color: "#888",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  closeIcon: {
    fontSize: 24,
    color: "#555",
  },

  modalLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 10,
  },

  modalValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },

  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});
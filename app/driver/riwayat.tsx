import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";
import BottomNavDriver from "../../components/ButtomNavDriver";
import { getDriverRiwayat } from "../../services/api";

const API_URL = "https://centuried-nonlucid-diana.ngrok-free.dev";

// grouping tanggal
const groupByDate = (data: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  data.forEach((item) => {
    const date = item.waktu_selesai
      ? new Date(item.waktu_selesai).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Tanggal tidak tersedia";

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  return Object.keys(grouped).map((title) => ({
    title,
    data: grouped[title],
  }));
};

export default function RiwayatDriver() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: state harus di dalam component
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchRiwayat = async () => {
        setLoading(true);
        try {
          const data = await getDriverRiwayat();
          const pesanan = data.pesanan || [];
          setSections(groupByDate(pesanan));
        } catch (err) {
          console.log("Gagal ambil riwayat:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRiwayat();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    const fotoUrl = item.bukti_foto
      ? `${API_URL}/storage/${item.bukti_foto}`
      : null;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.card}>
        {/* KIRI */}
        <View style={styles.cardLeft}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.pelanggan?.nama_lengkap || "Pelanggan"}
          </Text>

          <Text style={styles.infoText}>
            Jumlah: {item.jumlah_pesanan || "-"}
          </Text>

          <Text style={styles.infoText}>
            Terkirim: {item.jumlah_terkirim || "-"}
          </Text>
        </View>

        {/* KANAN */}
        <View style={styles.cardRight}>
          <View style={styles.badgeSelesai}>
            <Text style={styles.badgeText}>Selesai</Text>
          </View>

          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.buktiImage} />
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

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Pengiriman</Text>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#00456B" style={{ marginTop: 80 }} />
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada riwayat</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
        />
      )}

      <BottomNavDriver />

      {/* ✅ MODAL DETAIL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Pengiriman</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            {selectedItem && (
              <ScrollView>
                <Text style={styles.modalLabel}>Nama</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.pelanggan?.nama_lengkap || "-"}
                </Text>

                <Text style={styles.modalLabel}>No HP</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.pelanggan?.nomor_telepon || "-"}
                </Text>

                <Text style={styles.modalLabel}>Alamat</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.pelanggan?.alamat || "-"}
                </Text>

                <Text style={styles.modalLabel}>Jumlah Pesanan</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.jumlah_pesanan}
                </Text>

                <Text style={styles.modalLabel}>Terkirim</Text>
                <Text style={styles.modalValue}>
                  {selectedItem.jumlah_terkirim}
                </Text>

                <Text style={styles.modalLabel}>Bukti</Text>
                {selectedItem.bukti_foto ? (
                  <Image
                    source={{
                      uri: `${API_URL}/storage/${selectedItem.bukti_foto}`,
                    }}
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                  />
                ) : (
                  <Text style={styles.modalValue}>Tidak ada foto</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F3F2", paddingTop: 40 },

  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  listContent: { padding: 12, paddingBottom: 90 },

  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#ccc" },
  sectionHeaderText: { marginHorizontal: 10, fontSize: 13 },

  card: {
    backgroundColor: "#E8EAEA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
    gap: 6,
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  infoText: { 
    fontSize: 12,
    color: "#444",
  },
  cardRight: { 
    width: 90, 
    alignItems: "flex-end", 
    justifyContent: "space-between"
  },
  badgeSelesai: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  badgeText: { color: "#fff", fontSize: 12 },

  buktiImage: { width: 80, height: 60, borderRadius: 6 },
  buktiPlaceholder: {
    width: 80,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 10 },

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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: { fontWeight: "700", fontSize: 18 },
  closeIcon: { fontSize: 24 },

  modalLabel: { marginTop: 10, color: "#666" },
  modalValue: { fontWeight: "500" },
});
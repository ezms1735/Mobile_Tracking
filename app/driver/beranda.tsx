import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavDriver from "../../components/ButtomNavDriver";
import { getDriverPesanan } from "../../services/api";
import { db } from "../../services/firebase";
import { getCurrentLocation } from "../../services/location";

const MOYA_LOGO = require("../../assets/images/logo.png");

const StatusBadge = ({ status }: { status: string }) => {
  const statusLower = status?.toLowerCase() || "";

  const isProses =
    statusLower === "proses" ||
    statusLower === "dalam_proses" ||
    statusLower === "sedang_proses" ||
    statusLower.includes("pengiriman");

  return (
    <View
      style={[styles.badge, isProses ? styles.badgeProses : styles.badgeBelum]}
    >
      <Text style={styles.badgeText}>{isProses ? "PROSES" : "BELUM"}</Text>
    </View>
  );
};

export default function DriverBeranda() {
  const router = useRouter();
  const [pesanan, setPesanan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPesanan = async () => {
    try {
      const driverId = await AsyncStorage.getItem("driverId");
      console.log("Fetching pesanan for driverId:", driverId);
      const data = await getDriverPesanan();
      console.log("Pesanan data received:", data);
      setPesanan(data.pesanan || []);
    } catch (err) {
      console.log("Gagal ambil pesanan:", err);
    }
  };

  const handlePilihPesanan = (item: any) => {
    router.push({
      pathname: "/driver/mulai",
      params: { pesananId: item.id },
    });
  };

  const kirimLokasi = async () => {
    try {
      const lokasi = await getCurrentLocation();
      const driverId = await AsyncStorage.getItem("driverId");
      if (lokasi && driverId) {
        await set(ref(db, `drivers/${driverId}`), {
          latitude: lokasi.latitude,
          longitude: lokasi.longitude,
          updated_at: Date.now(),
        });
      }
    } catch (err) {
      console.log("Gagal kirim lokasi", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await kirimLokasi();
      await fetchPesanan();
      setLoading(false);
    };
    loadData();

    const interval = setInterval(fetchPesanan, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={MOYA_LOGO}
            style={styles.moyaLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Pengiriman Saat Ini</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00456B"
          style={{ marginTop: 80 }}
        />
      ) : pesanan.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada pesanan hari ini</Text>
        </View>
      ) : (
        <FlatList
          data={pesanan}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handlePilihPesanan(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.customerName}>
                  {item.pelanggan?.nama_lengkap || "Pelanggan"}
                </Text>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Ionicons name="call-outline" size={16} color="#00456B" />
                  <Text style={styles.value}>
                    {item.pelanggan?.nomor_telepon ||
                      "-"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Ionicons name="location-outline" size={16} color="#00456B" />
                  <Text style={styles.value} numberOfLines={2}>
                    {item.pelanggan?.alamat || "-"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.labelSmall}>Jumlah: </Text>
                  <Text style={styles.valueBold}>
                    {item.jumlah_pesanan || "0"} pack
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <BottomNavDriver />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F3F2",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moyaLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 12,
  },
  cardBody: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelSmall: {
    fontSize: 13,
    color: "#777",
  },
  value: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  valueBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeProses: {
    backgroundColor: "#ff9800",
  },
  badgeBelum: {
    backgroundColor: "#2196f3",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

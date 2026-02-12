import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { getPesananDetail } from "@/services/api";

interface PesananDetail {
  id: string;
  pelanggan: {
    nama_lengkap: string;
    alamat: string;
    nomor_telepon: string;
  };
  jumlah_pesanan: number | string;
}

export default function LokasiPesanan() {  
  const router = useRouter();
  const { pesananId } = useLocalSearchParams<{ pesananId: string }>();

  const [detail, setDetail] = useState<PesananDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pesananId) {
      setError("Pesanan ID tidak ditemukan");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getPesananDetail(pesananId);

        console.log("RESPON DARI API (halaman sampai):", res);

        const data = res?.pesanan ?? res?.data?.pesanan;

        if (!data) {
          throw new Error("Data pesanan tidak valid");
        }

        setDetail({
          id: String(data.id),
          jumlah_pesanan: data.jumlah_pesanan ?? 0,
          pelanggan: {
            nama_lengkap: data.pelanggan?.nama_lengkap ?? "-",
            alamat: data.pelanggan?.alamat ?? "-",
            nomor_telepon: data.pelanggan?.nomor_telepon ?? "-",
          },
        });
      } catch (err: any) {
        console.error("ERROR DETAIL (halaman sampai):", err);
        setError(err.message || "Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [pesananId]);

  const handleSampai = (item: any) => {
    router.push({
      pathname: "/driver/bukti",
      params: { pesananId: item.id },
    });
  };

  if (error || !detail) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color="#d32f2f" />
          <Text style={styles.errorText}>{error || "Data pesanan tidak ditemukan"}</Text>
          <TouchableOpacity style={styles.btnKembali} onPress={() => router.back()}>
            <Text style={styles.btnTextKembali}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 20, right: 20 }}>
            <Ionicons name="arrow-back" size={28} color="#00456B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{detail.pelanggan.nama_lengkap}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Alamat</Text>
              <View style={[styles.readOnlyField, styles.readOnlyMultiline]}>
                <Text style={styles.readOnlyValue}>{detail.pelanggan.alamat}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telepon</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{detail.pelanggan.nomor_telepon}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Jumlah Pesanan</Text>
              <View style={styles.readOnlyField}>
                <Text style={[styles.readOnlyValue, styles.bold]}>{detail.jumlah_pesanan} pack</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btnSampai} activeOpacity={0.8} onPress={handleSampai}>
              <Text style={styles.btnText}>Sampai</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F1F3F2" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  field: { marginBottom: 20 },
  label: { fontSize: 15, color: "#555", marginBottom: 8, fontWeight: "500" },
  readOnlyField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    minHeight: 52,
  },
  readOnlyMultiline: { minHeight: 100, paddingTop: 12 },
  readOnlyValue: { fontSize: 16, color: "#222" },
  bold: { fontWeight: "600", color: "#00456B" },
  btnSampai: {
    backgroundColor: "#D17B02",  
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: "white", fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#555" },
  errorText: { marginTop: 16, fontSize: 16, color: "#d32f2f", textAlign: "center" },
  btnKembali: {
    marginTop: 24,
    backgroundColor: "#00456B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnTextKembali: { color: "white", fontSize: 16, fontWeight: "600" },
});
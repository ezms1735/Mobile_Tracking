import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context"; // alias biar jelas
import * as ImagePicker from "expo-image-picker";

export default function BuktiPengiriman() {
  const router = useRouter();
  const { pesananId } = useLocalSearchParams<{ pesananId: string }>();

  const [fotoBukti, setFotoBukti] = useState<string | null>(null);
  const [jumlahTerkirim, setJumlahTerkirim] = useState("");
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Minta izin galeri sekali saja saat halaman dimuat
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionGranted(status === "granted");
      if (status !== "granted") {
        Alert.alert("Izin Diperlukan", "Aplikasi membutuhkan akses galeri untuk upload foto bukti.");
      }
    })();
  }, []);

  const pickImage = async () => {
    if (!permissionGranted) {
      Alert.alert("Izin Ditolak", "Izinkan akses galeri terlebih dahulu.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoBukti(result.assets[0].uri);
    }
  };

  const handleSelesai = () => {
    if (!fotoBukti) {
      Alert.alert("Foto Bukti Wajib", "Silakan upload foto bukti pengiriman terlebih dahulu.");
      return;
    }

    if (!jumlahTerkirim.trim() || isNaN(Number(jumlahTerkirim)) || Number(jumlahTerkirim) <= 0) {
      Alert.alert("Jumlah Tidak Valid", "Masukkan jumlah pesanan yang benar (angka positif).");
      return;
    }

    Alert.alert(
      "Konfirmasi Selesai",
      `Apakah pesanan ${jumlahTerkirim} pack sudah benar-benar terkirim dengan bukti foto?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Selesai",
          onPress: () => {
            // Di sini nanti panggil API untuk simpan bukti
            // Contoh: await api.post("/api/driver/bukti", formData);

            Alert.alert("Sukses", "Bukti pengiriman berhasil disimpan!");
            router.replace("/driver/riwayat"); // atau "/driver" jika riwayat belum ada
          },
        },
      ]
    );
  };

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#00456B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bukti Pengiriman</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* Foto Bukti */}
            <Text style={styles.label}>Foto Bukti</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              {fotoBukti ? (
                <Image source={{ uri: fotoBukti }} style={styles.uploadImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={48} color="#999" />
                  <Text style={styles.placeholderText}>Tambah Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Jumlah Pesanan Terkirim */}
            <Text style={styles.label}>Pesanan Terkirim</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan jumlah yang terkirim (contoh: 9)"
              value={jumlahTerkirim}
              onChangeText={setJumlahTerkirim}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />

            {/* Tombol Selesai */}
            <TouchableOpacity
              style={[styles.btnSelesai, loading && styles.btnDisabled]}
              activeOpacity={0.8}
              onPress={handleSelesai}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.btnText}>Selesai</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F3F2",
  },
  container: {
    flex: 1,
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
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
  label: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    marginBottom: 24,
  },
  uploadImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 12,
    color: "#999",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    marginBottom: 24,
  },
  btnSelesai: {
    backgroundColor: "#00456B", // biru sesuai gambar
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
  btnKembali: {
    marginTop: 24,
    backgroundColor: "#00456B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnTextKembali: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
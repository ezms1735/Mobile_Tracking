import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

const API_URL = "http://192.168.1.7:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
  validateStatus: function (status) {
    return status < 500;
  },
  httpAgent: {
    keepAlive: true,
  },
  httpsAgent: {
    keepAlive: true,
    rejectUnauthorized: false, // For development only
  },
});

// Tambahkan token secara otomatis
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.request && !error.response) {
      console.log("Network Error - No Response:", {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        timeout: error.config?.timeout,
      });
    } else {
      console.log("API Error Details:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  },
);

// Login user
export const loginUser = async (username: string, password: string) => {
  try {
    console.log("🔐 Attempting login:", { username, url: API_URL });
    const response = await api.post("/api/login", { username, password });

    if (response.status === 200 && response.data?.success) {
      console.log("✅ Login response:", response.data);
      return response.data;
    } else {
      console.log("❌ Login failed:", response.data);
      throw new Error(response.data?.message || "Login gagal");
    }
  } catch (error: any) {
    console.log("❌ Login error caught:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      responseData: error.response?.data,
    });

    // Lebih spesifik error handling
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Server tidak dapat diakses. Pastikan WiFi Anda terhubung ke 192.168.1.x",
      );
    } else if (error.code === "ENOTFOUND") {
      throw new Error(
        "Tidak bisa menemukan server. Cek IP address: 192.168.1.7",
      );
    } else if (error.response?.status === 401) {
      throw new Error("Username atau password salah");
    } else if (error.message.includes("timeout")) {
      throw new Error("Koneksi timeout. Server mungkin sibuk atau jauh");
    }

    throw new Error(
      error.response?.data?.message || error.message || "Gagal login",
    );
  }
};

// Ambil pengiriman driver
export const getPengirimanDriver = async () => {
  const response = await api.get("/api/driver/pengiriman");
  return response.data;
};

export const getDriverPesanan = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get("/api/driver/pesanan", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Gagal ambil pesanan");
  }
};

// Kirim lokasi driver
export const kirimLokasiDriver = async (lat: number, lng: number) => {
  const response = await api.post("/driver/lokasi", {
    latitude: lat,
    longitude: lng,
  });
  return response.data;
};

export const assignDriver = async (driverId: number, pesananId: number) => {
  const token = await AsyncStorage.getItem("userToken");

  const response = await api.post(
    "/api/admin/assign-driver",
    { driver_id: driverId, pesanan_id: pesananId },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data; // pastikan selalu JSON
};

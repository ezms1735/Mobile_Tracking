import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_URL = "http://192.168.1.5:8000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
  validateStatus: (status) => status < 500,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.request && !error.response) {
      console.log("Network Error - No Response:", {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        timeout: error.config?.timeout,
      });
    } else if (error.response) {
      console.log("API Error Details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  }
);


export const loginUser = async (username: string, password: string) => {
  try {
    console.log("🔐 Attempting login:", { username, url: `${API_URL}/api/login` });

    const response = await api.post("/api/login", { username, password });

    console.log("📦 FULL RESPONSE:", response.data);

    if (response.status === 200 && response.data?.success) {
      const { token, user } = response.data;
      const role = user?.peran;

      if (!token || !role || !user?.id) {
        throw new Error("Data autentikasi tidak lengkap dari server");
      }

      await AsyncStorage.multiSet([
        ["userToken", token],
        ["userRole", role],
        ["driverId", user.id.toString()],
      ]);

      return response.data;
    }

    throw new Error(response.data?.message || "Login gagal");
  } catch (error: any) {
    console.log("❌ Login error:", {
      message: error.message,
      status: error.response?.status,
      serverMessage: error.response?.data?.message,
    });

    throw new Error(error.response?.data?.message || error.message || "Gagal login");
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/api/logout");
    await AsyncStorage.multiRemove(["userToken", "userRole", "driverId"]);
    console.log("Logout berhasil");
  } catch (error) {
    console.error("Logout gagal:", error);
    await AsyncStorage.multiRemove(["userToken", "userRole", "driverId"]);
  }
};

export const getDriverPesanan = async () => {
  try {
    const response = await api.get("/api/driver/pesanan");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal mengambil daftar pesanan");
  }
};

export const getPesananDetail = async (pesananId: string | number) => {
  try {
    const response = await api.get(`/api/driver/pesanan/${pesananId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal mengambil detail pesanan");
  }
};
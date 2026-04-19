import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_URL = "https://centuried-nonlucid-diana.ngrok-free.dev"; 


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

export { api };


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

export const kirimBukti = (id: string | number, data: FormData) => {
  return api.post(`/api/driver/pesanan/${id}/bukti`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getDriverRiwayat = async () => {
  const response = await api.get("/api/driver/riwayat");
  return response.data;
};

export const getPelangganRiwayat = async () => {
  const response = await api.get("/api/pelanggan/riwayat");
  return response.data;
};

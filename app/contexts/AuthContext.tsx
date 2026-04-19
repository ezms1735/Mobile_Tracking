import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  namaLengkap: string;
  email: string;
  telepon: string;
  alamat: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (newData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // const API_BASE = 'http://192.168.1.:8000'; 
  const API_BASE = 'http://10.80.2.209:8000'; 
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('driverToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/driver/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Gagal fetch profil');

        const data = await response.json();
        setUser(data); // asumsi response { id, namaLengkap, email, telepon, alamat }
      } catch (err) {
        console.error('Error load user:', err);
        await AsyncStorage.removeItem('driverToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = async (newData: Partial<User>) => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      if (!token) throw new Error('Tidak ada token');

      const response = await fetch(`${API_BASE}/driver/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error('Gagal update profil');

      const updated = await response.json();
      setUser(updated); // update state global
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('driverToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
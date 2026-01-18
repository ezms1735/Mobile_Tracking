import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDxgGDwbLNCZeAyX3inFjsyG9BvM_Nkiag',
  authDomain: 'moyakristal-1a81e.firebaseapp.com',
  databaseURL: 'https://moyakristal-1a81e-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'moyakristal-1a81e',
  storageBucket: "moyakristal-1a81e.firebasestorage.app",
  messagingSenderId: "1001114808948",
  appId: "1:1001114808948:web:c48552264371717b3cd721"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const updateDriverLocation = (
  driverId: string,
  lat: number,
  lng: number
) => {
  return set(ref(db, `drivers/${driverId}`), {
    latitude: lat,
    longitude: lng,
    updated_at: Date.now(),
  });
};
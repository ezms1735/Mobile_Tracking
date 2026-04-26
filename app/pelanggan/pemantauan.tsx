import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDxgGDwbLNCZeAyX3inFjsyG9BvM_Nkiag',
  authDomain: 'moyakristal-1a81e.firebaseapp.com',
  databaseURL:
    'https://moyakristal-1a81e-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'moyakristal-1a81e',
};

const buildMapHtml = (driverId: string, namaDriver: string, jumlah: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Pemantauan</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; background: #f3f4f6; }
    #map { height: 100vh; width: 100vw; }

    #status-card {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: white;
      border-radius: 16px;
      padding: 14px 20px;
      min-width: 260px;
      max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .driver-icon { font-size: 28px; }
    .driver-info { flex: 1; }
    .driver-name { font-size: 15px; font-weight: 700; color: #111827; }
    .driver-detail { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .driver-update { font-size: 11px; color: #9CA3AF; margin-top: 4px; font-style: italic; }

    #loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(243,244,246,0.92);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #E5E7EB;
      border-top-color: #2563EB;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 15px; color: #4B5563; font-weight: 500; }
    .loading-sub { font-size: 12px; color: #9CA3AF; margin-top: 6px; }

    #no-location {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999;
      background: white;
      border-radius: 16px;
      padding: 24px 28px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      font-family: -apple-system, sans-serif;
      display: none;
      max-width: 280px;
    }
    #no-location .emoji { font-size: 36px; margin-bottom: 10px; }
    #no-location .title { font-size: 16px; font-weight: 700; color: #374151; }
    #no-location .subtitle { font-size: 13px; color: #6B7280; margin-top: 6px; line-height: 1.5; }
  </style>
</head>
<body>
  <div id="loading-overlay">
    <div class="spinner"></div>
    <div class="loading-text">Memuat lokasi driver...</div>
    <div class="loading-sub">Menghubungkan ke Firebase</div>
  </div>

  <div id="map"></div>

  <div id="status-card">
    <div class="driver-icon">🚚</div>
    <div class="driver-info">
      <div class="driver-name">${namaDriver}</div>
      <div class="driver-detail">Mengantarkan ${jumlah} pack pesanan Anda</div>
      <div class="driver-update" id="last-update">Menunggu data lokasi...</div>
    </div>
  </div>

  <div id="no-location">
    <div class="emoji">📍</div>
    <div class="title">Lokasi Belum Tersedia</div>
    <div class="subtitle">Driver belum membagikan lokasi saat ini. Coba lagi beberapa saat.</div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

  <script>
    var firebaseConfig = {
      apiKey: "${FIREBASE_CONFIG.apiKey}",
      authDomain: "${FIREBASE_CONFIG.authDomain}",
      databaseURL: "${FIREBASE_CONFIG.databaseURL}",
      projectId: "${FIREBASE_CONFIG.projectId}"
    };

    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

    var map = L.map('map', { zoomControl: true }).setView([-7.629, 111.52], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var truckIcon = L.divIcon({
      html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚚</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
    });

    var driverMarker = null;
    var firstLoad = true;
    var hasLocation = false;

    var noLocationTimer = setTimeout(function() {
      if (!hasLocation) {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('no-location').style.display = 'block';
      }
    }, 10000);

    var driverRef = db.ref('drivers/${driverId}');

    driverRef.on('value', function(snapshot) {
      var data = snapshot.val();
      if (!data || !data.latitude || !data.longitude) return;

      var lat = parseFloat(data.latitude);
      var lng = parseFloat(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      hasLocation = true;
      clearTimeout(noLocationTimer);
      document.getElementById('loading-overlay').style.display = 'none';
      document.getElementById('no-location').style.display = 'none';

      var timeStr = data.updated_at
        ? new Date(data.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '-';

      document.getElementById('last-update').textContent = 'Update terakhir: ' + timeStr;

      if (driverMarker) {
        driverMarker.setLatLng([lat, lng]);
        driverMarker.setPopupContent(
          '<b>${namaDriver}</b><br>Sedang mengantarkan pesanan Anda<br><small>Update: ' + timeStr + '</small>'
        );
      } else {
        driverMarker = L.marker([lat, lng], { icon: truckIcon })
          .addTo(map)
          .bindPopup('<b>${namaDriver}</b><br>Sedang mengantarkan pesanan Anda<br><small>Update: ' + timeStr + '</small>');
        driverMarker.openPopup();
      }

      if (firstLoad) {
        map.setView([lat, lng], 15);
        firstLoad = false;
      }
    }, function(error) {
      console.error('Firebase error:', error);
      document.getElementById('loading-overlay').style.display = 'none';
      document.getElementById('no-location').style.display = 'block';
    });
  </script>
</body>
</html>
`;

const pemantauan = () => {
  const { driverId, namaDriver, jumlahPesanan, pesananId, statusPesanan } = useLocalSearchParams<{
    driverId: string;
    namaDriver: string;
    jumlahPesanan: string;
    pesananId: string;
    statusPesanan: string;
  }>();
  const router = useRouter();

  const webViewRef = useRef<WebView>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);

  const htmlContent = buildMapHtml(
    driverId ?? '',
    namaDriver ?? 'Driver',
    jumlahPesanan ?? '0',
  );

  const statusColor =
    statusPesanan === 'selesai'
      ? '#10B981'
      : statusPesanan === 'proses'
      ? '#F59E0B'
      : '#6B7280';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lacak Pesanan</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {(statusPesanan ?? '').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.pesananBadge}>
          <Text style={styles.pesananBadgeText}>#{pesananId}</Text>
        </View>
      </View>

      {/* INFO STRIP */}
      <View style={styles.infoStrip}>
        <Text style={styles.infoText}>
          🚚 <Text style={styles.infoBold}>{namaDriver}</Text> sedang mengantarkan{' '}
          <Text style={styles.infoBold}>{jumlahPesanan} pack</Text> untuk Anda
        </Text>
      </View>

      {/* MAP WEBVIEW */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback
          androidLayerType="hardware"
        />

        {webViewLoading && (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.mapLoaderText}>Memuat peta...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pesananBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pesananBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  infoStrip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  infoText: {
    fontSize: 13,
    color: '#1D4ED8',
    textAlign: 'center',
  },
  infoBold: {
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoaderText: {
    marginTop: 12,
    fontSize: 15,
    color: '#4B5563',
  },
});

export default pemantauan;
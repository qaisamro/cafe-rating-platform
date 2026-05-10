import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { Colors } from '../components/Colors';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(true);
    try {
      const res = await api.post('/qr/scan', { qr_code: data });
      Alert.alert('🎉 نجح!', res.data.message || `حصلت على ${res.data.points || 0} نقطة!`, [
        { text: 'رائع!', onPress: () => setScanned(false) }
      ]);
    } catch (e) {
      Alert.alert('❌ خطأ', e.response?.data?.message || 'كود QR غير صالح أو منتهي', [
        { text: 'حاول مجدداً', onPress: () => setScanned(false) }
      ]);
    }
    setScanning(false);
  };

  if (!permission) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
          <Text style={styles.headerTitle}>ماسح QR 📷</Text>
        </LinearGradient>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={80} color={Colors.border} />
          <Text style={styles.permissionTitle}>نحتاج إذن الكاميرا</Text>
          <Text style={styles.permissionSub}>لمسح أكواد QR الخاصة بالمقاهي وكسب النقاط</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>السماح بالوصول للكاميرا</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <Text style={styles.headerTitle}>ماسح QR 📷</Text>
        <Text style={styles.headerSub}>وجّه الكاميرا نحو كود QR الخاص بالمقهى</Text>
      </LinearGradient>

      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.overlay}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {scanning && <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute' }} />}
          </View>
          <Text style={styles.scanHint}>{scanned ? 'جاري المعالجة...' : 'ضع كود QR داخل الإطار'}</Text>
        </View>
      </View>

      {scanned && !scanning && (
        <TouchableOpacity style={styles.resetBtn} onPress={() => setScanned(false)}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.resetBtnText}>مسح مجدداً</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  permissionContainer: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', gap: 6 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  permissionContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  permissionTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  permissionSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  permBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  permBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  scannerContainer: { flex: 1, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  frame: { width: 240, height: 240, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: '#fff', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  scanHint: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 24, textAlign: 'center' },
  resetBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14 },
  resetBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

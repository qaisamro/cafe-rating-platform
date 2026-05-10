import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../components/Colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.gradient} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={70} color="#fff" />
          </View>
          <Text style={styles.title}>كافيه كونكت</Text>
          <Text style={styles.subtitle}>اكتشف أفضل المقاهي، اكسب نقاطاً، واستمتع بمكافآت حصرية</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.secondaryBtnText}>إنشاء حساب جديد</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            {[
              { icon: 'star', text: 'قيّم وكسب نقاط' },
              { icon: 'gift', text: 'مكافآت حصرية' },
              { icon: 'qr-code', text: 'مسح QR للحضور' },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name={f.icon} size={20} color={Colors.accent} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  logoContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  buttons: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16,
    alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
  },
  primaryBtnText: { color: Colors.primary, fontSize: 17, fontWeight: '800' },
  secondaryBtn: {
    borderRadius: 18, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  secondaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  features: { flexDirection: 'row', marginTop: 48, gap: 24 },
  featureItem: { alignItems: 'center', gap: 6 },
  featureText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
});

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors } from '../components/Colors';

const SEGMENTS = ['10 نقاط', '20 نقاط', '5 نقاط', '50 نقاط', '15 نقاط', '30 نقاط', '🎁 جائزة', '25 نقاط'];
const COLORS = ['#C8763A', '#E8A838', '#9A5520', '#D4AF37', '#C8763A', '#6B3A2A', '#3D9B7A', '#E8A838'];

export default function SpinWheelScreen() {
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      const res = await api.post('/gamification/spin');
      const result = res.data;
      const totalRotation = currentRotation.current + 1440 + Math.random() * 360;
      currentRotation.current = totalRotation;
      Animated.timing(rotation, {
        toValue: totalRotation,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        setSpinning(false);
        Alert.alert('🎉 تهانينا!', result.message || `حصلت على ${result.points_awarded || 0} نقطة!`);
      });
    } catch (e) {
      setSpinning(false);
      Alert.alert('❌', e.response?.data?.message || 'حدث خطأ أثناء الدوران');
    }
  };

  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <Text style={styles.headerTitle}>دولاب الحظ 🎡</Text>
        <Text style={styles.headerSub}>أدِر الدولاب وانتظر مفاجأتك</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Pointer */}
        <View style={styles.pointer}>
          <Ionicons name="caret-down" size={32} color={Colors.danger} />
        </View>

        {/* Wheel */}
        <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
          {SEGMENTS.map((seg, i) => {
            const angle = (360 / SEGMENTS.length) * i;
            return (
              <View
                key={i}
                style={[styles.segment, { transform: [{ rotate: `${angle}deg` }], backgroundColor: COLORS[i] }]}
              >
                <Text style={styles.segText}>{seg}</Text>
              </View>
            );
          })}
        </Animated.View>

        <TouchableOpacity style={[styles.spinBtn, spinning && styles.spinBtnDisabled]} onPress={spin} disabled={spinning}>
          <LinearGradient colors={['#C8763A', '#E8A838']} style={styles.spinBtnGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
            {spinning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="refresh-circle" size={22} color="#fff" />
                <Text style={styles.spinBtnText}>أدر الدولاب!</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
          <Text style={styles.infoText}>يمكنك الدوران مرة واحدة يومياً</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', gap: 6 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  pointer: { marginBottom: -16, zIndex: 10 },
  wheel: { width: 280, height: 280, borderRadius: 140, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', borderWidth: 4, borderColor: '#fff', elevation: 12, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 20 },
  segment: { position: 'absolute', top: 0, left: 130, width: 4, height: 140, transformOrigin: 'bottom center', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 10 },
  segText: { color: '#fff', fontSize: 9, fontWeight: '800', transform: [{ rotate: '-90deg' }], width: 80, textAlign: 'center' },
  spinBtn: { borderRadius: 20, overflow: 'hidden', elevation: 6, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, width: '80%' },
  spinBtnDisabled: { opacity: 0.6 },
  spinBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  spinBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.warning + '15', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  infoText: { color: Colors.warning, fontWeight: '700', fontSize: 13 },
});

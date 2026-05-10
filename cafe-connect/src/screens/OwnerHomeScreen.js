import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function OwnerHomeScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/analytics/owner-stats');
      setStats(res.data);
    } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>مرحباً ☕</Text>
            <Text style={styles.headerTitle}>{user?.name || 'صاحب المقهى'}</Text>
          </View>
          <Ionicons name="storefront" size={38} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>إحصائيات مقهاك</Text>
        <View style={styles.grid}>
          {[
            { label: 'إجمالي التقييمات', value: stats?.totalReviews ?? 0, icon: 'star', color: Colors.warning },
            { label: 'التقييمات المعلقة', value: stats?.pendingReviews ?? 0, icon: 'time', color: Colors.accent },
            { label: 'المنتجات', value: stats?.totalProducts ?? 0, icon: 'restaurant', color: Colors.reward },
            { label: 'متوسط التقييم', value: stats?.avgRating ? parseFloat(stats.avgRating).toFixed(1) : '—', icon: 'trending-up', color: Colors.primary },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.logoutCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.logoutHint}>استخدم تبويبات أسفل الشاشة لإدارة مقهاك ومنتجاتك</Text>
        </View>

        <View style={[styles.logoutCard, { backgroundColor: Colors.danger + '10', borderColor: Colors.danger + '30' }]}>
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={[styles.logoutHint, { color: Colors.danger }]}
            onPress={() => Alert.alert('تأكيد', 'هل تريد تسجيل الخروج؟', [{ text: 'إلغاء', style: 'cancel' }, { text: 'خروج', onPress: logout, style: 'destructive' }])}>
            تسجيل الخروج
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreet: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  body: { padding: 16, gap: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  statIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statVal: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  logoutCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border },
  logoutHint: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
});

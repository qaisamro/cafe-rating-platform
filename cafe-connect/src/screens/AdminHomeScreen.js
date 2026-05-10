import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import api from '../services/api';
import { Colors, levelConfig } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function AdminHomeScreen() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await api.get('/analytics/stats'); setStats(res.data); } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const statCards = [
    { label: 'المستخدمون', value: stats?.totalUsers ?? 0, icon: 'people', color: Colors.primary },
    { label: 'أصحاب المقاهي', value: stats?.totalOwners ?? 0, icon: 'storefront', color: Colors.reward },
    { label: 'المقاهي', value: stats?.totalCafes ?? 0, icon: 'cafe', color: Colors.accent },
    { label: 'المنتجات', value: stats?.totalProducts ?? 0, icon: 'restaurant', color: Colors.secondary },
    { label: 'التقييمات', value: stats?.totalReviews ?? 0, icon: 'star', color: Colors.warning },
    { label: 'الإشعارات', value: stats?.totalNotifications ?? 0, icon: 'megaphone', color: '#7C4DFF' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}>

      <LinearGradient colors={['#1A0A00', '#3D1A0A', '#8B4513']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSub}>لوحة الإدارة 👑</Text>
            <Text style={styles.headerTitle}>كافيه كونكت</Text>
          </View>
          <View style={styles.adminIcon}>
            <Ionicons name="shield-checkmark" size={28} color="#fff" />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          <View style={styles.heroStatsRow}>
            {[
              { val: stats?.totalUsers ?? 0, label: 'مستخدم', icon: 'people', color: '#4FC3F7' },
              { val: stats?.totalCafes ?? 0, label: 'مقهى', icon: 'cafe', color: '#81C784' },
              { val: stats?.pendingModeration ?? 0, label: 'بانتظار', icon: 'time', color: '#FFB74D' },
              { val: stats?.totalPoints ?? 0, label: 'نقاط', icon: 'star', color: '#CE93D8' },
            ].map((s, i) => (
              <View key={i} style={styles.heroStat}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={styles.heroStatVal}>{s.val}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>نظرة عامة</Text>
        <View style={styles.grid}>
          {statCards.map((s, i) => (
            <View key={i} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Top Users */}
        {stats?.topUsers?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 أعلى المستخدمين نقاطاً</Text>
            {stats.topUsers.map((u, i) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              const cfg = levelConfig[u.level] || levelConfig['برونزي'];
              return (
                <View key={i} style={styles.userCard}>
                  <Text style={styles.medal}>{medals[i] || ''}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={[styles.userLevel, { color: cfg.color }]}>{cfg.emoji} عضو {u.level}</Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>{u.points} نقطة</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Level Distribution */}
        {stats?.levelDistribution?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📊 توزيع المستويات</Text>
            <View style={styles.levelsWrap}>
              {stats.levelDistribution.map((lv, i) => {
                const cfg = levelConfig[lv.level] || levelConfig['برونزي'];
                return (
                  <View key={i} style={[styles.levelChip, { backgroundColor: cfg.color + '15', borderColor: cfg.color + '50' }]}>
                    <Text>{cfg.emoji}</Text>
                    <Text style={[styles.levelChipText, { color: cfg.color }]}>{lv.level}: {lv.count}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('تأكيد', 'هل تريد تسجيل الخروج؟', [{ text: 'إلغاء', style: 'cancel' }, { text: 'خروج', onPress: logout, style: 'destructive' }])}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  adminIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  heroStatsRow: { flexDirection: 'row', gap: 10 },
  heroStat: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, minWidth: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  heroStatVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '30%', backgroundColor: '#fff', borderRadius: 18, padding: 14, alignItems: 'center', gap: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border },
  medal: { fontSize: 22 },
  userName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  userLevel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  pointsBadge: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  pointsBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  levelsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  levelChipText: { fontWeight: '700', fontSize: 13 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.danger + '15', borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.danger + '40', marginTop: 8 },
  logoutText: { color: Colors.danger, fontWeight: '800', fontSize: 15 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors, levelConfig } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function RewardsScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [r, u, s] = await Promise.all([api.get('/rewards'), api.get('/users/me'), api.get('/settings')]);
      setRewards(r.data || []); setUserData(u.data); setSettings(s.data || {});
    } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const claimReward = async (reward) => {
    if ((userData?.points || 0) < reward.points_required) {
      Alert.alert('نقاط غير كافية', `تحتاج ${reward.points_required} نقطة لاسترداد هذه المكافأة`); return;
    }
    try {
      await api.post(`/rewards/${reward.id}/claim`);
      Alert.alert('🎉 تم!', `تم استرداد "${reward.title}" بنجاح!`);
      load();
    } catch (e) {
      Alert.alert('خطأ', e.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const points = userData?.points || 0;
  const level = userData?.level || 'برونزي';
  const cfg = levelConfig[level] || levelConfig['برونزي'];
  const shekelValue = (points * parseFloat(settings.points_to_shekel_rate || 0.1)).toFixed(2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <Text style={styles.headerTitle}>مكافآتي ⭐</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{cfg.emoji}</Text>
          <Text style={styles.levelText}>عضو {level}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{points}</Text>
            <Text style={styles.statLabel}>نقطة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{shekelValue} ₪</Text>
            <Text style={styles.statLabel}>القيمة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{rewards.length}</Text>
            <Text style={styles.statLabel}>مكافأة</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Level Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>مستوى نقاطك 🏆</Text>
          <View style={styles.levelsRow}>
            {['برونزي', 'فضي', 'ذهبي', 'بلاتيني', 'ألماسي'].map((lv) => {
              const lvCfg = levelConfig[lv];
              const thresholds = { 'برونزي': 0, 'فضي': parseInt(settings.level_silver_min || 100), 'ذهبي': parseInt(settings.level_gold_min || 500), 'بلاتيني': parseInt(settings.level_platinum_min || 1000), 'ألماسي': parseInt(settings.level_diamond_min || 2500) };
              const isCurrentOrPassed = points >= thresholds[lv];
              return (
                <View key={lv} style={[styles.levelItem, level === lv && styles.activeLevelItem]}>
                  <Text style={{ fontSize: 20 }}>{lvCfg.emoji}</Text>
                  <Text style={[styles.levelName, { color: isCurrentOrPassed ? lvCfg.color : Colors.textMuted }]}>{lv}</Text>
                  <Text style={styles.levelThreshold}>{thresholds[lv]}+</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>المكافآت المتاحة 🎁</Text>
        {rewards.length === 0 ? (
          <Text style={styles.emptyText}>لا توجد مكافآت متاحة حالياً</Text>
        ) : (
          rewards.map((r) => {
            const canClaim = points >= r.points_required;
            return (
              <View key={r.id} style={styles.rewardCard}>
                <View style={styles.rewardIcon}>
                  <Ionicons name="gift" size={26} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardTitle}>{r.title}</Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>{r.description}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color={Colors.warning} />
                    <Text style={styles.rewardPoints}>{r.points_required} نقطة</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.claimBtn, !canClaim && styles.claimBtnDisabled]}
                  onPress={() => claimReward(r)} disabled={!canClaim}
                >
                  <Text style={styles.claimBtnText}>{canClaim ? 'استرداد' : 'قريباً'}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, alignItems: 'center', gap: 14 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  levelEmoji: { fontSize: 20 },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stat: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14, textAlign: 'right' },
  levelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelItem: { alignItems: 'center', gap: 4, padding: 8, borderRadius: 12 },
  activeLevelItem: { backgroundColor: Colors.primaryLight },
  levelName: { fontSize: 11, fontWeight: '700' },
  levelThreshold: { fontSize: 10, color: Colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 8 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, padding: 30 },
  rewardCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  rewardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  rewardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  rewardDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rewardPoints: { fontSize: 12, fontWeight: '700', color: Colors.warning },
  claimBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  claimBtnDisabled: { backgroundColor: Colors.border },
  claimBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});

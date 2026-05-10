import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors } from '../components/Colors';

export default function AdminModerationScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await api.get('/reviews/moderation'); setReviews(res.data || []); } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const moderate = async (id, approved) => {
    try {
      await api.put(`/reviews/${id}/moderate`, { approved });
      load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء المراجعة'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مراجعة التقييمات</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{reviews.length}</Text></View>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={70} color={Colors.border} />
              <Text style={styles.emptyText}>لا توجد تقييمات بانتظار المراجعة</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(item.user_name || 'م')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.user_name || 'مستخدم'}</Text>
                  <Text style={styles.cafeName}>{item.cafe_name}</Text>
                  {item.product_name && <Text style={styles.productName}>🍵 {item.product_name}</Text>}
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingNum}>{item.rating}</Text>
                  <Ionicons name="star" size={13} color={Colors.warning} />
                </View>
              </View>
              {item.comment ? (
                <View style={styles.commentBox}>
                  <Text style={styles.commentText}>{item.comment}</Text>
                </View>
              ) : null}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => moderate(item.id, false)}>
                  <Ionicons name="close" size={18} color={Colors.danger} />
                  <Text style={styles.rejectBtnText}>رفض</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={() => moderate(item.id, true)}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.approveBtnText}>موافقة</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  badge: { backgroundColor: Colors.warning, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.primary, fontWeight: '900', fontSize: 18 },
  userName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  cafeName: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  productName: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingNum: { fontSize: 15, fontWeight: '900', color: Colors.warning },
  commentBox: { backgroundColor: Colors.bg, borderRadius: 12, padding: 12, borderRightWidth: 3, borderRightColor: Colors.primary },
  commentText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.danger + '15', borderWidth: 1, borderColor: Colors.danger + '40' },
  rejectBtnText: { color: Colors.danger, fontWeight: '800', fontSize: 14 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.success },
  approveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

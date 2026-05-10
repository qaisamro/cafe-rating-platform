import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors, levelConfig } from '../components/Colors';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState('deduct');

  const load = async () => {
    try { const res = await api.get('/users'); setUsers(res.data || []); } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAction = (user, type) => { setSelectedUser(user); setActionType(type); setPoints(''); setReason(''); setModal(true); };

  const performAction = async () => {
    if (!points || isNaN(points)) { Alert.alert('خطأ', 'أدخل عدد نقاط صحيح'); return; }
    try {
      const endpoint = actionType === 'deduct' ? `/users/${selectedUser.id}/deduct-points` : `/users/${selectedUser.id}/add-points`;
      await api.post(endpoint, { points: parseInt(points), reason });
      Alert.alert('✅', `تم ${actionType === 'deduct' ? 'خصم' : 'إضافة'} ${points} نقطة بنجاح`);
      setModal(false); load();
    } catch (e) { Alert.alert('خطأ', e.response?.data?.message || 'حدث خطأ'); }
  };

  const syncLevels = async () => {
    try { await api.put('/users/sync-levels', {}); Alert.alert('✅', 'تم تحديث مستويات جميع المستخدمين'); load(); }
    catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء المزامنة'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        <TouchableOpacity style={styles.syncBtn} onPress={syncLevels}>
          <Ionicons name="sync" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="بحث عن مستخدم..." placeholderTextColor={Colors.textMuted} textAlign="right" />
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={<Text style={styles.empty}>لا يوجد مستخدمون</Text>}
          renderItem={({ item }) => {
            const cfg = levelConfig[item.level] || levelConfig['برونزي'];
            return (
              <View style={styles.userCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(item.name || 'م')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: cfg.color + '20' }]}>
                      <Text style={{ fontSize: 10 }}>{cfg.emoji}</Text>
                      <Text style={[styles.levelText, { color: cfg.color }]}>{item.level}</Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Ionicons name="star" size={10} color={Colors.warning} />
                      <Text style={styles.pointsText}>{item.points}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#7C4DFF20' : item.role === 'owner' ? Colors.reward + '20' : Colors.primary + '20' }]}>
                      <Text style={[styles.roleText, { color: item.role === 'admin' ? '#7C4DFF' : item.role === 'owner' ? Colors.reward : Colors.primary }]}>{item.role}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.addBtn} onPress={() => openAction(item, 'add')}>
                    <Ionicons name="add" size={16} color={Colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deductBtn} onPress={() => openAction(item, 'deduct')}>
                    <Ionicons name="remove" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{actionType === 'deduct' ? '📉 خصم نقاط' : '🎁 منح نقاط'}</Text>
            <Text style={styles.modalSub}>المستخدم: {selectedUser?.name}</Text>
            <Text style={styles.modalLabel}>عدد النقاط</Text>
            <TextInput style={styles.modalInput} value={points} onChangeText={setPoints} keyboardType="numeric" placeholder="مثال: 50" placeholderTextColor={Colors.textMuted} textAlign="right" />
            <Text style={styles.modalLabel}>السبب (اختياري)</Text>
            <TextInput style={styles.modalInput} value={reason} onChangeText={setReason} placeholder="سبب العملية..." placeholderTextColor={Colors.textMuted} textAlign="right" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}><Text style={{ color: Colors.textMuted, fontWeight: '700' }}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: actionType === 'deduct' ? Colors.danger : Colors.success }]} onPress={performAction}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{actionType === 'deduct' ? 'خصم' : 'إضافة'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  syncBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  empty: { textAlign: 'center', color: Colors.textMuted, padding: 40 },
  userCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.primary, fontWeight: '900', fontSize: 20 },
  userName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  userEmail: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  userMeta: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 10, fontWeight: '700' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning + '20', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  pointsText: { fontSize: 10, fontWeight: '700', color: Colors.warning },
  roleBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: '700' },
  actionBtns: { gap: 6 },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.success + '20', justifyContent: 'center', alignItems: 'center' },
  deductBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.danger + '15', justifyContent: 'center', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  modalSub: { color: Colors.textMuted, textAlign: 'center', marginBottom: 4 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right' },
  modalInput: { backgroundColor: Colors.bg, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: Colors.bg },
  confirmBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
});

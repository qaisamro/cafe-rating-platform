import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors, levelConfig } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '', bio: '' });

  const load = async () => {
    try {
      const [u, h, s] = await Promise.all([api.get('/users/me'), api.get('/users/points-history'), api.get('/settings')]);
      const user = u.data;
      setUserData(user); setHistory(h.data || []); setSettings(s.data || {});
      setForm({ name: user.name || '', phone: user.phone || '', city: user.city || '', bio: user.bio || '' });
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      const data = res.data;
      setUserData(data); setEditing(false);
      if (data.points_awarded) {
        Alert.alert('🎉 ملفك الشخصي مكتمل!', `حصلت على ${data.points_awarded} نقطة مكافأة!`);
      } else {
        Alert.alert('✅', 'تم حفظ الملف الشخصي');
      }
      load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
    setSaving(false);
  };

  const getCompletion = () => {
    if (!userData) return 0;
    let filled = 0;
    if (userData.name) filled++;
    if (userData.email) filled++;
    if (userData.phone) filled++;
    if (userData.city) filled++;
    if (userData.bio) filled++;
    return Math.round(filled / 5 * 100);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const level = userData?.level || 'برونزي';
  const cfg = levelConfig[level] || levelConfig['برونزي'];
  const points = userData?.points || 0;
  const shekelValue = (points * parseFloat(settings.points_to_shekel_rate || 0.1)).toFixed(2);
  const completion = getCompletion();

  const reasonLabel = (r) => {
    const map = { review_approval: '⭐ تقييم مقبول', spin_wheel: '🎡 دولاب الحظ', profile_completion: '👤 اكتمال الملف', admin_deduction: '📉 خصم إداري', admin_grant: '🎁 منحة إدارية' };
    return map[r] || r;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[Colors.primary]} />}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(userData?.name || 'م')[0].toUpperCase()}</Text>
          {userData?.profile_completed && (
            <View style={styles.completedBadge}><Ionicons name="checkmark" size={10} color="#fff" /></View>
          )}
        </View>
        <Text style={styles.userName}>{userData?.name}</Text>
        <Text style={styles.userEmail}>{userData?.email}</Text>
        <View style={[styles.levelBadge, { backgroundColor: cfg.color + '33', borderColor: cfg.color + '88', borderWidth: 1 }]}>
          <Text>{cfg.emoji}</Text>
          <Text style={[styles.levelText, { color: '#fff' }]}>عضو {level}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>{points}</Text><Text style={styles.statLabel}>نقطة</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statVal}>{shekelValue} ₪</Text><Text style={styles.statLabel}>القيمة</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statVal}>{completion}%</Text><Text style={styles.statLabel}>اكتمال</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Completion Bar */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>اكتمال الملف الشخصي</Text>
            <Text style={[styles.cardTitle, { color: Colors.primary }]}>{completion}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
          {!userData?.profile_completed && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.warning} />
              <Text style={styles.infoText}>أكمل ملفك لتحصل على {settings.profile_completion_points || 50} نقطة مجانية!</Text>
            </View>
          )}
        </View>

        {/* Profile Fields */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>معلوماتي الشخصية</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)} style={[styles.editBtn, editing && { backgroundColor: Colors.bg }]}>
              <Text style={[styles.editBtnText, editing && { color: Colors.textMuted }]}>{editing ? 'إلغاء' : 'تعديل'}</Text>
            </TouchableOpacity>
          </View>
          {editing ? (
            <View style={styles.fieldsEdit}>
              {[
                { label: 'الاسم الكامل', key: 'name', icon: 'person-outline' },
                { label: 'رقم الهاتف', key: 'phone', icon: 'call-outline', keyboard: 'phone-pad' },
                { label: 'المدينة', key: 'city', icon: 'location-outline' },
                { label: 'نبذة عني', key: 'bio', icon: 'document-text-outline', multiline: true },
              ].map((f) => (
                <View key={f.key}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name={f.icon} size={18} color={Colors.textMuted} />
                    <TextInput
                      style={[styles.input, f.multiline && { minHeight: 80 }]}
                      value={form[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })}
                      keyboardType={f.keyboard} multiline={f.multiline}
                      textAlign="right" placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>حفظ التعديلات</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldsView}>
              {[
                { label: 'الاسم', value: userData?.name, icon: 'person-outline' },
                { label: 'الهاتف', value: userData?.phone, icon: 'call-outline' },
                { label: 'المدينة', value: userData?.city, icon: 'location-outline' },
                { label: 'نبذة', value: userData?.bio, icon: 'document-text-outline' },
              ].map((f, i) => (
                <View key={i} style={styles.fieldRow}>
                  <View style={styles.fieldIcon}><Ionicons name={f.icon} size={15} color={Colors.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldKey}>{f.label}</Text>
                    <Text style={[styles.fieldVal, !f.value && { color: Colors.border }]}>{f.value || 'غير محدد'}</Text>
                  </View>
                  {f.value ? <Ionicons name="checkmark-circle" size={16} color={Colors.success} /> : <Ionicons name="radio-button-off" size={16} color={Colors.warning} />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Points History */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>سجل النقاط</Text>
            {history.map((h, i) => {
              const isPos = h.points_change > 0;
              return (
                <View key={i} style={styles.historyCard}>
                  <View style={[styles.historyIcon, { backgroundColor: isPos ? Colors.success + '20' : Colors.danger + '20' }]}>
                    <Ionicons name={isPos ? 'add' : 'remove'} size={18} color={isPos ? Colors.success : Colors.danger} />
                  </View>
                  <Text style={styles.historyReason}>{reasonLabel(h.reason)}</Text>
                  <Text style={[styles.historyPoints, { color: isPos ? Colors.success : Colors.danger }]}>{isPos ? '+' : ''}{h.points_change}</Text>
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('تأكيد الخروج', 'هل تريد تسجيل الخروج؟', [{ text: 'إلغاء', style: 'cancel' }, { text: 'خروج', onPress: logout, style: 'destructive' }])}>
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
  header: { padding: 24, paddingTop: 56, alignItems: 'center', gap: 10, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  completedBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  levelText: { fontWeight: '800', fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 4 },
  stat: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 18, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)' },
  body: { padding: 16, gap: 14, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  editBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressBg: { height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  infoText: { fontSize: 12, color: Colors.warning, fontWeight: '600', flex: 1 },
  fieldsEdit: { gap: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  fieldsView: { gap: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fieldIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  fieldKey: { fontSize: 11, color: Colors.textMuted },
  fieldVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  historyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  historyIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  historyReason: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  historyPoints: { fontSize: 16, fontWeight: '900' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.danger + '15', borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.danger + '40', marginTop: 8 },
  logoutText: { color: Colors.danger, fontWeight: '800', fontSize: 15 },
});

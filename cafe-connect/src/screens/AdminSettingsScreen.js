import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors, levelConfig } from '../components/Colors';

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await api.get('/settings'); setSettings(res.data || {}); } catch (_) {}
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      Alert.alert('✅', 'تم حفظ الإعدادات بنجاح');
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
    setSaving(false);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const sections = [
    {
      title: 'إعدادات النقاط',
      icon: 'star',
      color: Colors.warning,
      fields: [
        { key: 'review_points', label: 'نقاط التقييم', hint: 'عدد النقاط المكتسبة عند الموافقة على تقييم', icon: 'star' },
        { key: 'profile_completion_points', label: 'نقاط اكتمال الملف الشخصي', hint: 'نقاط تُمنح عند اكتمال الملف الشخصي', icon: 'person' },
        { key: 'points_to_shekel_rate', label: 'معدل تحويل النقطة للشيكل (₪)', hint: 'كم يساوي كل نقطة بالشيكل', icon: 'cash' },
      ]
    },
    {
      title: 'عتبات المستويات',
      icon: 'trophy',
      color: Colors.primary,
      fields: [
        { key: 'level_bronze_min', label: 'برونزي 🥉', hint: 'الحد الأدنى من النقاط', icon: 'trending-up' },
        { key: 'level_silver_min', label: 'فضي 🥈', hint: 'الحد الأدنى من النقاط', icon: 'trending-up' },
        { key: 'level_gold_min', label: 'ذهبي 🥇', hint: 'الحد الأدنى من النقاط', icon: 'trending-up' },
        { key: 'level_platinum_min', label: 'بلاتيني 💎', hint: 'الحد الأدنى من النقاط', icon: 'trending-up' },
        { key: 'level_diamond_min', label: 'ألماسي 💠', hint: 'الحد الأدنى من النقاط', icon: 'trending-up' },
      ]
    },
  ];

  // Preview conversion
  const rate = parseFloat(settings.points_to_shekel_rate || 0.1);
  const previewPoints = [100, 500, 1000, 2500];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات ⚙️</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 60 }}>
        {sections.map((sec) => (
          <View key={sec.title} style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: sec.color + '20' }]}>
                <Ionicons name={sec.icon} size={18} color={sec.color} />
              </View>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            {sec.fields.map((f) => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <Text style={styles.fieldHint}>{f.hint}</Text>
                <View style={styles.inputRow}>
                  <Ionicons name={f.icon} size={16} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={String(settings[f.key] ?? '')}
                    onChangeText={v => setSettings({ ...settings, [f.key]: v })}
                    keyboardType="decimal-pad"
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Conversion Preview */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.reward + '20' }]}>
              <Ionicons name="cash" size={18} color={Colors.reward} />
            </View>
            <Text style={styles.sectionTitle}>معاينة التحويل</Text>
          </View>
          <View style={styles.previewGrid}>
            {previewPoints.map(pts => (
              <View key={pts} style={styles.previewItem}>
                <View style={styles.previewPoints}>
                  <Ionicons name="star" size={12} color={Colors.warning} />
                  <Text style={styles.previewPtsText}>{pts} نقطة</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                <Text style={styles.previewShikel}>{(pts * rate).toFixed(2)} ₪</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>حفظ الإعدادات</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, textAlign: 'right' },
  fieldHint: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  previewGrid: { gap: 10 },
  previewItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bg, borderRadius: 12, padding: 12 },
  previewPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewPtsText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  previewShikel: { fontSize: 15, fontWeight: '900', color: Colors.reward },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10, marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

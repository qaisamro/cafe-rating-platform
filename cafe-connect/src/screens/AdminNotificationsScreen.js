import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors } from '../components/Colors';

export default function AdminNotificationsScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [type, setType] = useState('message');
  const [targetType, setTargetType] = useState('all');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('send');

  const load = async () => {
    try {
      const [n, u] = await Promise.all([api.get('/notifications'), api.get('/users')]);
      setNotifications(n.data || []); setUsers(u.data || []);
    } catch (_) {}
    setLoadingNotifs(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!title) { Alert.alert('خطأ', 'العنوان مطلوب'); return; }
    setSending(true);
    try {
      await api.post('/notifications', {
        title, message, media_url: mediaUrl, type,
        target_type: targetType,
        ...(targetType === 'individual' && selectedUserId ? { target_user_id: selectedUserId } : {}),
      });
      Alert.alert('✅', 'تم إرسال الإشعار بنجاح');
      setTitle(''); setMessage(''); setMediaUrl(''); setType('message');
      setTargetType('all'); setSelectedUserId(null);
      setTab('history'); load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء الإرسال'); }
    setSending(false);
  };

  const TYPES = [
    { key: 'message', label: 'رسالة', icon: 'chatbubble' },
    { key: 'image', label: 'صورة', icon: 'image' },
    { key: 'video', label: 'فيديو', icon: 'videocam' },
    { key: 'link', label: 'رابط', icon: 'link' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة الإشعارات 📢</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'send' && styles.activeTab]} onPress={() => setTab('send')}>
          <Text style={[styles.tabText, tab === 'send' && styles.activeTabText]}>إرسال إشعار</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.activeTab]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.activeTabText]}>السجل ({notifications.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'send' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
          <Text style={styles.label}>نوع الإشعار</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity key={t.key} style={[styles.typeChip, type === t.key && styles.activeTypeChip]} onPress={() => setType(t.key)}>
                <Ionicons name={t.icon} size={16} color={type === t.key ? '#fff' : Colors.textMuted} />
                <Text style={[styles.typeText, type === t.key && styles.activeTypeText]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>المستهدف</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity style={[styles.typeChip, targetType === 'all' && styles.activeTypeChip]} onPress={() => setTargetType('all')}>
              <Ionicons name="people" size={16} color={targetType === 'all' ? '#fff' : Colors.textMuted} />
              <Text style={[styles.typeText, targetType === 'all' && styles.activeTypeText]}>الكل</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeChip, targetType === 'individual' && styles.activeTypeChip]} onPress={() => setTargetType('individual')}>
              <Ionicons name="person" size={16} color={targetType === 'individual' ? '#fff' : Colors.textMuted} />
              <Text style={[styles.typeText, targetType === 'individual' && styles.activeTypeText]}>مستخدم بعينه</Text>
            </TouchableOpacity>
          </View>

          {targetType === 'individual' && (
            <>
              <Text style={styles.label}>اختر المستخدم</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {users.filter(u => u.role === 'user').map(u => (
                  <TouchableOpacity key={u.id} style={[styles.userChip, selectedUserId === u.id && styles.activeUserChip]} onPress={() => setSelectedUserId(u.id)}>
                    <Text style={[styles.userChipText, selectedUserId === u.id && styles.activeUserChipText]}>{u.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>العنوان *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="عنوان الإشعار" placeholderTextColor={Colors.textMuted} textAlign="right" />

          <Text style={styles.label}>الرسالة</Text>
          <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} value={message} onChangeText={setMessage} placeholder="نص الإشعار..." multiline placeholderTextColor={Colors.textMuted} textAlign="right" />

          {(type === 'image' || type === 'video' || type === 'link') && (
            <>
              <Text style={styles.label}>{type === 'image' ? 'رابط الصورة' : type === 'video' ? 'رابط الفيديو' : 'الرابط'}</Text>
              <TextInput style={styles.input} value={mediaUrl} onChangeText={setMediaUrl} placeholder="https://..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" keyboardType="url" textAlign="left" />
            </>
          )}

          <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendBtnText}>إرسال الإشعار</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={<Text style={styles.empty}>لا توجد إشعارات مرسلة</Text>}
          renderItem={({ item }) => (
            <View style={styles.notifCard}>
              <View style={styles.notifTop}>
                <Ionicons name={item.type === 'image' ? 'image' : item.type === 'video' ? 'videocam' : item.type === 'link' ? 'link' : 'megaphone'} size={18} color={Colors.primary} />
                <Text style={styles.notifTitle}>{item.title}</Text>
                <View style={styles.targetBadge}>
                  <Text style={styles.targetBadgeText}>{item.target_type === 'all' ? 'للجميع' : 'فردي'}</Text>
                </View>
              </View>
              {item.message ? <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text> : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontWeight: '700', color: Colors.textMuted, fontSize: 13 },
  activeTabText: { color: '#fff' },
  form: { paddingHorizontal: 16, paddingBottom: 60, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right', marginTop: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border },
  activeTypeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  activeTypeText: { color: '#fff' },
  userChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  activeUserChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  userChipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  activeUserChipText: { color: '#fff' },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, elevation: 4, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  empty: { textAlign: 'center', color: Colors.textMuted, padding: 40 },
  notifCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 6, borderWidth: 1, borderColor: Colors.border },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: Colors.textPrimary, textAlign: 'right' },
  targetBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  targetBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  notifMsg: { fontSize: 12, color: Colors.textMuted, textAlign: 'right' },
});

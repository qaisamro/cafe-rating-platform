import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Linking, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Colors } from '../components/Colors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data || []);
      await api.put('/notifications/read-all', {});
    } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const typeData = (type) => {
    const map = {
      image: { icon: 'image', color: '#4CAF50', label: 'صورة' },
      video: { icon: 'videocam', color: '#E91E63', label: 'فيديو' },
      link: { icon: 'link', color: '#2196F3', label: 'رابط' },
    };
    return map[type] || { icon: 'megaphone', color: Colors.primary, label: 'رسالة' };
  };

  const renderItem = ({ item }) => {
    const td = typeData(item.type);
    const isRead = item.is_read;
    return (
      <View style={[styles.card, !isRead && styles.unreadCard]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: isRead ? Colors.bg : Colors.primary }]}>
            <Ionicons name={td.icon} size={20} color={isRead ? Colors.textMuted : '#fff'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: td.color + '20' }]}>
                <Text style={[styles.badgeText, { color: td.color }]}>{td.label}</Text>
              </View>
              {!isRead && <View style={styles.unreadDot} />}
            </View>
          </View>
        </View>
        {item.message ? (
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>{item.message}</Text>
          </View>
        ) : null}
        {item.media_url ? (
          item.type === 'image' ? (
            <Image source={{ uri: item.media_url }} style={styles.mediaImg} resizeMode="cover" />
          ) : (
            <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(item.media_url)}>
              <Ionicons name={item.type === 'video' ? 'play-circle' : 'open-outline'} size={18} color={Colors.primary} />
              <Text style={styles.linkText} numberOfLines={1}>{item.media_url}</Text>
            </TouchableOpacity>
          )
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإشعارات 🔔</Text>
        <Text style={styles.headerSub}>{notifications.length} إشعار</Text>
      </LinearGradient>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={70} color={Colors.border} />
              <Text style={styles.emptyText}>لا توجد إشعارات</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', gap: 4 },
  back: { position: 'absolute', top: 55, left: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  unreadCard: { borderColor: Colors.primary + '60', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, textAlign: 'right' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  msgBox: { backgroundColor: Colors.bg, borderRadius: 12, padding: 12, borderRightWidth: 3, borderRightColor: Colors.primary },
  msgText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, textAlign: 'right' },
  mediaImg: { width: '100%', height: 180, borderRadius: 12, marginTop: 8 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 10, marginTop: 8 },
  linkText: { flex: 1, color: Colors.primary, fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: Colors.textMuted },
});

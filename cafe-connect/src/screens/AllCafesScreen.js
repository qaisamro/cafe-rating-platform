import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';

export default function AllCafesScreen() {
  const navigation = useNavigation();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/cafes');
      setCafes(res.data || []);
    } catch (_) {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>جميع المقاهي</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={cafes}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={<Text style={styles.empty}>لا توجد مقاهي حالياً</Text>}
          renderItem={({ item }) => {
            const img = imgUrl(item.image_url);
            const rating = parseFloat(item.avg_rating || item.average_rating || 0);
            return (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })}>
                {img ? (
                  <Image source={{ uri: img }} style={styles.cardImg} />
                ) : (
                  <View style={[styles.cardImg, styles.placeholder]}>
                    <Ionicons name="cafe" size={40} color={Colors.primary} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cafeName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingNum}>{rating > 0 ? rating.toFixed(1) : 'جديد'}</Text>
                      <Ionicons name="star" size={13} color={Colors.warning} />
                    </View>
                  </View>
                  <View style={styles.addrRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.addrText} numberOfLines={1}>{item.address || 'العنوان غير محدد'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: Colors.textMuted, padding: 40, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12 },
  cardImg: { width: '100%', height: 160 },
  placeholder: { backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cafeName: { flex: 1, fontSize: 17, fontWeight: '900', color: Colors.textPrimary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.warning + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingNum: { fontSize: 13, fontWeight: '800', color: Colors.warning },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addrText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
});

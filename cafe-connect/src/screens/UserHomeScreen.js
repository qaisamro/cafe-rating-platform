import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, RefreshControl, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function UserHomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([api.get('/cafes/top-rated'), api.get('/products')]);
      setCafes(c.data || []);
      setProducts(p.data || []);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const CafeCard = ({ item }) => {
    const img = imgUrl(item.image_url);
    const rating = parseFloat(item.avg_rating || item.average_rating || 0);
    return (
      <TouchableOpacity style={styles.cafeCard} onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })}>
        {img ? (
          <Image source={{ uri: img }} style={styles.cafeImg} />
        ) : (
          <View style={[styles.cafeImg, styles.cafeImgPlaceholder]}>
            <Ionicons name="cafe" size={36} color={Colors.primary} />
          </View>
        )}
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Colors.warning} />
            <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'جديد'}</Text>
            {item.review_count > 0 && <Text style={styles.reviewCount}>({item.review_count})</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
      >
        {/* Hero Header */}
        <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreet}>أهلاً بك ✨</Text>
              <Text style={styles.headerTitle}>اكتشف أفضل المقاهي</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={styles.searchPlaceholder}>ابحث عن مقهى أو منتج...</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.body}>
          {/* Top Rated Cafes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المقاهي الأكثر تقييماً ⭐</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllCafes')}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {cafes.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد مقاهي حالياً</Text>
          ) : (
            <FlatList
              data={cafes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => <CafeCard item={item} />}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            />
          )}

          {/* Products */}
          <Text style={[styles.sectionTitle, { marginTop: 28, marginHorizontal: 20 }]}>اكتشف المنيو 🍽️</Text>
          <View style={styles.productsList}>
            {products.map((p) => {
              const img = imgUrl(p.image_url);
              return (
                <TouchableOpacity key={p.id} style={styles.productCard} onPress={() => navigation.navigate('CafeDetail', { cafeId: p.cafe_id })}>
                  {img ? (
                    <Image source={{ uri: img }} style={styles.productImg} />
                  ) : (
                    <View style={[styles.productImg, styles.cafeImgPlaceholder]}>
                      <Ionicons name="cafe-outline" size={24} color={Colors.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={11} color={Colors.warning} />
                      <Text style={styles.pointsText}>{p.points_reward || 10} نقطة عند التقييم</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-back" size={16} color={Colors.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerGreet: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  searchPlaceholder: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  body: { paddingTop: 24, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  seeAll: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, padding: 20 },
  cafeCard: { width: 175, backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  cafeImg: { width: '100%', height: 118 },
  cafeImgPlaceholder: { backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cafeInfo: { padding: 12 },
  cafeName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  reviewCount: { fontSize: 11, color: Colors.textMuted },
  productsList: { paddingHorizontal: 20, gap: 12, marginTop: 14 },
  productCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  productImg: { width: 58, height: 58, borderRadius: 14 },
  productName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  pointsText: { fontSize: 11, color: Colors.textMuted },
});

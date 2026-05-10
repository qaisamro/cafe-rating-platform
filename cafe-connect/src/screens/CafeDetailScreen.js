import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';
import { useAuth } from '../context/AuthContext';

export default function CafeDetailScreen({ route, navigation }) {
  const { cafeId } = route.params;
  const { user } = useAuth();
  const [cafe, setCafe] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('menu');
  const [category, setCategory] = useState('الكل');
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [cafeId]);

  const load = async () => {
    try {
      const [c, p, r, s] = await Promise.all([
        api.get(`/cafes/${cafeId}`),
        api.get(`/products/cafe/${cafeId}`),
        api.get(`/reviews/cafe/${cafeId}`),
        api.get('/settings'),
      ]);
      setCafe(c.data); setProducts(p.data || []); setReviews(r.data || []); setSettings(s.data || {});
    } catch (_) {}
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user) { Alert.alert('تسجيل الدخول', 'يجب تسجيل الدخول لإضافة تقييم'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { cafe_id: cafeId, rating, comment, ...(selectedProduct ? { product_id: selectedProduct.id } : {}) });
      Alert.alert('✅ شكراً!', `تم إرسال تقييمك! ستحصل على ${settings.review_points || 10} نقاط عند الموافقة`);
      setReviewModal(false); setComment(''); setRating(5); setSelectedProduct(null);
      load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التقييم'); }
    setSubmitting(false);
  };

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!cafe) return <View style={styles.loadingCenter}><Text>المقهى غير موجود</Text></View>;

  const img = imgUrl(cafe.image_url);
  const avgRating = parseFloat(cafe.avg_rating || cafe.average_rating || 0);
  const categories = ['الكل', ...new Set(products.map(p => p.category || 'عام'))];
  const filtered = category === 'الكل' ? products : products.filter(p => (p.category || 'عام') === category);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {img ? (
            <Image source={{ uri: img }} style={styles.heroImg} />
          ) : (
            <LinearGradient colors={['#C8763A', '#E8A838']} style={styles.heroImg}>
              <Ionicons name="cafe" size={60} color="#fff" />
            </LinearGradient>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.cafeName}>{cafe.name}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Ionicons key={i} name={i <= Math.round(avgRating) ? 'star' : 'star-outline'} size={16} color={Colors.warning} />
            ))}
            <Text style={styles.ratingNum}>{avgRating > 0 ? avgRating.toFixed(1) : 'لا يوجد تقييم'}</Text>
            {cafe.review_count > 0 && <Text style={styles.reviewCount}>({cafe.review_count} تقييم)</Text>}
          </View>
          {cafe.address && (
            <View style={[styles.ratingRow, { marginTop: 8 }]}>
              <Ionicons name="location-outline" size={15} color={Colors.accent} />
              <Text style={styles.address}>{cafe.address}</Text>
            </View>
          )}
          {cafe.description && <Text style={styles.desc}>{cafe.description}</Text>}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'menu' && styles.activeTab]} onPress={() => setTab('menu')}>
            <Text style={[styles.tabText, tab === 'menu' && styles.activeTabText]}>القائمة ({products.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'reviews' && styles.activeTab]} onPress={() => setTab('reviews')}>
            <Text style={[styles.tabText, tab === 'reviews' && styles.activeTabText]}>التقييمات ({reviews.length})</Text>
          </TouchableOpacity>
        </View>

        {tab === 'menu' ? (
          <View style={styles.tabContent}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map(cat => (
                <TouchableOpacity key={cat} style={[styles.catChip, category === cat && styles.activeCatChip]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {filtered.map(p => {
              const pImg = imgUrl(p.image_url);
              return (
                <View key={p.id} style={styles.productCard}>
                  {pImg ? <Image source={{ uri: pImg }} style={styles.productImg} /> : <View style={[styles.productImg, { backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}><Ionicons name="cafe" size={24} color={Colors.primary} /></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={11} color={Colors.warning} />
                      <Text style={styles.pointsText}>{p.points_reward || 10} نقطة</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {reviews.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد تقييمات بعد</Text>
            ) : reviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(r.user_name || 'م')[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUser}>{r.user_name || 'مستخدم'}</Text>
                    {r.product_name && <Text style={styles.reviewProduct}>🍵 {r.product_name}</Text>}
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.reviewRating}>{r.rating}</Text>
                    <Ionicons name="star" size={14} color={Colors.warning} />
                  </View>
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Review FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => user ? setReviewModal(true) : Alert.alert('تسجيل الدخول', 'يجب تسجيل الدخول لإضافة تقييم')}>
        <LinearGradient colors={['#C8763A', '#E8A838']} style={styles.fabGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
          <Ionicons name="star" size={20} color="#fff" />
          <Text style={styles.fabText}>قيّم واكسب {settings.review_points || 10} نقاط</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>قيّم تجربتك ⭐</Text>
            <Text style={styles.modalSub}>كم تقيّم {cafe.name}؟</Text>
            <View style={styles.starRow}>
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                  <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={38} color={Colors.warning} />
                </TouchableOpacity>
              ))}
            </View>
            {products.length > 0 && (
              <>
                <Text style={styles.modalLabel}>منتج معين (اختياري)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <TouchableOpacity style={[styles.prodChip, !selectedProduct && styles.activeProdChip]} onPress={() => setSelectedProduct(null)}>
                    <Text style={[styles.prodChipText, !selectedProduct && styles.activeProdChipText]}>المقهى عموماً</Text>
                  </TouchableOpacity>
                  {products.map(p => (
                    <TouchableOpacity key={p.id} style={[styles.prodChip, selectedProduct?.id === p.id && styles.activeProdChip]} onPress={() => setSelectedProduct(p)}>
                      <Text style={[styles.prodChipText, selectedProduct?.id === p.id && styles.activeProdChipText]}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <TextInput
              style={styles.commentInput} value={comment} onChangeText={setComment}
              placeholder="اكتب تجربتك بكل صدق..." multiline numberOfLines={4}
              placeholderTextColor={Colors.textMuted} textAlign="right"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewModal(false)}>
                <Text style={{ color: Colors.textMuted, fontWeight: '700' }}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>إرسال التقييم</Text>}
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
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  heroContainer: { height: 280, position: 'relative', justifyContent: 'flex-end' },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  cafeName: { color: '#fff', fontSize: 26, fontWeight: '900', padding: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  infoCard: { margin: 16, padding: 18, backgroundColor: '#fff', borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: 14, fontWeight: '800', color: Colors.warning, marginLeft: 4 },
  reviewCount: { fontSize: 12, color: Colors.textMuted },
  address: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  desc: { marginTop: 12, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontWeight: '700', color: Colors.textMuted },
  activeTabText: { color: '#fff' },
  tabContent: { padding: 16, gap: 12 },
  catScroll: { marginBottom: 12 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  activeCatChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  activeCatText: { color: '#fff' },
  productCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border },
  productImg: { width: 58, height: 58, borderRadius: 14 },
  productName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  pointsText: { fontSize: 11, color: Colors.textMuted },
  emptyText: { textAlign: 'center', color: Colors.textMuted, padding: 30, fontSize: 15 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.primary, fontWeight: '900', fontSize: 18 },
  reviewUser: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  reviewProduct: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  reviewRating: { fontSize: 15, fontWeight: '900', color: Colors.textPrimary },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, backgroundColor: Colors.bg, borderRadius: 10, padding: 10, borderRightWidth: 3, borderRightColor: Colors.primary },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16, borderRadius: 18, overflow: 'hidden', elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 12 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  fabText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  modalSub: { color: Colors.textMuted, textAlign: 'center', marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right', marginBottom: 8 },
  prodChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  activeProdChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  prodChipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  activeProdChipText: { color: '#fff' },
  commentInput: { backgroundColor: Colors.bg, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textPrimary, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: Colors.bg },
  submitBtn: { flex: 2, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: Colors.primary },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';

export default function ManageProductsScreen() {
  const [products, setProducts] = useState([]);
  const [cafeId, setCafeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', points_reward: '10', image_url: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const cafe = await api.get('/cafes/mine');
      if (cafe.data?.id) {
        setCafeId(cafe.data.id);
        const p = await api.get(`/products/cafe/${cafe.data.id}`);
        setProducts(p.data || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', category: '', points_reward: '10', image_url: '' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category || '', points_reward: String(p.points_reward || 10), image_url: p.image_url || '' }); setModal(true); };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', { uri: result.assets[0].uri, name: 'image.jpg', type: 'image/jpeg' });
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setForm(f => ({ ...f, image_url: imgUrl(res.data.url) }));
      } catch (_) { Alert.alert('خطأ', 'فشل رفع الصورة'); }
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name) { Alert.alert('خطأ', 'اسم المنتج مطلوب'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, { ...form, cafe_id: cafeId, points_reward: parseInt(form.points_reward) || 10 });
      } else {
        await api.post('/products', { ...form, cafe_id: cafeId, points_reward: parseInt(form.points_reward) || 10 });
      }
      setModal(false); load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
    setSaving(false);
  };

  const deleteProduct = (id) => {
    Alert.alert('حذف المنتج', 'هل أنت متأكد من الحذف؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { await api.delete(`/products/${id}`); load(); } },
    ]);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المنتجات 🍽️</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(i) => String(i.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={60} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد منتجات بعد</Text>
            <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
              <Text style={styles.addFirstBtnText}>أضف أول منتج</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const img = imgUrl(item.image_url);
          return (
            <View style={styles.productCard}>
              {img ? <Image source={{ uri: img }} style={styles.productImg} /> : <View style={[styles.productImg, styles.placeholder]}><Ionicons name="cafe" size={24} color={Colors.primary} /></View>}
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCat}>{item.category || 'عام'}</Text>
                <View style={styles.pointsRow}>
                  <Ionicons name="star" size={11} color={Colors.warning} />
                  <Text style={styles.pointsText}>{item.points_reward || 10} نقطة</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="pencil" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(item.id)}>
                  <Ionicons name="trash" size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {uploading ? <ActivityIndicator color={Colors.primary} /> : form.image_url ? (
                <Image source={{ uri: form.image_url }} style={styles.pickedImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                  <Text style={styles.imagePickerText}>إضافة صورة</Text>
                </>
              )}
            </TouchableOpacity>

            {[
              { label: 'اسم المنتج *', key: 'name', placeholder: 'مثال: قهوة عربية' },
              { label: 'التصنيف', key: 'category', placeholder: 'مثال: مشروبات ساخنة' },
              { label: 'نقاط المكافأة', key: 'points_reward', placeholder: '10', keyboard: 'numeric' },
            ].map((f) => (
              <View key={f.key}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput} value={form[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })}
                  placeholder={f.placeholder} keyboardType={f.keyboard}
                  placeholderTextColor={Colors.textMuted} textAlign="right"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'حفظ التعديلات' : 'إضافة المنتج'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  addFirstBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  addFirstBtnText: { color: '#fff', fontWeight: '800' },
  productCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  productImg: { width: 60, height: 60, borderRadius: 14 },
  placeholder: { backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  productCat: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  pointsText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  actions: { gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.danger + '15', justifyContent: 'center', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, gap: 12, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  imagePicker: { height: 100, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', gap: 6, overflow: 'hidden' },
  pickedImage: { width: '100%', height: '100%' },
  imagePickerText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right' },
  modalInput: { backgroundColor: Colors.bg, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

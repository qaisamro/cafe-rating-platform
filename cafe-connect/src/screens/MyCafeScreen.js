import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';

export default function MyCafeScreen() {
  const [cafe, setCafe] = useState(null);
  const [cafeId, setCafeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', description: '', image_url: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/cafes/mine');
      if (res.data) {
        setCafe(res.data); setCafeId(res.data.id);
        setForm({ name: res.data.name || '', address: res.data.address || '', description: res.data.description || '', image_url: res.data.image_url || '' });
      }
    } catch (_) {}
    setLoading(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('خطأ', 'نحتاج إذن الوصول للصور'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const formData = new FormData();
        const asset = result.assets[0];
        formData.append('image', { uri: asset.uri, name: 'image.jpg', type: 'image/jpeg' });
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setForm(f => ({ ...f, image_url: imgUrl(res.data.url) }));
      } catch (_) { Alert.alert('خطأ', 'فشل رفع الصورة'); }
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name) { Alert.alert('خطأ', 'اسم المقهى مطلوب'); return; }
    setSaving(true);
    try {
      if (cafeId) {
        await api.put(`/cafes/${cafeId}`, form);
      } else {
        const res = await api.post('/cafes', form);
        setCafeId(res.data.id);
      }
      Alert.alert('✅', 'تم حفظ بيانات المقهى بنجاح');
      load();
    } catch (_) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
    setSaving(false);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const img = imgUrl(form.image_url);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مقهاي ☕</Text>
        <Text style={styles.headerSub}>{cafeId ? 'تعديل بيانات المقهى' : 'أنشئ مقهاك الآن'}</Text>
      </View>

      <View style={styles.body}>
        {/* Image */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {uploading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : img ? (
            <Image source={{ uri: img }} style={styles.cafeImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color={Colors.primary} />
              <Text style={styles.imagePlaceholderText}>اضغط لإضافة صورة</Text>
            </View>
          )}
          <View style={styles.imageEditBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Fields */}
        {[
          { label: 'اسم المقهى *', key: 'name', placeholder: 'مثال: كافيه العرب', icon: 'cafe-outline' },
          { label: 'العنوان', key: 'address', placeholder: 'الرياض، حي النزهة', icon: 'location-outline' },
          { label: 'الوصف', key: 'description', placeholder: 'اكتب وصفاً جذاباً لمقهاك...', icon: 'document-text-outline', multiline: true },
        ].map((f) => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>
            <View style={[styles.inputRow, f.multiline && { alignItems: 'flex-start' }]}>
              <Ionicons name={f.icon} size={18} color={Colors.textMuted} style={f.multiline ? { marginTop: 4 } : {}} />
              <TextInput
                style={[styles.input, f.multiline && { minHeight: 100, textAlignVertical: 'top' }]}
                value={form[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })}
                placeholder={f.placeholder} multiline={f.multiline}
                placeholderTextColor={Colors.textMuted} textAlign="right"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{cafeId ? 'حفظ التعديلات' : 'إنشاء المقهى'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { backgroundColor: Colors.primary, padding: 24, paddingTop: 56, alignItems: 'center', gap: 4, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  body: { padding: 20, gap: 16 },
  imagePicker: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.primaryLight, position: 'relative' },
  cafeImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePlaceholderText: { color: Colors.primary, fontWeight: '700' },
  imageEditBtn: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textAlign: 'right', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, elevation: 4, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

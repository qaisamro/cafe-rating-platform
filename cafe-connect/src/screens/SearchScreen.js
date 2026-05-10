import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api, { imgUrl } from '../services/api';
import { Colors } from '../components/Colors';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [cafes, setCafes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([api.get('/cafes'), api.get('/products')]);
        setCafes(c.data || []); setProducts(p.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const q = query.trim().toLowerCase();
  const filteredCafes = q ? cafes.filter(c => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)) : [];
  const filteredProducts = q ? products.filter(p => (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input} value={query} onChangeText={setQuery}
            placeholder="ابحث عن مقهى أو منتج..." autoFocus
            placeholderTextColor={Colors.textMuted} textAlign="right"
          />
          {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={Colors.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : !q ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={70} color={Colors.border} />
          <Text style={styles.hintText}>اكتب شيئاً للبحث...</Text>
        </View>
      ) : filteredCafes.length === 0 && filteredProducts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.hintText}>لا يوجد نتائج مطابقة</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(filteredCafes.length > 0 ? [{ type: 'header', title: `المقاهي (${filteredCafes.length})` }, ...filteredCafes.map(c => ({ ...c, _type: 'cafe' }))] : []),
            ...(filteredProducts.length > 0 ? [{ type: 'header', title: `المنتجات (${filteredProducts.length})` }, ...filteredProducts.map(p => ({ ...p, _type: 'product' }))] : []),
          ]}
          keyExtractor={(item, i) => item.type === 'header' ? `h${i}` : `${item._type}-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
          renderItem={({ item }) => {
            if (item.type === 'header') return <Text style={styles.sectionTitle}>{item.title}</Text>;
            const img = imgUrl(item.image_url);
            return (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => navigation.navigate('CafeDetail', { cafeId: item._type === 'product' ? item.cafe_id : item.id })}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.resultImg} />
                ) : (
                  <View style={[styles.resultImg, styles.placeholder]}>
                    <Ionicons name={item._type === 'cafe' ? 'cafe' : 'local-cafe'} size={22} color={Colors.primary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSub}>{item._type === 'cafe' ? (item.address || '') : (item.category || 'عام')}</Text>
                </View>
                <Ionicons name="chevron-back" size={16} color={Colors.primary} />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  hintText: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  resultItem: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  resultImg: { width: 50, height: 50, borderRadius: 12 },
  placeholder: { backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  resultName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  resultSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../components/Colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();

  const handle = async () => {
    if (!name || !email || !password) { Alert.alert('خطأ', 'يرجى ملء جميع الحقول'); return; }
    if (password.length < 6) { Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('خطأ', e.response?.data?.message || 'حدث خطأ، حاول مجدداً');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2C1810', '#6B3A2A', '#C8763A']} style={styles.header} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="person-add" size={50} color="#fff" />
        <Text style={styles.headerTitle}>انضم إلينا 🎉</Text>
        <Text style={styles.headerSub}>أنشئ حسابك وابدأ رحلة القهوة</Text>
      </LinearGradient>

      <View style={styles.form}>
        {[
          { label: 'الاسم الكامل', value: name, set: setName, placeholder: 'اسمك الكريم', icon: 'person-outline' },
          { label: 'البريد الإلكتروني', value: email, set: setEmail, placeholder: 'example@email.com', icon: 'mail-outline', keyboard: 'email-address' },
          { label: 'كلمة المرور', value: password, set: setPassword, placeholder: '••••••••', icon: 'lock-closed-outline', secure: true },
        ].map((f, i) => (
          <View key={i}>
            <Text style={styles.label}>{f.label}</Text>
            <View style={styles.inputRow}>
              <Ionicons name={f.icon} size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input} value={f.value} onChangeText={f.set}
                placeholder={f.placeholder} secureTextEntry={f.secure}
                keyboardType={f.keyboard} autoCapitalize="none"
                placeholderTextColor={Colors.textMuted} textAlign="right"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={handle} disabled={loading}>
          <LinearGradient colors={['#C8763A', '#E8A838']} style={styles.btnGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>إنشاء الحساب</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
          <Text style={styles.switchText}>لديك حساب بالفعل؟ <Text style={{ color: Colors.primary, fontWeight: '800' }}>سجّل الدخول</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 40, paddingTop: 60, alignItems: 'center', gap: 8, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  back: { position: 'absolute', top: 55, left: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 12 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  form: { padding: 24, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginTop: 14, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, marginTop: 6,
  },
  inputIcon: { marginLeft: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  btn: { borderRadius: 18, overflow: 'hidden', marginTop: 24, elevation: 4, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 8 },
  btnGrad: { paddingVertical: 17, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  switchLink: { alignItems: 'center', marginTop: 16 },
  switchText: { fontSize: 14, color: Colors.textMuted },
});

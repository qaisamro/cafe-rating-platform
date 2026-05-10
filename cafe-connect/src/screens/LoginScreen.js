import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../components/Colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('خطأ', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
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
        <Ionicons name="cafe" size={50} color="#fff" />
        <Text style={styles.headerTitle}>أهلاً بعودتك ☕</Text>
        <Text style={styles.headerSub}>سجّل دخولك لتستمتع بكافيه كونكت</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input} value={email} onChangeText={setEmail}
            placeholder="example@email.com" keyboardType="email-address"
            autoCapitalize="none" placeholderTextColor={Colors.textMuted}
            textAlign="right"
          />
        </View>

        <Text style={styles.label}>كلمة المرور</Text>
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} style={styles.inputIcon} />
          </TouchableOpacity>
          <TextInput
            style={styles.input} value={password} onChangeText={setPassword}
            placeholder="••••••••" secureTextEntry={!showPass}
            placeholderTextColor={Colors.textMuted} textAlign="right"
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#C8763A', '#E8A838']} style={styles.btnGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تسجيل الدخول</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchLink}>
          <Text style={styles.switchText}>ليس لديك حساب؟ <Text style={{ color: Colors.primary, fontWeight: '800' }}>أنشئ حساباً الآن</Text></Text>
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
  form: { padding: 24, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginTop: 12, textAlign: 'right' },
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

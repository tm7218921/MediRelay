import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params; // 'sender' or 'receiver'
  const isSender = role === 'sender';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCred.user.uid;

      // Verify role matches
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const savedRole = userDoc.data().role;
        if (savedRole !== role) {
          Alert.alert(
            'Wrong Role',
            `This account is registered as a "${savedRole}". Please select the correct role on the previous screen.`
          );
          await signOut(auth);
          setLoading(false);
          return;
        }
      }
      // Auth state change in App.js will handle navigation automatically
    } catch (e) {
      let msg = 'Login failed. Please check your credentials.';
      if (e.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (e.code === 'auth/wrong-password') msg = 'Incorrect password.';
      if (e.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (e.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      Alert.alert('Login Failed', msg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={[styles.roleBanner, { backgroundColor: isSender ? '#C0392B' : '#2980B9' }]}>
          <Text style={styles.roleEmoji}>{isSender ? '👨‍⚕️' : '🏨'}</Text>
          <Text style={styles.roleName}>{isSender ? 'Doctor / Nurse Login' : 'Receiver Login'}</Text>
          <Text style={styles.roleHint}>{isSender ? 'Sender Portal' : 'Receiving Hospital Portal'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email / Hospital Email</Text>
          <TextInput
            style={styles.input}
            placeholder="doctor@hospital.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.label}>Password / PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: isSender ? '#C0392B' : '#2980B9' }, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.loginBtnText}>LOGIN →</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New user?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => navigation.navigate('Signup', { role })}
          >
            <Text style={[styles.signupBtnText, { color: isSender ? '#C0392B' : '#2980B9' }]}>
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Change Role</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingBottom: 40 },
  roleBanner: { padding: 30, alignItems: 'center' },
  roleEmoji: { fontSize: 48, marginBottom: 8 },
  roleName: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  roleHint: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  form: { padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#7F8C8D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: 52, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D5D8DC',
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, marginBottom: 16,
  },
  loginBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3 },
  loginBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, color: '#BDC3C7', fontSize: 13 },
  signupBtn: { height: 52, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  signupBtnText: { fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginTop: 16, alignItems: 'center', padding: 10 },
  backBtnText: { color: '#95A5A6', fontSize: 14 },
});

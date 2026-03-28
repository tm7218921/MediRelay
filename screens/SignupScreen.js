import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;
  const isSender = role === 'sender';

  const [form, setForm] = useState({
    fullName: '', hospitalName: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSignup = async () => {
    const { fullName, hospitalName, email, password, confirmPassword } = form;

    if (!fullName || !hospitalName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase Auth account
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCred.user.uid;

      // Save profile to Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName: fullName.trim(),
        hospitalName: hospitalName.trim(),
        email: email.trim(),
        role, // 'sender' or 'receiver'
        createdAt: serverTimestamp(),
      });

      // Auth state in App.js will auto-navigate
    } catch (e) {
      let msg = 'Signup failed. Please try again.';
      if (e.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please log in.';
      if (e.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (e.code === 'auth/weak-password') msg = 'Password is too weak.';
      Alert.alert('Signup Error', msg);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.roleBanner, { backgroundColor: isSender ? '#C0392B' : '#2980B9' }]}>
        <Text style={styles.roleEmoji}>{isSender ? '👨‍⚕️' : '🏨'}</Text>
        <Text style={styles.roleName}>
          {isSender ? 'Register as Doctor / Nurse' : 'Register as Receiver'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Dr. Priya Sharma" value={form.fullName} onChangeText={t => update('fullName', t)} />

        <Text style={styles.label}>{isSender ? 'Sending Hospital / Clinic' : 'Receiving Hospital Name'}</Text>
        <TextInput style={styles.input} placeholder="PHC Dharavi / KEM Hospital" value={form.hospitalName} onChangeText={t => update('hospitalName', t)} />

        <Text style={styles.label}>Work Email</Text>
        <TextInput
          style={styles.input} placeholder="doctor@hospital.com"
          value={form.email} onChangeText={t => update('email', t)}
          keyboardType="email-address" autoCapitalize="none"
        />

        <Text style={styles.label}>Password (min. 6 chars)</Text>
        <TextInput
          style={styles.input} placeholder="Create a strong password"
          value={form.password} onChangeText={t => update('password', t)}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input} placeholder="Re-enter password"
          value={form.confirmPassword} onChangeText={t => update('confirmPassword', t)}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.signupBtn, { backgroundColor: isSender ? '#C0392B' : '#2980B9' }, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.signupBtnText}>CREATE ACCOUNT →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingBottom: 40 },
  roleBanner: { padding: 24, alignItems: 'center' },
  roleEmoji: { fontSize: 40, marginBottom: 8 },
  roleName: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  form: { padding: 24 },
  label: { fontSize: 12, fontWeight: '600', color: '#7F8C8D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: 52, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D5D8DC',
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16, marginBottom: 16,
  },
  signupBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3 },
  signupBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  backBtn: { marginTop: 16, alignItems: 'center', padding: 10 },
  backBtnText: { color: '#95A5A6', fontSize: 14 },
});

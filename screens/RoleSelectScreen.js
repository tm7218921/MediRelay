import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.title}>MediRelay</Text>
        <Text style={styles.subtitle}>Secure Clinical Handover System</Text>
      </View>

      <Text style={styles.prompt}>Select your role to continue</Text>

      <TouchableOpacity
        style={[styles.roleCard, { borderColor: '#C0392B' }]}
        onPress={() => navigation.navigate('Login', { role: 'sender' })}
      >
        <Text style={styles.roleIcon}>👨‍⚕️</Text>
        <View style={styles.roleText}>
          <Text style={[styles.roleTitle, { color: '#C0392B' }]}>Doctor / Nurse</Text>
          <Text style={styles.roleDesc}>Create and send patient transfer records</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleCard, { borderColor: '#2980B9' }]}
        onPress={() => navigation.navigate('Login', { role: 'receiver' })}
      >
        <Text style={styles.roleIcon}>🏨</Text>
        <View style={styles.roleText}>
          <Text style={[styles.roleTitle, { color: '#2980B9' }]}>Receiving Hospital</Text>
          <Text style={styles.roleDesc}>Scan QR or look up incoming patient records</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Your data is encrypted and stored securely in compliance with medical privacy standards.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#2C3E50' },
  subtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 4, textAlign: 'center' },
  prompt: { fontSize: 16, fontWeight: '600', color: '#34495E', marginBottom: 20, textAlign: 'center' },
  roleCard: {
    backgroundColor: '#FFF', borderWidth: 2, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  roleIcon: { fontSize: 36, marginRight: 16 },
  roleText: { flex: 1 },
  roleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  roleDesc: { fontSize: 13, color: '#7F8C8D', lineHeight: 18 },
  arrow: { fontSize: 28, color: '#BDC3C7', fontWeight: '300' },
  footer: { marginTop: 40, fontSize: 12, color: '#BDC3C7', textAlign: 'center', lineHeight: 18 },
});

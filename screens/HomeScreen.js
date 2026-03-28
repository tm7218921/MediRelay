import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function HomeScreen({ navigation }) {
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load last 5 transfers from DB
  useEffect(() => {
    // Timeout fallback — stop loading after 5 seconds no matter what
    const timeout = setTimeout(() => setLoading(false), 5000);

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'transfers'), orderBy('createdAt', 'desc'), limit(5));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        clearTimeout(timeout);
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        setRecentTransfers(records);
        setLoading(false);
      }, (error) => {
        clearTimeout(timeout);
        console.warn('Firestore error:', error.message);
        setLoading(false);
      });
    } catch (e) {
      clearTimeout(timeout);
      console.warn('Firebase init error:', e.message);
      setLoading(false);
    }

    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);

  const getTriageColor = (score) => {
    if (score === 'CRITICAL') return '#C0392B';
    if (score === 'MEDIUM') return '#E67E22';
    return '#27AE60';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyCard} 
      onPress={() => navigation.navigate('RecordView', { recordId: item.id })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.historyText} numberOfLines={1}>{item.diagnosis}</Text>
        <Text style={styles.timeText}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString() : 'Pending sync'}
        </Text>
      </View>
      <View style={[styles.triageBadge, { backgroundColor: getTriageColor(item.triageScore) }]}>
        <Text style={styles.triageText}>{item.triageScore?.substring(0,4)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>M</Text>
        <Text style={styles.appName}>MediRelay</Text>
        <Text style={styles.subtitle}>Secure Clinical Handover</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: '#C0392B' }]} 
          onPress={() => navigation.navigate('TransferForm')}
        >
          <Text style={styles.buttonText}>+ NEW TRANSFER</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: '#2C3E50' }]} 
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.buttonText}>[ ] SCAN QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Recent Transfers</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#C0392B" style={{ marginTop: 20 }} />
        ) : recentTransfers.length === 0 ? (
          <Text style={styles.emptyText}>No recent transfers found. Start by tapping 'New Transfer'.</Text>
        ) : (
          recentTransfers.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              onPress={() => navigation.navigate('RecordView', { recordId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={styles.historyText} numberOfLines={1}>{item.diagnosis}</Text>
                <Text style={styles.timeText}>
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString() : 'Pending sync'}
                </Text>
              </View>
              <View style={[styles.triageBadge, { backgroundColor: getTriageColor(item.triageScore) }]}>
                <Text style={styles.triageText}>{item.triageScore?.substring(0,4)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' 
  },
  logo: { fontSize: 44, fontWeight: '900', color: '#C0392B', marginBottom: 5 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 13, color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  
  buttonContainer: { padding: 20, gap: 12 },
  primaryButton: { 
    height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', tracking: 1 },
  
  historyContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 },
  emptyText: { textAlign: 'center', color: '#95A5A6', marginTop: 20, fontStyle: 'italic', lineHeight: 22 },
  
  historyCard: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  historyText: { fontSize: 13, color: '#7F8C8D', paddingRight: 10 },
  timeText: { fontSize: 11, color: '#BDC3C7', marginTop: 6 },
  triageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  triageText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }
});

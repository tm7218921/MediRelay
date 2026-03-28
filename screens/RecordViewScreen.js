import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
// In a full environment, the generation could attach to expo-print here.

export default function RecordViewScreen({ route, navigation }) {
  const { recordId } = route.params;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const [ackNote, setAckNote] = useState('');
  const [discrepancy, setDiscrepancy] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      const docRef = doc(db, 'transfers', recordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRecord({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert("Error", "Record not found");
        navigation.goBack();
      }
    } catch (e) {
      console.warn("Fetch Error", e);
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (score) => {
    if (score === 'CRITICAL') return '#C0392B';
    if (score === 'MEDIUM') return '#E67E22';
    return '#27AE60';
  };

  const handleAcknowledge = async () => {
    if (!record) return;
    try {
      const docRef = doc(db, 'transfers', record.id);
      await updateDoc(docRef, { acknowledgedAt: new Date().toISOString(), arrivalNote: ackNote });
      setRecord({ ...record, acknowledgedAt: new Date().toISOString(), arrivalNote: ackNote });
      Alert.alert("Success", "Record safely acknowledged!");
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const submitDiscrepancy = async () => {
    if (!record || !discrepancy.trim()) return;
    try {
      const newD = [...record.discrepancies, discrepancy];
      const docRef = doc(db, 'transfers', record.id);
      await updateDoc(docRef, { discrepancies: newD });
      setRecord({ ...record, discrepancies: newD });
      setModalVisible(false);
      setDiscrepancy('');
    } catch (e) { Alert.alert("Error", e.message); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#C0392B" /></View>;
  if (!record) return null;

  return (
    <ScrollView style={styles.container}>
      
      {/* TOP SECTION - CRITICAL UNMISSABLE */}
      <View style={[styles.criticalCard, { borderColor: '#E74C3C', borderWidth: 3 }]}>
        <Text style={styles.criticalTitle}>ALLERGIES</Text>
        {record.allergies?.length === 0 ? (
          <Text style={{ color: '#27AE60', fontSize: 18, fontWeight: 'bold' }}>NO KNOWN ALLERGIES</Text>
        ) : (
          <View style={styles.pillRow}>
            {record.allergies.map((a, i) => (
              <View key={i} style={styles.redPill}><Text style={styles.pillText}>{a}</Text></View>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.triageBanner, { backgroundColor: getTriageColor(record.triageScore) }]}>
        <Text style={styles.triageBannerText}>{record.triageScore} PRIORITY</Text>
      </View>

      {/* MIDDLE SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <Text style={styles.dataRow}><Text style={styles.bold}>Name:</Text> {record.patientName} ({record.age}{record.gender?.charAt(0)})</Text>
        <Text style={styles.dataRow}><Text style={styles.bold}>Diagnosis:</Text> {record.diagnosis}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Vitals Dashboard</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>BP</Text><Text style={styles.gridData}>{record.vitals?.bp || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>HR (bpm)</Text><Text style={styles.gridData}>{record.vitals?.hr || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>Temp (°C)</Text><Text style={styles.gridData}>{record.vitals?.temp || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>SpO2 (%)</Text><Text style={styles.gridData}>{record.vitals?.spo2 || 'N/A'}</Text></View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Active Medications</Text>
        {record.medications?.length === 0 && <Text style={styles.dataRow}>None reported</Text>}
        {record.medications.map((m, i) => (
          <Text key={i} style={styles.medRow}>• {m.name} <Text style={{fontWeight: 'bold', color: '#2C3E50'}}>{m.dose}</Text> ({m.route})</Text>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Clinical Summary & Transfer Reason</Text>
        <Text style={[styles.dataRow, { color: '#E67E22', fontWeight: 'bold' }]}>{record.reasonForTransfer}</Text>
        <Text style={styles.dataRow}>{record.clinicalSummary}</Text>
        <Text style={[styles.dataRow, { marginTop: 10, fontStyle: 'italic' }]}><Text style={styles.bold}>Pending Labs:</Text> {record.pendingInvestigations}</Text>
        
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Transit Logistics</Text>
        <Text style={styles.dataRow}>From: {record.sendingHospital}</Text>
        <Text style={styles.dataRow}>To: {record.receivingHospital}</Text>
      </View>

      {/* DISCREPANCIES */}
      {record.discrepancies?.length > 0 && (
        <View style={[styles.card, { backgroundColor: '#FDEDEC', borderColor: '#E74C3C', borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: '#E74C3C' }]}>⚠️ Flagged Discrepancies</Text>
          {record.discrepancies.map((d, i) => <Text key={i} style={{ color: '#C0392B', fontWeight: 'bold', marginBottom: 5 }}>- {d}</Text>)}
        </View>
      )}

      {/* BOTTOM SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Receiver Workflow</Text>
        {record.acknowledgedAt ? (
          <View style={{ alignItems: 'center', backgroundColor: '#EAFBEE', padding: 20, borderRadius: 10 }}>
            <Text style={{ color: '#27AE60', fontWeight: '900', fontSize: 16 }}>✔ RECEIVED AND REVIEWED</Text>
            {record.arrivalNote && <Text style={{ fontStyle: 'italic', marginTop: 10 }}>"{record.arrivalNote}"</Text>}
          </View>
        ) : (
          <View>
            <TextInput style={styles.input} placeholder="Add Arrival Note (Optional)..." value={ackNote} onChangeText={setAckNote} />
            <TouchableOpacity style={styles.ackBtn} onPress={handleAcknowledge}>
              <Text style={styles.ackBtnText}>MARK AS REVIEWED</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.discBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.discBtnText}>FLAG DISCREPANCY</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E74C3C', marginBottom: 15 }}>Flag Record Discrepancy</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top'}]} multiline placeholder="What is wrong in the record?" value={discrepancy} onChangeText={setDiscrepancy} />
            <TouchableOpacity style={[styles.ackBtn, { backgroundColor: '#E74C3C' }]} onPress={submitDiscrepancy}>
              <Text style={styles.ackBtnText}>ATTACH WARNING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 15, alignItems: 'center' }} onPress={() => setModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  criticalCard: { margin: 15, padding: 25, backgroundColor: '#FDEDEC', borderRadius: 16, alignItems: 'center' },
  criticalTitle: { fontSize: 32, fontWeight: '900', color: '#E74C3C', letterSpacing: 2, marginBottom: 15 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  redPill: { backgroundColor: '#E74C3C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, margin: 5 },
  pillText: { color: '#FFF', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  
  triageBanner: { padding: 15, alignItems: 'center', marginHorizontal: 15, borderRadius: 8, marginTop: 0 },
  triageBannerText: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 3 },
  
  card: { backgroundColor: '#FFF', margin: 15, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 15 },
  bold: { fontWeight: 'bold' },
  dataRow: { fontSize: 15, color: '#34495E', marginBottom: 8, lineHeight: 22 },
  medRow: { fontSize: 15, color: '#2C3E50', marginBottom: 5, backgroundColor: '#F0F3F4', padding: 8, borderRadius: 6 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: '#F0F3F4', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  gridLabel: { fontSize: 11, fontWeight: 'bold', color: '#7F8C8D', textTransform: 'uppercase' },
  gridData: { fontSize: 18, fontWeight: '900', color: '#2C3E50', marginTop: 4 },
  
  input: { borderWidth: 1, borderColor: '#BDC3C7', height: 50, paddingHorizontal: 15, borderRadius: 8, marginBottom: 15, backgroundColor: '#FFF' },
  ackBtn: { backgroundColor: '#27AE60', padding: 18, borderRadius: 12, alignItems: 'center' },
  ackBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  discBtn: { borderWidth: 2, borderColor: '#E74C3C', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  discBtnText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 15 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 16 }
});

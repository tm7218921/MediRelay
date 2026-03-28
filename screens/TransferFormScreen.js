import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateTriageScore } from '../utils/triageScore';
import { checkDrugAllergyConflicts } from '../utils/drugAllergyCheck';

export default function TransferFormScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientName: '', age: '', gender: 'Male', diagnosis: '', reasonForTransfer: '',
    bp: '', hr: '', temp: '', spo2: '',
    clinicalSummary: '', pendingInvestigations: '',
    sendingHospital: '', receivingHospital: '', emergencyContact: ''
  });

  const [allergies, setAllergies] = useState([]);
  const [currentAllergy, setCurrentAllergy] = useState('');
  const [medications, setMedications] = useState([]);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medRoute, setMedRoute] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addAllergy = () => {
    if (currentAllergy.trim()) {
      setAllergies(prev => [...prev, currentAllergy.trim()]);
      setCurrentAllergy('');
    }
  };

  const addMedication = () => {
    if (!medName.trim()) { Alert.alert('Missing', 'Drug name is required'); return; }
    setMedications(prev => [...prev, { name: medName.trim(), dose: medDose.trim(), route: medRoute.trim() }]);
    setMedName(''); setMedDose(''); setMedRoute('');
  };

  const handleSeed = () => {
    setForm({
      patientName: 'Riya Sharma', age: '34', gender: 'Female',
      diagnosis: 'Acute Appendicitis', reasonForTransfer: 'Needs emergency surgery',
      bp: '88/60', hr: '126', temp: '38.9', spo2: '93',
      clinicalSummary: 'Patient presented with severe RLQ pain and fever.',
      pendingInvestigations: 'CT scan pending',
      sendingHospital: 'PHC Dharavi', receivingHospital: 'KEM Hospital',
      emergencyContact: '+91-9876543210'
    });
    setAllergies(['Penicillin', 'Sulfa']);
    setMedications([
      { name: 'Metronidazole', dose: '500mg', route: 'IV' },
      { name: 'Paracetamol', dose: '1g', route: 'Oral' }
    ]);
  };

  const handleSubmit = async () => {
    if (!form.patientName || !form.age || !form.diagnosis || !form.reasonForTransfer) {
      Alert.alert('Error', 'Please fill: Name, Age, Diagnosis, Reason for Transfer');
      return;
    }

    const conflicts = checkDrugAllergyConflicts(medications, allergies);
    if (conflicts.length > 0) {
      Alert.alert(
        '⚠️ Drug-Allergy Conflict',
        conflicts.join('\n') + '\n\nDo you want to proceed anyway?',
        [
          { text: 'Edit', style: 'cancel' },
          { text: 'Proceed', style: 'destructive', onPress: () => saveRecord() }
        ]
      );
      return;
    }
    saveRecord();
  };

  const saveRecord = async () => {
    setLoading(true);
    try {
      const vitals = { bp: form.bp, hr: form.hr, temp: form.temp, spo2: form.spo2 };
      const triage = calculateTriageScore(vitals);

      const docRef = await addDoc(collection(db, 'transfers'), {
        patientName: form.patientName,
        age: parseInt(form.age, 10) || 0,
        gender: form.gender,
        diagnosis: form.diagnosis,
        reasonForTransfer: form.reasonForTransfer,
        vitals,
        clinicalSummary: form.clinicalSummary,
        pendingInvestigations: form.pendingInvestigations,
        sendingHospital: form.sendingHospital,
        receivingHospital: form.receivingHospital,
        emergencyContact: form.emergencyContact,
        allergies,
        medications,
        triageScore: triage,
        createdAt: serverTimestamp(),
      });

      navigation.navigate('QR', {
        recordId: docRef.id,
        patientName: form.patientName,
        triageScore: triage
      });
    } catch (e) {
      Alert.alert('Save Error', e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Patient Transfer Form</Text>
        <TouchableOpacity onPress={handleSeed} style={styles.seedBtn}>
          <Text style={styles.seedText}>Seed Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Section A: Patient Info */}
      <Text style={styles.sectionHeader}>A. Patient Info</Text>
      <TextInput style={styles.input} placeholder="Patient Name *" value={form.patientName} onChangeText={t => update('patientName', t)} />
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Age *" keyboardType="numeric" value={form.age} onChangeText={t => update('age', t)} />
        <TextInput style={[styles.input, { flex: 2, marginLeft: 10 }]} placeholder="Gender" value={form.gender} onChangeText={t => update('gender', t)} />
      </View>
      <TextInput style={styles.input} placeholder="Primary Diagnosis *" value={form.diagnosis} onChangeText={t => update('diagnosis', t)} />
      <TextInput style={styles.input} placeholder="Reason for Transfer *" value={form.reasonForTransfer} onChangeText={t => update('reasonForTransfer', t)} />

      {/* Section B: Allergies */}
      <Text style={[styles.sectionHeader, { color: '#C0392B' }]}>B. Allergies (Critical)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, borderColor: '#E74C3C', borderWidth: 2 }]}
          placeholder="Type allergy & press ADD"
          value={currentAllergy}
          onChangeText={setCurrentAllergy}
          onSubmitEditing={addAllergy}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
          <Text style={styles.addBtnText}>ADD</Text>
        </TouchableOpacity>
      </View>
      {allergies.length === 0
        ? <Text style={styles.warningText}>⚠️ No allergies listed. Add one or type "None".</Text>
        : <View style={styles.pillRow}>
            {allergies.map((a, i) => (
              <TouchableOpacity key={i} style={styles.allergyPill} onPress={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>
                <Text style={styles.allergyPillText}>{a}  ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
      }

      {/* Section C: Medications */}
      <Text style={styles.sectionHeader}>C. Active Medications</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Drug Name" value={medName} onChangeText={setMedName} />
        <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Dose" value={medDose} onChangeText={setMedDose} />
      </View>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1, marginTop: -5 }]} placeholder="Route (IV, Oral...)" value={medRoute} onChangeText={setMedRoute} />
        <TouchableOpacity style={[styles.addBtn, { marginTop: -5 }]} onPress={addMedication}>
          <Text style={styles.addBtnText}>+ MED</Text>
        </TouchableOpacity>
      </View>
      {medications.map((m, i) => (
        <View key={i} style={styles.medCard}>
          <Text style={styles.medText}>{m.name} — {m.dose} ({m.route})</Text>
          <TouchableOpacity onPress={() => setMedications(medications.filter((_, idx) => idx !== i))}>
            <Text style={{ color: '#C0392B', fontWeight: 'bold', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Section D: Vitals */}
      <Text style={styles.sectionHeader}>D. Last Known Vitals</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="BP (120/80)" value={form.bp} onChangeText={t => update('bp', t)} />
        <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="HR (bpm)" keyboardType="numeric" value={form.hr} onChangeText={t => update('hr', t)} />
      </View>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Temp °C" keyboardType="numeric" value={form.temp} onChangeText={t => update('temp', t)} />
        <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="SpO2 %" keyboardType="numeric" value={form.spo2} onChangeText={t => update('spo2', t)} />
      </View>

      {/* Section E: Clinical Summary */}
      <Text style={styles.sectionHeader}>E. Clinical Summary</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        multiline
        placeholder="Clinical notes..."
        value={form.clinicalSummary}
        onChangeText={t => update('clinicalSummary', t)}
      />
      <TextInput style={styles.input} placeholder="Pending Investigations" value={form.pendingInvestigations} onChangeText={t => update('pendingInvestigations', t)} />

      {/* Section F: Logistics */}
      <Text style={styles.sectionHeader}>F. Logistics</Text>
      <TextInput style={styles.input} placeholder="Sending Hospital" value={form.sendingHospital} onChangeText={t => update('sendingHospital', t)} />
      <TextInput style={styles.input} placeholder="Receiving Hospital" value={form.receivingHospital} onChangeText={t => update('receivingHospital', t)} />
      <TextInput style={styles.input} placeholder="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={t => update('emergencyContact', t)} />

      {/* Submit */}
      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#FFF" size="large" />
          : <Text style={styles.submitText}>FINALIZE & GENERATE QR →</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  seedBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  seedText: { fontWeight: 'bold', color: '#34495E', fontSize: 12 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50', marginTop: 16, marginBottom: 10, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 6 },
  input: { height: 48, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D5D8DC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 10, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  addBtn: { backgroundColor: '#2C3E50', height: 48, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center', marginLeft: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  warningText: { color: '#E74C3C', fontWeight: 'bold', marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  allergyPill: { backgroundColor: '#E74C3C', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  allergyPillText: { color: '#FFF', fontWeight: 'bold' },
  medCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E74C3C', marginBottom: 6 },
  medText: { fontSize: 14, color: '#2C3E50', fontWeight: '600' },
  submitBtn: { backgroundColor: '#C0392B', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 24, elevation: 4 },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});

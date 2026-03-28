import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as SMS from 'expo-sms';

export default function QRScreen({ route, navigation }) {
  const { recordId, patientName, triageScore } = route.params;
  
  // Format the URL schema we will pack into the QR code.
  const qrData = `medirelay://record/${recordId}`;

  const getTriageColor = (score) => {
    if (score === 'CRITICAL') return '#C0392B';
    if (score === 'MEDIUM') return '#E67E22';
    return '#27AE60';
  };

  const sharePlaceholder = () => {
    Alert.alert("Feature", "In a full rollout, this triggers expo-sharing with the QR image blob or PDF.");
  };

  const sendFreeSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const message = `[MediRelay Secure Transfer]\nPatient: ${patientName}\nTriage: ${triageScore}\nTransfer ID: ${recordId}\nScan this at the receiving facility.`;
      const { result } = await SMS.sendSMSAsync(
        [], // Empty array lets user pick the contact manually
        message
      );
      if (result === 'sent') {
        Alert.alert("Success", "SMS handover sent successfully via carrier.");
      }
    } else {
      Alert.alert("Error", "We're sorry, SMS is not available on this device.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusText}>TRANSFER RECORD SECURED ✓</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.patientName}>{patientName}</Text>
        <View style={[styles.triageBadge, { backgroundColor: getTriageColor(triageScore) }]}>
          <Text style={styles.triageText}>{triageScore} TRIAGE</Text>
        </View>

        <View style={styles.qrWrapper}>
          <QRCode
            value={qrData}
            size={250}
            color="#2C3E50"
            backgroundColor="transparent"
          />
        </View>
        <Text style={styles.helpText}>Scan this code at receiving facility</Text>
        <Text selectable style={styles.idText}>ID: {recordId}</Text>
      </View>

      <View style={styles.actionContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginRight: 10 }]} onPress={sharePlaceholder}>
            <Text style={styles.actionText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#3498DB' }]} onPress={sendFreeSMS}>
            <Text style={[styles.actionText, { color: '#FFF' }]}>Send Free SMS</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2C3E50', marginTop: 15 }]} onPress={() => navigation.popToTop()}>
          <Text style={[styles.actionText, { color: '#FFF' }]}>RETURN TO DASHBOARD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  statusHeader: { backgroundColor: '#27AE60', padding: 15, alignItems: 'center' },
  statusText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  card: { backgroundColor: '#FFF', margin: 20, borderRadius: 16, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  patientName: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10, textAlign: 'center' },
  triageBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 30 },
  triageText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  qrWrapper: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', marginBottom: 20 },
  helpText: { fontSize: 14, color: '#7F8C8D', fontStyle: 'italic', marginBottom: 10 },
  idText: { fontSize: 10, color: '#BDC3C7', fontFamily: 'monospace' },
  actionContainer: { paddingHorizontal: 20, marginTop: 'auto', marginBottom: 40 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { padding: 16, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50', letterSpacing: 0.5 }
});

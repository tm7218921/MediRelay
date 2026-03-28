import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';

// Only import camera on native (not web — it crashes silently)
let CameraView = null;
let Camera = null;
if (Platform.OS !== 'web') {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  Camera = cam.Camera;
}

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'web' ? false : null);
  const [scanned, setScanned] = useState(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') return; // skip camera on web
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    let extractId = data;
    if (data.includes('medirelay://record/')) {
      extractId = data.split('medirelay://record/')[1];
    }
    if (extractId) {
      navigation.replace('RecordView', { recordId: extractId });
    } else {
      Alert.alert('Invalid QR', 'Not a valid MediRelay QR code.');
      setScanned(false);
    }
  };

  const handleManualSearch = () => {
    if (!manualId.trim()) {
      Alert.alert('Error', 'Please enter a transfer ID.');
      return;
    }
    navigation.replace('RecordView', { recordId: manualId.trim() });
  };

  // Web fallback — just show manual entry
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>📷 Camera not available on web</Text>
        <Text style={styles.webSub}>Enter the Transfer ID manually to look up a patient record.</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste Transfer ID..."
          value={manualId}
          onChangeText={setManualId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.lookupBtn} onPress={handleManualSearch}>
          <Text style={styles.lookupText}>Look up Record</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === null) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#C0392B" />
      <Text style={{ marginTop: 10 }}>Requesting camera access...</Text>
    </View>
  );

  if (hasPermission === false) return (
    <View style={styles.center}>
      <Text style={{ fontSize: 16, color: '#E74C3C', textAlign: 'center', padding: 20 }}>
        Camera access denied.{'\n'}Please enable it in Settings.
      </Text>
      <View style={{ paddingHorizontal: 24, width: '100%', marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 }}>Or enter ID manually:</Text>
        <TextInput style={styles.input} placeholder="Paste Transfer ID..." value={manualId} onChangeText={setManualId} autoCapitalize="none" />
        <TouchableOpacity style={styles.lookupBtn} onPress={handleManualSearch}>
          <Text style={styles.lookupText}>Look up Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cameraBox}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanTarget} />
          <Text style={styles.hint}>Align QR code within the frame</Text>
        </View>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}

      <View style={styles.manualEntryBox}>
        <Text style={styles.manualTitle}>Or enter Transfer ID manually</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste Transfer ID..."
          value={manualId}
          onChangeText={setManualId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.lookupBtn} onPress={handleManualSearch}>
          <Text style={styles.lookupText}>Look up Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  webContainer: { flex: 1, backgroundColor: '#F8F9FA', padding: 24, justifyContent: 'center' },
  webTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10, textAlign: 'center' },
  webSub: { fontSize: 14, color: '#7F8C8D', marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  cameraBox: { flex: 2, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  scanTarget: { width: 240, height: 240, borderWidth: 3, borderColor: '#27AE60', borderRadius: 16 },
  hint: { color: '#fff', marginTop: 20, fontSize: 14 },
  rescanBtn: { position: 'absolute', top: 40, alignSelf: 'center', backgroundColor: '#C0392B', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, zIndex: 10 },
  rescanText: { color: '#FFF', fontWeight: 'bold' },
  manualEntryBox: { flex: 1, backgroundColor: '#FFF', padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  manualTitle: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  input: { height: 50, borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#F8F9FA', fontSize: 15, marginBottom: 10 },
  lookupBtn: { backgroundColor: '#2C3E50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  lookupText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

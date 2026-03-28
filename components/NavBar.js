import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function NavBar({ navigationRef, role }) {
  const isSender = role === 'sender';
  const accentColor = isSender ? '#C0392B' : '#2980B9';
  const homeScreen = isSender ? 'Home' : 'Scanner';

  const goTo = (screen) => {
    try {
      navigationRef?.current?.navigate(screen);
    } catch (e) {
      console.warn('Nav error:', e.message);
    }
  };

  const goBack = () => {
    try {
      if (navigationRef?.current?.canGoBack()) {
        navigationRef.current.goBack();
      }
    } catch (e) {
      console.warn('Back error:', e.message);
    }
  };

  // Direct logout — no Alert wrapping to avoid callback chain issues
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert('Logout Error', e.message);
    }
  };

  return (
    // No pointerEvents on wrapper — let all touches through normally
    <View style={styles.wrapper}>
      <View style={styles.pill}>

        {/* Back */}
        <TouchableOpacity style={styles.btn} onPress={goBack} activeOpacity={0.6}>
          <Text style={styles.icon}>◀</Text>
          <Text style={[styles.label, { color: '#7F8C8D' }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Home */}
        <TouchableOpacity style={styles.btn} onPress={() => goTo(homeScreen)} activeOpacity={0.6}>
          <Text style={styles.icon}>🏠</Text>
          <Text style={[styles.label, { color: accentColor }]}>Home</Text>
        </TouchableOpacity>

        {/* New Transfer — sender only */}
        {isSender && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.centerBtn, { backgroundColor: accentColor }]}
              onPress={() => goTo('TransferForm')}
              activeOpacity={0.7}
            >
              <Text style={styles.centerIcon}>＋</Text>
              <Text style={styles.centerLabel}>New</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.divider} />

        {/* Scan */}
        <TouchableOpacity style={styles.btn} onPress={() => goTo('Scanner')} activeOpacity={0.6}>
          <Text style={styles.icon}>📷</Text>
          <Text style={[styles.label, { color: accentColor }]}>Scan</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.btn} onPress={handleLogout} activeOpacity={0.6}>
          <Text style={styles.icon}>🚪</Text>
          <Text style={[styles.label, { color: '#E74C3C' }]}>Logout</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,          // Android: renders on top of everything
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  btn: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 52,
  },
  icon: { fontSize: 18 },
  label: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    marginHorizontal: 6,
    elevation: 20,
  },
  centerIcon: { fontSize: 22, color: '#FFF', lineHeight: 26 },
  centerLabel: { fontSize: 9, color: '#FFF', fontWeight: '700', marginTop: 1 },
  divider: { width: 1, height: 28, backgroundColor: '#EEE' },
});

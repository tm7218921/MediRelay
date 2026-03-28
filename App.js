import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Auth Screens
import RoleSelectScreen from './screens/RoleSelectScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

// Sender Screens
import HomeScreen from './screens/HomeScreen';
import TransferFormScreen from './screens/TransferFormScreen';
import QRScreen from './screens/QRScreen';

// Shared / Receiver Screens
import ScannerScreen from './screens/ScannerScreen';
import RecordViewScreen from './screens/RecordViewScreen';

// Floating NavBar
import NavBar from './components/NavBar';

const Stack = createStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
      <ActivityIndicator size="large" color="#C0392B" />
    </View>
  );
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback: stop loading after 5 seconds no matter what
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Profile fetch error:', e.message);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);


  if (loading) return <LoadingScreen />;

  const isSender = userProfile?.role === 'sender';
  const headerColor = isSender ? '#C0392B' : '#2980B9';

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: user ? headerColor : '#2C3E50' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            // Give all content padding at bottom so it clears the floating navbar
            contentStyle: { paddingBottom: user ? 90 : 0 },
          }}
        >
          {!user ? (
            // ── AUTH STACK ──────────────────────────────────────
            <>
              <Stack.Screen
                name="RoleSelect"
                component={RoleSelectScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : isSender ? (
            // ── SENDER STACK (Doctor / Nurse) ────────────────────
            <>
              <Stack.Screen
                name="Home"
                options={{ title: `🏥 ${userProfile?.hospitalName || 'MediRelay'}` }}
              >
                {(props) => <HomeScreen {...props} userProfile={userProfile} />}
              </Stack.Screen>
              <Stack.Screen
                name="TransferForm"
                component={TransferFormScreen}
                options={{ title: 'New Patient Transfer' }}
              />
              <Stack.Screen
                name="QR"
                component={QRScreen}
                options={{ title: 'Transfer QR Code' }}
              />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ title: 'Scan QR Code' }}
              />
              <Stack.Screen
                name="RecordView"
                component={RecordViewScreen}
                options={{ title: 'Patient Record' }}
              />
            </>
          ) : (
            // ── RECEIVER STACK ───────────────────────────────────
            <>
              <Stack.Screen
                name="Scanner"
                options={{ title: `📡 ${userProfile?.hospitalName || 'Receiver'}` }}
              >
                {(props) => <ScannerScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen
                name="RecordView"
                component={RecordViewScreen}
                options={{ title: 'Patient Record' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Floating NavBar — only shows when logged in */}
      {user && (
        <NavBar
          navigationRef={navigationRef}
          role={userProfile?.role}
        />
      )}
    </View>
  );
}

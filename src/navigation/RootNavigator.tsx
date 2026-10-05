import React, { useEffect, useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { hasPIN } from '../utils/pin';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import PINSetupScreen from '../screens/auth/PINSetupScreen';
import PanicRecordingScreen from '../screens/emergency/PanicRecordingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ---------- module-level hooks so sibling screens can trigger re-checks ----------

/** Call this after setPIN() to make RootNavigator re-evaluate and show the App. */
export let refreshPINCheck: () => void = () => {};

/** Call this to bypass auth entirely (dev testing only). */
export let triggerDevBypass: () => void = () => {};

// ---------------------------------------------------------------------------------

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const [pinSet, setPinSet] = useState(false);
  const [pinChecked, setPinChecked] = useState(false);
  const [devBypass, setDevBypass] = useState(false);

  // Wire up the exported hooks to this component's state setters.
  refreshPINCheck = useCallback(async () => {
    const has = await hasPIN();
    setPinSet(has);
    setPinChecked(true);
  }, []);

  triggerDevBypass = useCallback(() => {
    // Dev-only auth bypass. Hard no-op in production builds so it can never grant access.
    if (__DEV__) setDevBypass(true);
  }, []);

  useEffect(() => {
    if (session) {
      hasPIN().then(has => { setPinSet(has); setPinChecked(true); });
    } else if (!devBypass) {
      setPinChecked(false);
      setPinSet(false);
    }
  }, [session, devBypass]);

  if (loading) return null;

  const devBypassActive = __DEV__ && devBypass;
  const isAuthed = !!session || devBypassActive;
  const needsPIN = !devBypassActive && (!pinChecked || !pinSet);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthed ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : needsPIN ? (
        <Stack.Screen name="PINSetup" component={PINSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="App" component={AppNavigator} />
          <Stack.Screen
            name="PanicRecording"
            component={PanicRecordingScreen}
            options={{ gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

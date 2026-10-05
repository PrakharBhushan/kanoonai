import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, BackHandler, StatusBar, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  startDurationCounter, stopDurationCounter,
  uploadVideoChunk, clearSession,
} from '../../services/panicRecording';
import { verifyPIN } from '../../utils/pin';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import PINPad from '../../components/PINPad';

type Props = NativeStackScreenProps<RootStackParamList, 'PanicRecording'>;

export default function PanicRecordingScreen({ navigation, route }: Props) {
  const { sessionId, userId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<boolean>(false);
  const chunkCountRef = useRef(0);

  const [duration, setDuration] = useState(0);
  const [chunksUploaded, setChunksUploaded] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      startRecording();
    } else if (permission && !permission.granted) {
      requestPermission().then(p => { if (p.granted) startRecording(); });
    }
    return () => {
      stopDurationCounter();
      stopCurrentRecording();
    };
  }, [permission?.granted]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || recordingRef.current) return;
    recordingRef.current = true;
    startDurationCounter(setDuration);

    const doRecord = async () => {
      if (!cameraRef.current || !recordingRef.current) return;
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 15 });
        if (video?.uri && recordingRef.current) {
          chunkCountRef.current++;
          setUploading(true);
          await uploadVideoChunk(video.uri, sessionId, chunkCountRef.current, userId, false);
          setChunksUploaded(c => c + 1);
          setUploading(false);
          doRecord();
        }
      } catch { /* camera stopped */ }
    };
    doRecord();
  }, [sessionId, userId]);

  const stopCurrentRecording = () => {
    if (cameraRef.current && recordingRef.current) {
      cameraRef.current.stopRecording();
      recordingRef.current = false;
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePINComplete = async (pin: string) => {
    const result = await verifyPIN(pin);
    if (!result.success) {
      if (result.locked) {
        const seconds = Math.ceil((result.lockedForMs ?? 0) / 1000);
        setPinError(t('panic.lockedOut', { seconds }));
      } else {
        setPinError(t('panic.wrongPIN'));
      }
      setTimeout(() => setPinError(null), 2500);
      return;
    }
    stopDurationCounter();
    stopCurrentRecording();
    clearSession();
    navigation.replace('App');
  };

  if (!permission) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Animated.View style={[styles.recDot, { opacity: dotOpacity }]} />
        <Text style={styles.recText}>{t('panic.recording')}</Text>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.cameraWrapper}>
        {permission.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="video" />
        ) : (
          <View style={[styles.camera, styles.noCamera]}>
            <Text style={styles.noCameraText}>Camera unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.status}>
        <Text style={styles.chunksText}>{chunksUploaded} {t('panic.chunkUploaded')}</Text>
        {uploading && <Text style={styles.uploadingText}>{t('panic.uploadingChunks')}</Text>}
      </View>

      <PINPad onComplete={handlePINComplete} label={t('panic.enterPIN')} error={pinError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.emergency },
  recText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 2 },
  timer: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  cameraWrapper: { height: 260, marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111' },
  camera: { flex: 1 },
  noCamera: { alignItems: 'center', justifyContent: 'center' },
  noCameraText: { color: '#666' },
  status: { alignItems: 'center', paddingVertical: 12 },
  chunksText: { color: Colors.success, fontSize: 14, fontWeight: '600' },
  uploadingText: { color: Colors.warning, fontSize: 12, marginTop: 4 },
});

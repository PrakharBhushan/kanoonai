import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Animated, Easing, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/designSystem';
import { hasPIN } from '../utils/pin';
import { t } from '../i18n';
import PanicConfirmModal from './PanicConfirmModal';

interface SOSButtonProps {
  onStartRecording: () => void;
}

export default function SOSButton({ onStartRecording }: SOSButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;

  // Continuous expanding pulse ring.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Scale punch on press.
  const punch = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = async () => {
    punch();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const pinSet = await hasPIN();
    if (!pinSet) {
      Alert.alert('KanoonAI', t('panic.noPINSet'));
      return;
    }
    setModalVisible(true);
  };

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <>
      <View style={styles.wrapper} pointerEvents="box-none">
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
        />
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
            <Text style={styles.label}>{t('panic.buttonLabel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <PanicConfirmModal
        visible={modalVisible}
        onConfirm={() => { setModalVisible(false); onStartRecording(); }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.emergency,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
  label: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});

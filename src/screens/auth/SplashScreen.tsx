import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Gradients } from '../../theme/designSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const seen = await AsyncStorage.getItem('kanoonai_onboarding_done');
      navigation.replace(seen ? 'Login' : 'Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={Gradients.brandDeep} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity, transform: [{ scale }] }]}>⚖️ KanoonAI</Animated.Text>
      <Animated.View style={{ opacity: taglineOpacity, alignItems: 'center' }}>
        <Text style={styles.tagline}>Know Your Rights. Stay Protected.</Text>
        <Text style={styles.taglineHi}>अपने अधिकार जानें। सुरक्षित रहें।</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 16 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center' },
  taglineHi: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
});

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../../navigation/types';
import { Gradients, Shadows } from '../../theme/designSystem';
import { Colors } from '../../theme/colors';
import AnimatedButton from '../../components/AnimatedButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'alert-circle' as const, gradient: Gradients.emergency,
    title: 'Emergency Mode', titleHi: 'आपातकालीन मोड',
    desc: 'Get instant legal information during any emergency situation.',
    descHi: 'किसी भी आपातकालीन स्थिति में तुरंत कानूनी जानकारी पाएं।',
  },
  {
    icon: 'book' as const, gradient: Gradients.brand,
    title: 'Learn the Law', titleHi: 'कानून सीखें',
    desc: 'Build your legal knowledge through engaging lessons and quizzes.',
    descHi: 'रोचक पाठों और प्रश्नोत्तरी के माध्यम से कानूनी ज्ञान बनाएं।',
  },
  {
    icon: 'shield-checkmark' as const, gradient: Gradients.success,
    title: 'Secure Recording', titleHi: 'सुरक्षित रिकॉर्डिंग',
    desc: 'Emergency recording uploads to cloud instantly — even if your phone is seized.',
    descHi: 'आपातकालीन रिकॉर्डिंग तुरंत क्लाउड पर अपलोड — फोन छीने जाने पर भी।',
  },
];

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollViewRef>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrent(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
      setCurrent(current + 1);
    } else {
      AsyncStorage.setItem('kanoonai_onboarding_done', '1');
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {SLIDES.map((slide, idx) => {
          const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
          const iconScale = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          return (
            <View key={idx} style={styles.slide}>
              <Animated.View style={{ opacity, transform: [{ scale: iconScale }] }}>
                <LinearGradient colors={slide.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <Ionicons name={slide.icon} size={64} color="#fff" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.titleHi}>{slide.titleHi}</Text>
              <Text style={styles.desc}>{slide.desc}</Text>
              <Text style={styles.descHi}>{slide.descHi}</Text>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
          return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} />;
        })}
      </View>

      <View style={styles.btnWrap}>
        <AnimatedButton
          label={current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          icon="arrow-forward"
        />
      </View>
    </View>
  );
}

type ScrollViewRef = { scrollTo: (opts: { x: number; animated: boolean }) => void };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  slide: { width, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', paddingTop: 70 },
  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32, ...Shadows.floating,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  titleHi: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginTop: 4, textAlign: 'center' },
  desc: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 16, lineHeight: 24 },
  descHi: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 24 },
  dot: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  btnWrap: { marginHorizontal: 24, marginBottom: 40 },
});

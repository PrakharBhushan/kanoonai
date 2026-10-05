import React, { useRef } from 'react';
import {
  Animated, Pressable, Text, StyleSheet, ActivityIndicator,
  ViewStyle, StyleProp, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gradients, Radius, Shadows, Motion } from '../theme/designSystem';
import { Colors } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'emergency' | 'success';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

const GRADIENT: Record<Exclude<Variant, 'secondary'>, readonly [string, string, ...string[]]> = {
  primary: Gradients.brand,
  emergency: Gradients.emergency,
  success: Gradients.success,
};

export default function AnimatedButton({
  label, onPress, variant = 'primary', loading = false, disabled = false, icon, style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isSecondary = variant === 'secondary';
  const inactive = loading || disabled;

  const pressIn = () => {
    if (inactive) return;
    Animated.spring(scale, { toValue: Motion.pressScale, ...Motion.spring }).start();
  };
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, ...Motion.spring }).start();
  const handlePress = () => {
    if (inactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const content = (
    <View style={styles.row}>
      {loading ? (
        <>
          <ActivityIndicator color={isSecondary ? Colors.primary : '#fff'} size="small" />
          <Text style={[styles.label, isSecondary && styles.labelSecondary, styles.loadingLabel]}>{label}</Text>
        </>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isSecondary ? Colors.primary : '#fff'}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, isSecondary && styles.labelSecondary]}>{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable onPress={handlePress} onPressIn={pressIn} onPressOut={pressOut} disabled={inactive}>
      <Animated.View
        style={[
          styles.wrap,
          { transform: [{ scale }], opacity: disabled ? 0.5 : 1 },
          !isSecondary && Shadows.pressable,
          style,
        ]}
      >
        {isSecondary ? (
          <View style={[styles.fill, styles.secondary]}>{content}</View>
        ) : (
          <LinearGradient
            colors={GRADIENT[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fill}
          >
            {content}
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.md, overflow: 'hidden' },
  fill: {
    paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md,
  },
  secondary: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  label: { color: '#fff', fontWeight: '800', fontSize: 17 },
  labelSecondary: { color: Colors.primary },
  loadingLabel: { marginLeft: 10 },
});

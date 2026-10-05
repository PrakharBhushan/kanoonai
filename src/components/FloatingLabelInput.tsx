import React, { useRef, useState, useEffect } from 'react';
import {
  Animated, TextInput, StyleSheet, View, TextInputProps, Easing,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Radius, Shadows } from '../theme/designSystem';

interface Props extends TextInputProps {
  label: string;
}

/**
 * Input with a label that floats above the text on focus/fill, plus a focus glow.
 */
export default function FloatingLabelInput({ label, value, onFocus, onBlur, ...rest }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  const float = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(float, {
      toValue: active ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [active]);

  const labelStyle = {
    top: float.interpolate({ inputRange: [0, 1], outputRange: [19, 7] }),
    fontSize: float.interpolate({ inputRange: [0, 1], outputRange: [15, 11] }),
    color: focused ? Colors.primary : colors.subtext,
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.card, borderColor: focused ? Colors.primary : colors.border },
        focused && Shadows.glow(Colors.primary),
      ]}
    >
      <Animated.Text style={[styles.label, labelStyle]} pointerEvents="none">{label}</Animated.Text>
      <TextInput
        {...rest}
        value={value}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%', minHeight: 58, borderRadius: Radius.md, borderWidth: 1.5,
    paddingHorizontal: 14, marginBottom: 16, justifyContent: 'flex-end',
  },
  label: { position: 'absolute', left: 14, fontWeight: '600' },
  input: { fontSize: 15, paddingTop: 22, paddingBottom: 10, fontWeight: '500' },
});

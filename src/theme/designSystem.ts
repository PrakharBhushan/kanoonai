import { Platform, ViewStyle } from 'react-native';
import { Colors } from './colors';

/**
 * KanoonAI Design System
 * Central tokens for a premium, cohesive, game-like UI.
 * Theme-aware where relevant (works with light/dark ThemeContext).
 */

// ---------------------------------------------------------------------------
// Gradients — tuples typed as readonly for expo-linear-gradient `colors` prop
// ---------------------------------------------------------------------------
export const Gradients = {
  brand: ['#1E4CB0', '#2563eb'] as const,
  brandDeep: ['#1e3a8a', '#1E4CB0'] as const,
  emergency: ['#ef4444', '#b91c1c'] as const,
  success: ['#22c55e', '#15803d'] as const,
  gold: ['#fbbf24', '#f59e0b'] as const,
  purple: ['#8b5cf6', '#6d28d9'] as const,
  slate: ['#334155', '#0f172a'] as const,
};

export type GradientKey = keyof typeof Gradients;

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------
export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// ---------------------------------------------------------------------------
// Shadows — soft, layered, premium. iOS shadow + Android elevation.
// ---------------------------------------------------------------------------
type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const makeShadow = (
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number
): ShadowStyle =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ShadowStyle;

export const Shadows = {
  /** Subtle resting elevation for cards. */
  card: makeShadow('#1e293b', 4, 0.08, 12, 3),
  /** Pronounced lift for floating elements (SOS, FABs, modals). */
  floating: makeShadow('#0f172a', 8, 0.18, 20, 10),
  /** Tight shadow for small pressables / pills. */
  pressable: makeShadow('#1e293b', 2, 0.12, 6, 2),
  /** Colored glow — pass a brand color for hero cards. */
  glow: (color: string) => makeShadow(color, 6, 0.35, 16, 8),
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const Typography = {
  display: { fontSize: 34, fontWeight: '900' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '800' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.2 },
};

// ---------------------------------------------------------------------------
// Animation timing constants — keep motion consistent across the app.
// ---------------------------------------------------------------------------
export const Motion = {
  fast: 150,
  base: 250,
  slow: 400,
  /** Standard spring config for press-scale interactions. */
  spring: { friction: 6, tension: 120, useNativeDriver: true },
  /** Press-in scale target for tactile buttons/cards. */
  pressScale: 0.97,
};

// ---------------------------------------------------------------------------
// Theme-aware surface helper — returns consistent card styling for a theme.
// ---------------------------------------------------------------------------
export const surface = (colors: typeof Colors.light): ViewStyle => ({
  backgroundColor: colors.card,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  ...Shadows.card,
});

export default {
  Gradients,
  Radius,
  Spacing,
  Shadows,
  Typography,
  Motion,
  surface,
};

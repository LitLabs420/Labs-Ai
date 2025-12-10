/**
 * Premium Color System
 * Modern, cohesive color palette for LitLabs
 */

export const colors = {
  // Primary - Electric Blue (modern, tech-forward)
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d7ff',
    300: '#a3b8ff',
    400: '#7a8eff',
    500: '#5566ff', // Main brand color
    600: '#4052e0',
    700: '#2f3dc1',
    800: '#202a9e',
    900: '#151b7f',
  },

  // Secondary - Vibrant Purple (creativity, AI)
  secondary: {
    50: '#faf5ff',
    100: '#f5ebff',
    200: '#ead9ff',
    300: '#dbbfff',
    400: '#c999ff',
    500: '#b366ff', // Secondary accent
    600: '#9d4edd',
    700: '#7b2cbf',
    800: '#5a189a',
    900: '#3c0767',
  },

  // Accent - Cyan (energy, innovation)
  accent: {
    50: '#f0fdff',
    100: '#e0fbff',
    200: '#b3f5ff',
    300: '#85efff',
    400: '#3ae0ff',
    500: '#00d9ff', // Accent color
    600: '#00a8cc',
    700: '#0077b6',
    800: '#005b9e',
    900: '#004279',
  },

  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral - Modern Gray
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Dark mode backgrounds
  dark: {
    bg: '#0a0a0a',
    surface: '#1a1a1a',
    card: '#262626',
    border: '#404040',
  },

  // Light mode backgrounds
  light: {
    bg: '#ffffff',
    surface: '#f9f9f9',
    card: '#f5f5f5',
    border: '#e5e5e5',
  },
};

/**
 * Tailwind CSS color mapping
 * Add this to tailwind.config.ts
 */
export const tailwindColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  neutral: colors.neutral,
};

/**
 * Typography scale
 */
export const typography = {
  h1: 'text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-bold tracking-tight',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-semibold',
  h6: 'text-base md:text-lg font-semibold',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-relaxed',
  caption: 'text-xs uppercase tracking-wide',
};

/**
 * Spacing scale
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

/**
 * Shadow system (modern depth)
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Glow effects
  glow: {
    primary: '0 0 20px rgba(85, 102, 255, 0.4)',
    secondary: '0 0 20px rgba(179, 102, 255, 0.4)',
    accent: '0 0 20px rgba(0, 217, 255, 0.4)',
  },

  // Neon effects (cyberpunk style)
  neon: {
    primary: '0 0 10px rgba(85, 102, 255, 0.8), 0 0 20px rgba(85, 102, 255, 0.6)',
    secondary: '0 0 10px rgba(179, 102, 255, 0.8), 0 0 20px rgba(179, 102, 255, 0.6)',
  },
};

/**
 * Animation presets
 */
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 1, repeat: Infinity },
    },
  },
};

/**
 * Gradient presets
 */
export const gradients = {
  brand: 'linear-gradient(135deg, #5566ff 0%, #b366ff 100%)',
  brandReverse: 'linear-gradient(135deg, #b366ff 0%, #5566ff 100%)',
  aurora: 'linear-gradient(135deg, #5566ff 0%, #00d9ff 50%, #b366ff 100%)',
  cyberpunk: 'linear-gradient(90deg, #5566ff 0%, #ff006e 50%, #00d9ff 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%)',
  midnight: 'linear-gradient(135deg, #0a0a0a 0%, #262626 50%, #404040 100%)',
};

export default {
  colors,
  tailwindColors,
  typography,
  spacing,
  shadows,
  animations,
  gradients,
};

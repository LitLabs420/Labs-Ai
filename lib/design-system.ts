/**
 * LitLabs AI Premium Design System
 * 
 * Comprehensive design system with:
 * - Premium color palettes
 * - Typography scales
 * - Spacing system
 * - Shadow system
 * - Border radius system
 * - Animation system
 * - Theme definitions
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colorPalettes = {
  darkLuxury: {
    background: '#0a0e27',
    surface: '#141829',
    surfaceAlt: '#1a1f3a',
    border: '#2a2f4a',
    text: '#f5f5f7',
    textSecondary: '#a0a0a8',
    textTertiary: '#6b6b75',
    primary: '#c9a961',
    primaryLight: '#e5c78e',
    primaryDark: '#a68340',
    accent: '#ff6b9d',
    accentLight: '#ff99b9',
    accentDark: '#e64a7d',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#3b82f6',
  },

  lightLuxury: {
    background: '#fafaf9',
    surface: '#ffffff',
    surfaceAlt: '#f5f3f0',
    border: '#e7e5e4',
    text: '#1c1917',
    textSecondary: '#57534e',
    textTertiary: '#92908d',
    primary: '#92400e',
    primaryLight: '#d97706',
    primaryDark: '#6b3410',
    accent: '#be185d',
    accentLight: '#ec4899',
    accentDark: '#831843',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },

  modernTech: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#334155',
    border: '#475569',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#6d28d9',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
  },

  creative: {
    background: '#0d0221',
    surface: '#1a0033',
    surfaceAlt: '#2d0a4e',
    border: '#4a1a6f',
    text: '#f0e6ff',
    textSecondary: '#d4b9ff',
    textTertiary: '#9d7bd8',
    primary: '#ff006e',
    primaryLight: '#ff1493',
    primaryDark: '#d90061',
    accent: '#ffbe0b',
    accentLight: '#ffd60a',
    accentDark: '#e5ad08',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  minimalist: {
    background: '#ffffff',
    surface: '#f9f9f9',
    surfaceAlt: '#f3f3f3',
    border: '#e5e5e5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#000000',
    primaryLight: '#333333',
    primaryDark: '#000000',
    accent: '#666666',
    accentLight: '#999999',
    accentDark: '#333333',
    success: '#22863a',
    warning: '#b08800',
    error: '#cb2431',
    info: '#0366d6',
  },

  custom: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceAlt: '#eeeeee',
    border: '#cccccc',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#1e40af',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#6d28d9',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  fontFamily: {
    // Primary: Premium serif (like Envato Elements)
    serif: "'Lora', 'Georgia', serif",
    // Secondary: Modern sans-serif
    sans: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    // Accent: Bold geometric
    accent: "'Space Grotesk', 'Poppins', sans-serif",
    // Mono: For code
    mono: "'Fira Code', 'Monaco', monospace",
  },
  
  sizes: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '28px' },
    '2xl': { size: '24px', lineHeight: '32px' },
    '3xl': { size: '30px', lineHeight: '36px' },
    '4xl': { size: '36px', lineHeight: '44px' },
    '5xl': { size: '48px', lineHeight: '56px' },
    '6xl': { size: '60px', lineHeight: '68px' },
  },

  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  styles: {
    h1: {
      size: '48px',
      weight: 700,
      lineHeight: '56px',
      letterSpacing: '-1px',
      family: 'serif',
    },
    h2: {
      size: '36px',
      weight: 700,
      lineHeight: '44px',
      letterSpacing: '-0.5px',
      family: 'serif',
    },
    h3: {
      size: '28px',
      weight: 600,
      lineHeight: '36px',
      family: 'sans',
    },
    h4: {
      size: '24px',
      weight: 600,
      lineHeight: '32px',
      family: 'sans',
    },
    h5: {
      size: '20px',
      weight: 600,
      lineHeight: '28px',
      family: 'sans',
    },
    h6: {
      size: '16px',
      weight: 600,
      lineHeight: '24px',
      family: 'sans',
    },
    body: {
      size: '16px',
      weight: 400,
      lineHeight: '24px',
      family: 'sans',
    },
    bodySm: {
      size: '14px',
      weight: 400,
      lineHeight: '20px',
      family: 'sans',
    },
    label: {
      size: '12px',
      weight: 600,
      lineHeight: '16px',
      letterSpacing: '0.5px',
      family: 'sans',
    },
    caption: {
      size: '12px',
      weight: 400,
      lineHeight: '16px',
      family: 'sans',
    },
  },
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  // Premium shadows
  premium: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
  premiumLg: '0 40px 80px -20px rgba(0, 0, 0, 0.2)',
};

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

export const animations = {
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  transitions: {
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'top 250ms cubic-bezier(0.4, 0, 0.2, 1), left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const componentSizes = {
  button: {
    xs: { padding: '6px 12px', fontSize: '12px', height: '28px' },
    sm: { padding: '8px 16px', fontSize: '14px', height: '32px' },
    md: { padding: '10px 20px', fontSize: '14px', height: '40px' },
    lg: { padding: '12px 24px', fontSize: '16px', height: '48px' },
    xl: { padding: '14px 32px', fontSize: '16px', height: '56px' },
  },

  input: {
    sm: { padding: '8px 12px', fontSize: '14px', height: '32px' },
    md: { padding: '10px 16px', fontSize: '14px', height: '40px' },
    lg: { padding: '12px 20px', fontSize: '16px', height: '48px' },
  },

  card: {
    sm: { padding: '16px', borderRadius: '8px' },
    md: { padding: '24px', borderRadius: '12px' },
    lg: { padding: '32px', borderRadius: '16px' },
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// THEME INTERFACE
// ============================================================================

export interface Theme {
  name: string;
  description: string;
  colors: typeof colorPalettes.darkLuxury;
  isDark: boolean;
}

export const themes: Record<string, Theme> = {
  darkLuxury: {
    name: 'Dark Luxury',
    description: 'Elegant, premium dark theme with gold accents',
    colors: colorPalettes.darkLuxury,
    isDark: true,
  },
  lightLuxury: {
    name: 'Light Luxury',
    description: 'Elegant, premium light theme with warm accents',
    colors: colorPalettes.lightLuxury,
    isDark: false,
  },
  modernTech: {
    name: 'Modern Tech',
    description: 'Contemporary, vibrant tech theme',
    colors: colorPalettes.modernTech,
    isDark: true,
  },
  creative: {
    name: 'Creative',
    description: 'Vibrant, colorful creative theme',
    colors: colorPalettes.creative,
    isDark: true,
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean, simple minimalist theme',
    colors: colorPalettes.minimalist,
    isDark: false,
  },
  custom: {
    name: 'Custom',
    description: 'Customizable user theme',
    colors: colorPalettes.custom,
    isDark: false,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get CSS custom properties for a theme
 */
export function getThemeCSSVariables(colors: typeof colorPalettes.darkLuxury) {
  return {
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-surface-alt': colors.surfaceAlt,
    '--color-border': colors.border,
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-tertiary': colors.textTertiary,
    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-accent': colors.accent,
    '--color-accent-light': colors.accentLight,
    '--color-accent-dark': colors.accentDark,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
  } as React.CSSProperties;
}

/**
 * Blend two colors together
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const blend = (c1: number, c2: number) => Math.round(c1 + (c2 - c1) * ratio);

  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r = blend(
    parseInt(hex1.substr(0, 2), 16),
    parseInt(hex2.substr(0, 2), 16)
  );
  const g = blend(
    parseInt(hex1.substr(2, 2), 16),
    parseInt(hex2.substr(2, 2), 16)
  );
  const b = blend(
    parseInt(hex1.substr(4, 2), 16),
    parseInt(hex2.substr(4, 2), 16)
  );

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default {
  colorPalettes,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  componentSizes,
  breakpoints,
  themes,
};

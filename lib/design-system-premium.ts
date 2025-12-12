/**
 * Premium Design System
 * Centralized design tokens and utilities for consistent styling across the application
 */

export const DesignSystem = {
  colors: {
    primary: {
      50: '#ecf8ff',
      100: '#cef1fe',
      200: '#a3e6fd',
      300: '#65d9fc',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#0f3d47',
    },
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3f0f5c',
    },
    success: {
      50: '#f0fdf4',
      500: '#10b981',
      600: '#059669',
      900: '#065f46',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Lora, Georgia, serif',
      mono: '"Fira Code", Monaco, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      '7xl': '72px',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.6',
      loose: '2',
    },
    letterSpacing: {
      tight: '-0.015em',
      normal: '0em',
      wide: '0.015em',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
    '5xl': '96px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(6, 182, 212, 0.15)',
    '3xl': '0 35px 60px rgba(0, 0, 0, 0.3)',
    'glow-primary': '0 0 20px rgba(6, 182, 212, 0.5)',
    'glow-accent': '0 0 20px rgba(168, 85, 247, 0.5)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Pre-built button classes for consistent button styling
 */
export const buttonClasses = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300',
  secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 hover:shadow-md active:scale-95 transition-all duration-300',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:scale-95 transition-all duration-300',
  ghost: 'text-primary-600 hover:bg-primary-50 active:scale-95 transition-all duration-300',
  danger: 'bg-error-500 text-white hover:bg-error-600 hover:shadow-lg active:scale-95 transition-all duration-300',
  success: 'bg-success-500 text-white hover:bg-success-600 hover:shadow-lg active:scale-95 transition-all duration-300',
};

/**
 * Pre-built card classes for consistent card styling
 */
export const cardClasses = {
  base: 'bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4',
  hover: 'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300',
  interactive: 'cursor-pointer hover:scale-102 hover:shadow-lg',
};

/**
 * Pre-built input classes for consistent input styling
 */
export const inputClasses = {
  base: 'px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400',
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  error: 'border-error-500 focus:ring-error-500',
};

/**
 * Gradient utilities
 */
export const gradients = {
  'primary-accent': 'linear-gradient(135deg, #06b6d4, #a855f7)',
  'primary-dark': 'linear-gradient(135deg, #06b6d4, #0e7490)',
  'glow-primary': 'radial-gradient(circle, rgba(6, 182, 212, 0.1), transparent)',
  'success-primary': 'linear-gradient(135deg, #10b981, #06b6d4)',
  'premium-dark': 'linear-gradient(180deg, #06b6d4, #8b5cf6)',
};

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: 'animation: fadeIn 0.3s ease-in-out',
  slideInUp: 'animation: slideInUp 0.4s ease-out',
  slideInDown: 'animation: slideInDown 0.4s ease-out',
  slideInLeft: 'animation: slideInLeft 0.4s ease-out',
  slideInRight: 'animation: slideInRight 0.4s ease-out',
  float: 'animation: float 3s ease-in-out infinite',
  glow: 'animation: glow 2s ease-in-out infinite',
  shimmer: 'animation: shimmer 2s infinite',
  pulse: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

export default DesignSystem;

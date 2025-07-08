/**
 * NetCop AI Hub Design System
 * Centralized design tokens and style utilities
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Secondary Colors
  secondary: {
    500: '#8b5cf6',
    600: '#7c3aed'
  },
  
  // Success Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857'
  },
  
  // Warning Colors
  warning: {
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  // Danger Colors
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  // Special Colors
  white: '#ffffff',
  black: '#000000'
} as const

// Gradient Presets
export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  primaryReverse: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  neutral: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  
  // Background Gradients
  bgPrimary: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
  bgHero: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
  
  // Text Gradients
  textPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)'
} as const

// Spacing Scale (using clamp for responsive spacing)
export const spacing = {
  xs: 'clamp(4px, 1vw, 8px)',
  sm: 'clamp(8px, 2vw, 12px)',
  md: 'clamp(12px, 3vw, 16px)',
  lg: 'clamp(16px, 4vw, 24px)',
  xl: 'clamp(20px, 5vw, 32px)',
  '2xl': 'clamp(24px, 6vw, 48px)',
  '3xl': 'clamp(32px, 8vw, 64px)',
  '4xl': 'clamp(40px, 10vw, 80px)',
  '5xl': 'clamp(48px, 12vw, 96px)'
} as const

// Typography Scale
export const typography = {
  // Font Sizes (responsive with clamp)
  fontSize: {
    xs: 'clamp(10px, 2.5vw, 12px)',
    sm: 'clamp(12px, 3vw, 14px)',
    base: 'clamp(14px, 3.5vw, 16px)',
    lg: 'clamp(16px, 4vw, 18px)',
    xl: 'clamp(18px, 4.5vw, 20px)',
    '2xl': 'clamp(20px, 5vw, 24px)',
    '3xl': 'clamp(24px, 6vw, 32px)',
    '4xl': 'clamp(28px, 7vw, 40px)',
    '5xl': 'clamp(32px, 8vw, 48px)',
    '6xl': 'clamp(48px, 12vw, 64px)',
    '7xl': 'clamp(64px, 16vw, 96px)'
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.1',
    normal: '1.4',
    relaxed: '1.6',
    loose: '1.8'
  },
  
  // Font Family
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'sans-serif']
  }
} as const

// Border Radius Scale
export const borderRadius = {
  none: '0',
  sm: 'clamp(4px, 1vw, 6px)',
  md: 'clamp(6px, 2vw, 8px)',
  lg: 'clamp(8px, 2vw, 12px)',
  xl: 'clamp(12px, 3vw, 16px)',
  '2xl': 'clamp(16px, 4vw, 20px)',
  '3xl': 'clamp(20px, 5vw, 24px)',
  full: '9999px'
} as const

// Box Shadow Presets
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Colored Shadows
  primary: '0 4px 15px rgba(59, 130, 246, 0.3)',
  success: '0 4px 15px rgba(16, 185, 129, 0.3)',
  warning: '0 4px 15px rgba(245, 158, 11, 0.3)',
  danger: '0 4px 15px rgba(239, 68, 68, 0.3)'
} as const

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const

// Transition Presets
export const transitions = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
  transform: 'transform 0.2s ease',
  colors: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
} as const

// Breakpoints (for media queries)
export const breakpoints = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Animation Presets
export const animations = {
  pulse: {
    animation: 'pulse 1.5s infinite',
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `
  },
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `
  },
  slideUp: {
    animation: 'slideUp 0.3s ease-out',
    keyframes: `
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `
  }
} as const

// Export all design tokens
export const designSystem = {
  colors,
  gradients,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  animations
} as const

// Type exports for TypeScript
export type Color = keyof typeof colors
export type Gradient = keyof typeof gradients
export type Spacing = keyof typeof spacing
export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight
export type BorderRadius = keyof typeof borderRadius
export type Shadow = keyof typeof shadows
export type ZIndex = keyof typeof zIndex
export type Transition = keyof typeof transitions
export type Breakpoint = keyof typeof breakpoints
export type Animation = keyof typeof animations
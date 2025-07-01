/**
 * Style Utilities for NetCop AI Hub
 * Reusable style objects and helper functions
 */

import { CSSProperties } from 'react'
import { colors, gradients, spacing, typography, borderRadius, shadows, transitions } from './designSystem'

// Common Style Patterns
export const stylePatterns = {
  // Glassmorphism Card Pattern
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: shadows.xl,
    borderRadius: borderRadius.xl
  },

  // Modal/Overlay Background
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  // Flexible Container
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column' as const
  },

  // Responsive Grid Pattern
  responsiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
    gap: spacing.lg
  },

  // Mobile Grid Pattern
  mobileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
    gap: spacing.md
  },

  // Absolute Fill
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  // Hidden Scrollbar
  hiddenScrollbar: {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }
} as const

// Button Style Variants
export const buttonStyles = {
  // Base Button Style
  base: {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.normal,
    minHeight: '44px', // Touch target compliance
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },

  // Primary Button
  primary: {
    background: gradients.primary,
    color: colors.white,
    boxShadow: shadows.primary
  },

  // Secondary Button
  secondary: {
    background: colors.white,
    color: colors.gray[700],
    border: `2px solid ${colors.gray[200]}`,
    boxShadow: shadows.md
  },

  // Success Button
  success: {
    background: gradients.success,
    color: colors.white,
    boxShadow: shadows.success
  },

  // Warning Button
  warning: {
    background: gradients.warning,
    color: colors.white,
    boxShadow: shadows.warning
  },

  // Danger Button
  danger: {
    background: gradients.danger,
    color: colors.white,
    boxShadow: shadows.danger
  },

  // Disabled Button
  disabled: {
    background: colors.gray[300],
    color: colors.gray[500],
    cursor: 'not-allowed',
    opacity: 0.6
  },

  // Loading Button
  loading: {
    cursor: 'not-allowed',
    opacity: 0.7
  }
} as const

// Input Style Variants
export const inputStyles = {
  // Base Input Style
  base: {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    border: `2px solid ${colors.gray[200]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    transition: transitions.colors,
    minHeight: '44px', // Touch target compliance
    fontFamily: typography.fontFamily.sans.join(', ')
  },

  // Focused Input
  focused: {
    borderColor: colors.primary[500],
    outline: 'none',
    boxShadow: `0 0 0 3px ${colors.primary[100]}`
  },

  // Error Input
  error: {
    borderColor: colors.danger[500],
    boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`
  },

  // Success Input
  success: {
    borderColor: colors.success[500],
    boxShadow: `0 0 0 3px rgba(16, 185, 129, 0.1)`
  }
} as const

// Card Style Variants
export const cardStyles = {
  // Base Card
  base: {
    ...stylePatterns.glassmorphism,
    padding: spacing.lg
  },

  // Elevated Card
  elevated: {
    ...stylePatterns.glassmorphism,
    padding: spacing.xl,
    boxShadow: shadows['2xl']
  },

  // Interactive Card (hoverable)
  interactive: {
    ...stylePatterns.glassmorphism,
    padding: spacing.lg,
    cursor: 'pointer',
    transition: transitions.normal
  },

  // Compact Card
  compact: {
    ...stylePatterns.glassmorphism,
    padding: spacing.md
  }
} as const

// Text Style Variants
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: colors.gray[900]
  },

  h2: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: colors.gray[900]
  },

  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    color: colors.gray[800]
  },

  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    color: colors.gray[800]
  },

  // Body Text
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.gray[700]
  },

  // Small Text
  small: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    color: colors.gray[600]
  },

  // Caption Text
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal,
    color: colors.gray[500]
  },

  // Gradient Text
  gradient: {
    background: gradients.textPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: typography.fontWeight.bold
  }
} as const

// Helper Functions
export const styleHelpers = {
  // Create responsive clamp value
  clamp: (min: string, preferred: string, max: string) => 
    `clamp(${min}, ${preferred}, ${max})`,

  // Create media query
  mediaQuery: (breakpoint: string) => 
    `@media (max-width: ${breakpoint})`,

  // Combine multiple style objects
  combine: (...styles: (CSSProperties | undefined)[]) => 
    Object.assign({}, ...styles.filter(Boolean)),

  // Create hover style handler
  createHoverHandler: (
    normalStyle: CSSProperties,
    hoverStyle: CSSProperties
  ) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, hoverStyle)
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, normalStyle)
    }
  }),

  // Create focus style handler
  createFocusHandler: (
    normalStyle: CSSProperties,
    focusStyle: CSSProperties
  ) => ({
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, focusStyle)
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, normalStyle)
    }
  }),

  // Get button style combination
  getButtonStyle: (
    variant: keyof typeof buttonStyles = 'primary',
    disabled = false,
    loading = false
  ) => {
    const styles = [buttonStyles.base, buttonStyles[variant]]
    
    if (disabled) styles.push(buttonStyles.disabled)
    if (loading) styles.push(buttonStyles.loading)
    
    return styleHelpers.combine(...styles)
  },

  // Get input style combination
  getInputStyle: (
    state: 'normal' | 'focused' | 'error' | 'success' = 'normal'
  ) => {
    const styles = [inputStyles.base]
    
    if (state !== 'normal') styles.push(inputStyles[state])
    
    return styleHelpers.combine(...styles)
  },

  // Get card style combination
  getCardStyle: (variant: keyof typeof cardStyles = 'base') => 
    cardStyles[variant],

  // Get text style
  getTextStyle: (variant: keyof typeof textStyles = 'body') => 
    textStyles[variant]
}

// Animation utilities
export const animationUtils = {
  // Scale animation on click
  scaleOnClick: {
    transition: transitions.fast,
    cursor: 'pointer',
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(0.95)'
    },
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
    }
  },

  // Hover lift effect
  hoverLift: {
    transition: transitions.normal,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = shadows['2xl']
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = shadows.lg
    }
  },

  // Scale on hover
  scaleOnHover: {
    transition: transitions.normal,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1.02)'
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
    }
  }
}
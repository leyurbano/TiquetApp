// src/styles/typography.ts
import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * 📝 Sistema de tipografía global para TiquetApp
 * Define tamaños, pesos y estilos de texto consistentes
 */

// 📏 Tamaños de fuente base
export const fontSizes = {
  xs: 10,    // Extra pequeño
  sm: 12,    // Pequeño
  base: 14,  // Base (por defecto)
  md: 16,    // Mediano
  lg: 18,    // Grande
  xl: 20,    // Extra grande
  '2xl': 24, // 2X grande
  '3xl': 30, // 3X grande
  '4xl': 36, // 4X grande
  '5xl': 48, // 5X grande
} as const;

// ⚖️ Pesos de fuente
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// 📐 Alturas de línea
export const lineHeights = {
  tight: 20,    // Cambiar de 1.2 a valor absoluto
  normal: 24,   // Cambiar de 1.4 a valor absoluto  
  relaxed: 28,  // Cambiar de 1.6 a valor absoluto
  loose: 32,    // Cambiar de 1.8 a valor absoluto
} as const;

// 🎨 Estilos de texto predefinidos
export const textStyles = {
  // 🏷️ Encabezados
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.gray[900],
  } as TextStyle,

  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.gray[900],
  } as TextStyle,

  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    color: colors.gray[800],
  } as TextStyle,

  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    color: colors.gray[800],
  } as TextStyle,

  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.gray[700],
  } as TextStyle,

  h6: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.gray[700],
  } as TextStyle,

  // 📄 Texto de cuerpo
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    color: colors.gray[700],
  } as TextStyle,

  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    color: colors.gray[700],
  } as TextStyle,

  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    color: colors.gray[600],
  } as TextStyle,

  // 🏷️ Etiquetas y captions
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    color: colors.gray[500],
  } as TextStyle,

  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.gray[700],
  } as TextStyle,

  // 🔗 Enlaces y botones
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.primary[600],
    textDecorationLine: 'underline',
  } as TextStyle,

  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    color: colors.gray[900], // ← Agregamos color que faltaba
  } as TextStyle,

  // 💰 Estilos específicos para la app
  price: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.primary[600],
  } as TextStyle,

  currency: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    color: colors.success[600],
  } as TextStyle,

  // ⚠️ Estados
  error: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    color: colors.danger[600],
  } as TextStyle,

  success: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.success[600],
  } as TextStyle,

  warning: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.warning[600],
  } as TextStyle,
} as const;

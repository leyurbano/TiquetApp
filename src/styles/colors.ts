// src/styles/colors.ts
/**
 * 🎨 Sistema de colores globales para TiquetApp
 * Centraliza todos los colores para mantener consistencia visual
 */

export const colors = {
  // 🔵 Colores primarios (azul - marca principal)
  primary: {
    50: '#eff6ff',   // Muy claro
    100: '#dbeafe',  // Claro
    500: '#3b82f6',  // Principal
    600: '#2563eb',  // Más oscuro
    700: '#1d4ed8',  // Oscuro
    900: '#1e3a8a',  // Muy oscuro
  },

  // 🟢 Colores de éxito (verde)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // 🔴 Colores de error/peligro (rojo)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // 🟡 Colores de advertencia (amarillo/naranja)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // ℹ️ Colores de información (azul claro)
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
  },

  // ⚫ Escala de grises
  gray: {
    50: '#f9fafb',   // Casi blanco
    100: '#f3f4f6',  // Muy claro
    200: '#e5e7eb',  // Claro
    300: '#d1d5db',  // Claro-medio
    400: '#9ca3af',  // Medio
    500: '#6b7280',  // Medio-oscuro
    600: '#4b5563',  // Oscuro
    700: '#374151',  // Más oscuro
    800: '#1f2937',  // Muy oscuro
    900: '#111827',  // Casi negro
  },

  // 📱 Colores del sistema
  system: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  // 🌟 Colores especiales para la app
  app: {
    background: '#f9fafb',      // Fondo principal
    surface: '#ffffff',         // Fondo de tarjetas
    border: '#e5e7eb',         // Bordes
    placeholder: '#9ca3af',     // Texto placeholder
    shadow: 'rgba(0, 0, 0, 0.1)', // Sombras
  },
} as const; // ← 'as const' para que TypeScript infiera tipos exactos

// 📱 Alias para colores más usados (shortcuts)
export const commonColors = {
  primary: colors.primary[600],
  success: colors.success[600],
  danger: colors.danger[500],
  warning: colors.warning[500],
  info: colors.info[500],
  text: colors.gray[800],
  textSecondary: colors.gray[600],
  textLight: colors.gray[400],
  background: colors.app.background,
  surface: colors.app.surface,
  border: colors.app.border,
} as const;

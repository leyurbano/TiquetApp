// src/styles/spacing.ts
/**
 * 📐 Sistema de espaciado global para TiquetApp
 * Define márgenes, paddings y espacios consistentes
 */

// 📏 Espacios base (usando múltiplos de 4 para consistencia)
export const spacing = {
  xs: 4,    // Extra pequeño
  sm: 8,    // Pequeño
  md: 12,   // Mediano
  lg: 16,   // Grande
  xl: 20,   // Extra grande
  '2xl': 24, // 2X grande
  '3xl': 32, // 3X grande
  '4xl': 40, // 4X grande
  '5xl': 48, // 5X grande
  '6xl': 64, // 6X grande
} as const;

// 📱 Espaciado específico para componentes
export const componentSpacing = {
  // 🃏 Espaciado de tarjetas
  card: {
    padding: spacing.lg,
    margin: spacing.md,
    gap: spacing.md,
  },

  // 🔘 Espaciado de botones
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },

  // 📝 Espaciado de inputs
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },

  // 📱 Espaciado de pantallas
  screen: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  // 📋 Espaciado de listas
  list: {
    paddingVertical: spacing.md,
    itemSpacing: spacing.md,
  },

  // 🎯 Espaciado de secciones
  section: {
    marginBottom: spacing['3xl'],
    paddingVertical: spacing['2xl'],
  },
} as const;

// 🔄 Shortcuts comunes
export const commonSpacing = {
  screenPadding: spacing.lg,
  cardPadding: spacing.lg,
  buttonPadding: spacing.md,
  listItemSpacing: spacing.md,
  sectionSpacing: spacing['2xl'],
} as const;

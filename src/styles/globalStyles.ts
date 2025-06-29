// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { colors, commonColors } from './colors';
import { textStyles } from './typography';
import { spacing, commonSpacing } from './spacing';

/**
 * 🌐 Estilos globales reutilizables para toda la app
 * Combina colores, tipografía y espaciado en estilos comunes
 */

export const globalStyles = StyleSheet.create({
  // 📱 Contenedores base
  container: {
    flex: 1,
    backgroundColor: commonColors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: commonColors.background,
    paddingHorizontal: commonSpacing.screenPadding,
  },

  safeArea: {
    flex: 1,
    backgroundColor: commonColors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  // 🎯 Centrado
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centeredVertical: {
    justifyContent: 'center',
  },

  centeredHorizontal: {
    alignItems: 'center',
  },

  // 📐 Flexbox comunes
  row: {
    flexDirection: 'row',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  // 🃏 Superficies (tarjetas, modales, etc)
  surface: {
    backgroundColor: commonColors.surface,
    borderRadius: 12,
    shadowColor: colors.system.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  surfaceFlat: {
    backgroundColor: commonColors.surface,
    borderRadius: 8,
  },

  // 🔲 Bordes
  border: {
    borderWidth: 1,
    borderColor: commonColors.border,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: commonColors.border,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: commonColors.border,
  },

  // 📏 Espaciado comunes
  marginVerticalSm: {
    marginVertical: spacing.sm,
  },

  marginVerticalMd: {
    marginVertical: spacing.md,
  },

  marginVerticalLg: {
    marginVertical: spacing.lg,
  },

  marginHorizontalSm: {
    marginHorizontal: spacing.sm,
  },

  marginHorizontalMd: {
    marginHorizontal: spacing.md,
  },

  marginHorizontalLg: {
    marginHorizontal: spacing.lg,
  },

  paddingVerticalSm: {
    paddingVertical: spacing.sm,
  },

  paddingVerticalMd: {
    paddingVertical: spacing.md,
  },

  paddingVerticalLg: {
    paddingVertical: spacing.lg,
  },

  paddingHorizontalSm: {
    paddingHorizontal: spacing.sm,
  },

  paddingHorizontalMd: {
    paddingHorizontal: spacing.md,
  },

  paddingHorizontalLg: {
    paddingHorizontal: spacing.lg,
  },

  // 📝 Textos globales
  textCenter: {
    textAlign: 'center',
  },

  textLeft: {
    textAlign: 'left',
  },

  textRight: {
    textAlign: 'right',
  },

  // 🎨 Estados visuales
  opacity50: {
    opacity: 0.5,
  },

  opacity75: {
    opacity: 0.75,
  },

  // 📱 Específicos de la app
  header: {
    backgroundColor: commonColors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.border,
  },

  footer: {
    backgroundColor: commonColors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: commonColors.border,
  },

  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
});

// 🔤 Exportar estilos de texto globales
export const globalTextStyles = StyleSheet.create({
  h1: textStyles.h1,
  h2: textStyles.h2,
  h3: textStyles.h3,
  h4: textStyles.h4,
  h5: textStyles.h5,
  h6: textStyles.h6,
  body: textStyles.body,
  bodyLarge: textStyles.bodyLarge,
  bodySmall: textStyles.bodySmall,
  caption: textStyles.caption,
  label: textStyles.label,
  link: textStyles.link,
  button: textStyles.button,
  price: textStyles.price,
  currency: textStyles.currency,
  error: textStyles.error,
  success: textStyles.success,
  warning: textStyles.warning,
});

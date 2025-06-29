// src/components/ui/Badge.tsx
import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

/**
 * 🎯 Props del componente Badge
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * 🎯 Badge/Insignia reutilizable para estados y categorías
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <Text style={[badgeStyle, textStyles]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
    overflow: 'hidden',
  },
  baseText: {
    fontWeight: '600',
  },

  // Variants
  primary: {
    backgroundColor: '#dbeafe',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  success: {
    backgroundColor: '#d1fae5',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  danger: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#e0f2fe',
  },

  // Text variants
  primaryText: {
    color: '#1e40af',
  },
  secondaryText: {
    color: '#4b5563',
  },
  successText: {
    color: '#065f46',
  },
  warningText: {
    color: '#92400e',
  },
  dangerText: {
    color: '#b91c1c',
  },
  infoText: {
    color: '#0369a1',
  },

  // Sizes
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // Size text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});

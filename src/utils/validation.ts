// src/utils/validation.ts

/**
 * Valida si un email tiene un formato correcto
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un string no está vacío
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida si un número es positivo
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

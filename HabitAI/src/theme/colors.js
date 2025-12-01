/**
 * Цветовая схема HabitAI
 * Минималистичная тёмная тема
 */

export const COLORS = {
  // Основные цвета
  background: '#0A0A0A',        // Основной фон
  card: '#1A1A1A',              // Фон карточек
  accent: '#00FF88',            // Акцентный цвет (зелёный)

  // Текст
  text: '#FFFFFF',              // Основной текст
  textSecondary: '#888888',     // Вторичный текст
  textTertiary: '#444444',      // Третичный текст (подсказки)

  // Состояния
  error: '#FF4444',             // Ошибки, пропуски
  success: '#00FF88',           // Успех, завершение
  warning: '#FFAA00',           // Предупреждения

  // Дополнительные
  border: '#222222',            // Границы
  overlay: 'rgba(0, 0, 0, 0.8)', // Оверлей модалок
};

/**
 * Типографика
 */
export const FONTS = {
  sizes: {
    small: 14,
    base: 16,
    h3: 18,
    h2: 20,
    h1: 28,
    hero: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

/**
 * Отступы
 */
export const SPACING = {
  xs: 5,
  sm: 10,
  md: 20,
  lg: 40,
  xl: 60,
};

/**
 * Радиусы скругления
 */
export const RADIUS = {
  sm: 10,
  md: 20,
  lg: 30,
  full: 9999,
};

/**
 * Тени
 */
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

export default {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
};

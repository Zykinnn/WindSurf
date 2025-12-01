/**
 * Константы приложения HabitAI
 */

// Длительность формирования привычки (дней)
export const HABIT_DURATION = 66;

// Режимы ввода
export const INPUT_MODES = {
  VOICE: 'voice',
  TEXT: 'text',
};

// Режимы ответа AI
export const RESPONSE_MODES = {
  VOICE: 'voice',
  TEXT: 'text',
  AUTO: 'auto', // Голос если пользователь использовал голос
};

// Статусы привычки
export const HABIT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

// Типы логов
export const LOG_TYPES = {
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

// AsyncStorage ключи
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@habitai:onboarding_completed',
  USER_ID: '@habitai:user_id',
  SETTINGS: '@habitai:settings',
  CURRENT_HABIT: '@habitai:current_habit',
};

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
  inputMode: INPUT_MODES.VOICE,
  responseMode: RESPONSE_MODES.AUTO,
  voiceSpeed: 0.7,
  voicePitch: 1.0,
  language: 'ru-RU',
  reminderTime: '07:00',
  eveningCheckInTime: '21:00',
  enableNotifications: true,
  enableSound: true,
  enableHaptic: true,
};

// Параметры голосового ввода
export const VOICE_CONFIG = {
  language: 'ru-RU',
  autoStopTimeout: 1000, // Автоостановка через 1 сек тишины
  maxRecordingTime: 60000, // Макс 60 секунд записи
};

// Параметры TTS
export const TTS_CONFIG = {
  language: 'ru-RU',
  defaultSpeed: 0.7,
  defaultPitch: 1.0,
  pauseAfterSentence: 500, // мс
};

// Пороги для streak celebration
export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 40, 50, 66];

// Максимальная длина сообщения
export const MAX_MESSAGE_LENGTH = 500;

// Время до таймаута API запроса
export const API_TIMEOUT = 30000; // 30 секунд

// Количество попыток retry
export const MAX_RETRIES = 3;

// Backoff для retry (мс)
export const RETRY_DELAYS = [1000, 2000, 4000];

export default {
  HABIT_DURATION,
  INPUT_MODES,
  RESPONSE_MODES,
  HABIT_STATUS,
  LOG_TYPES,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  VOICE_CONFIG,
  TTS_CONFIG,
  STREAK_MILESTONES,
  MAX_MESSAGE_LENGTH,
  API_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAYS,
};

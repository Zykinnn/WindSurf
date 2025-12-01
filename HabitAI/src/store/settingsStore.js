/**
 * Settings Store - Управление настройками приложения
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS, INPUT_MODES, RESPONSE_MODES } from '../utils/constants';

const useSettingsStore = create((set, get) => ({
  // Настройки
  settings: DEFAULT_SETTINGS,

  // Состояния
  isLoading: false,
  error: null,

  /**
   * Загрузить настройки из хранилища
   */
  loadSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);

      if (settingsData) {
        const settings = JSON.parse(settingsData);
        set({ settings, isLoading: false });
        return settings;
      }

      // Если настроек нет, сохраняем дефолтные
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      set({ settings: DEFAULT_SETTINGS, isLoading: false });
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Сохранить настройки
   */
  saveSettings: async (newSettings) => {
    set({ isLoading: true });

    try {
      const updatedSettings = {
        ...get().settings,
        ...newSettings,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updatedSettings)
      );

      set({ settings: updatedSettings, isLoading: false });
      return updatedSettings;
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Установить режим ввода
   */
  setInputMode: async (mode) => {
    if (!Object.values(INPUT_MODES).includes(mode)) {
      console.error('Неверный режим ввода:', mode);
      return;
    }

    await get().saveSettings({ inputMode: mode });
  },

  /**
   * Установить режим ответа AI
   */
  setResponseMode: async (mode) => {
    if (!Object.values(RESPONSE_MODES).includes(mode)) {
      console.error('Неверный режим ответа:', mode);
      return;
    }

    await get().saveSettings({ responseMode: mode });
  },

  /**
   * Установить скорость голоса
   */
  setVoiceSpeed: async (speed) => {
    if (speed < 0.5 || speed > 2.0) {
      console.error('Скорость должна быть от 0.5 до 2.0');
      return;
    }

    await get().saveSettings({ voiceSpeed: speed });
  },

  /**
   * Установить время напоминания
   */
  setReminderTime: async (time) => {
    await get().saveSettings({ reminderTime: time });
  },

  /**
   * Включить/выключить уведомления
   */
  toggleNotifications: async () => {
    const { settings } = get();
    await get().saveSettings({
      enableNotifications: !settings.enableNotifications
    });
  },

  /**
   * Включить/выключить звук
   */
  toggleSound: async () => {
    const { settings } = get();
    await get().saveSettings({
      enableSound: !settings.enableSound
    });
  },

  /**
   * Включить/выключить haptic feedback
   */
  toggleHaptic: async () => {
    const { settings } = get();
    await get().saveSettings({
      enableHaptic: !settings.enableHaptic
    });
  },

  /**
   * Сбросить настройки к дефолтным
   */
  resetSettings: async () => {
    set({ isLoading: true });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      set({ settings: DEFAULT_SETTINGS, isLoading: false });
    } catch (error) {
      console.error('Ошибка сброса настроек:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Сбросить ошибку
   */
  clearError: () => set({ error: null }),
}));

export default useSettingsStore;

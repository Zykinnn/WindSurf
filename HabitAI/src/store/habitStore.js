/**
 * Habit Store - Управление состоянием привычки
 * Использует Zustand для state management
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, HABIT_STATUS } from '../utils/constants';

const useHabitStore = create((set, get) => ({
  // Текущая привычка
  currentHabit: null,

  // Состояния загрузки
  isLoading: false,
  error: null,

  /**
   * Создать новую привычку
   */
  createHabit: async (habitData) => {
    set({ isLoading: true, error: null });

    try {
      const newHabit = {
        id: Date.now().toString(), // Временный ID
        name: habitData.name,
        tinyVersion: habitData.tinyVersion,
        trigger: habitData.trigger,
        time: habitData.time,
        currentDay: 1,
        streak: 0,
        totalCompleted: 0,
        status: HABIT_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };

      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_HABIT,
        JSON.stringify(newHabit)
      );

      set({ currentHabit: newHabit, isLoading: false });

      return newHabit;
    } catch (error) {
      console.error('Ошибка создания привычки:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Отметить привычку как выполненную
   */
  markComplete: async () => {
    const { currentHabit } = get();
    if (!currentHabit) return;

    set({ isLoading: true });

    try {
      const updatedHabit = {
        ...currentHabit,
        currentDay: currentHabit.currentDay + 1,
        streak: currentHabit.streak + 1,
        totalCompleted: currentHabit.totalCompleted + 1,
        lastCompletedAt: new Date().toISOString(),
      };

      // Сохраняем обновлённую привычку
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_HABIT,
        JSON.stringify(updatedHabit)
      );

      set({ currentHabit: updatedHabit, isLoading: false });

      return updatedHabit;
    } catch (error) {
      console.error('Ошибка отметки выполнения:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Отметить привычку как пропущенную
   */
  markSkipped: async (reason = '') => {
    const { currentHabit } = get();
    if (!currentHabit) return;

    set({ isLoading: true });

    try {
      const updatedHabit = {
        ...currentHabit,
        currentDay: currentHabit.currentDay + 1,
        streak: 0, // Сбрасываем streak при пропуске
        lastSkippedAt: new Date().toISOString(),
        lastSkipReason: reason,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_HABIT,
        JSON.stringify(updatedHabit)
      );

      set({ currentHabit: updatedHabit, isLoading: false });

      return updatedHabit;
    } catch (error) {
      console.error('Ошибка отметки пропуска:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Загрузить привычку из хранилища
   */
  loadHabit: async () => {
    set({ isLoading: true, error: null });

    try {
      const habitData = await AsyncStorage.getItem(
        STORAGE_KEYS.CURRENT_HABIT
      );

      if (habitData) {
        const habit = JSON.parse(habitData);
        set({ currentHabit: habit, isLoading: false });
        return habit;
      }

      set({ currentHabit: null, isLoading: false });
      return null;
    } catch (error) {
      console.error('Ошибка загрузки привычки:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Удалить привычку
   */
  deleteHabit: async () => {
    set({ isLoading: true });

    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_HABIT);
      set({ currentHabit: null, isLoading: false });
    } catch (error) {
      console.error('Ошибка удаления привычки:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Сбросить ошибку
   */
  clearError: () => set({ error: null }),
}));

export default useHabitStore;

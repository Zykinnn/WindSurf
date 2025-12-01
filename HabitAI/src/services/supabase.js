/**
 * Supabase Service - Работа с базой данных
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Инициализация Supabase клиента
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase Service
 */
class SupabaseService {
  /**
   * USERS
   */

  /**
   * Создать пользователя
   */
  async createUser(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data.user;
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      throw error;
    }
  }

  /**
   * Войти
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data.user;
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  }

  /**
   * Выйти
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  }

  /**
   * Получить текущего пользователя
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return null;
    }
  }

  /**
   * HABITS
   */

  /**
   * Создать привычку
   */
  async createHabit(userId, habitData) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([
          {
            user_id: userId,
            name: habitData.name,
            tiny_version: habitData.tinyVersion,
            trigger_event: habitData.trigger,
            time: habitData.time,
            current_day: 1,
            streak: 0,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка создания привычки:', error);
      throw error;
    }
  }

  /**
   * Получить привычки пользователя
   */
  async getUserHabits(userId) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка получения привычек:', error);
      throw error;
    }
  }

  /**
   * Получить привычку по ID
   */
  async getHabit(habitId) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка получения привычки:', error);
      throw error;
    }
  }

  /**
   * Обновить привычку
   */
  async updateHabit(habitId, updates) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка обновления привычки:', error);
      throw error;
    }
  }

  /**
   * Удалить привычку (изменить статус)
   */
  async deleteHabit(habitId) {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ status: 'deleted' })
        .eq('id', habitId);

      if (error) throw error;
    } catch (error) {
      console.error('Ошибка удаления привычки:', error);
      throw error;
    }
  }

  /**
   * HABIT LOGS
   */

  /**
   * Отметить привычку как выполненную
   */
  async markHabitComplete(habitId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Создаём лог
      const { error: logError } = await supabase
        .from('habit_logs')
        .insert([
          {
            habit_id: habitId,
            date: today,
            completed: true,
          },
        ]);

      if (logError) throw logError;

      // Получаем текущую привычку
      const habit = await this.getHabit(habitId);

      // Обновляем привычку
      const { data, error: updateError } = await supabase
        .from('habits')
        .update({
          current_day: habit.current_day + 1,
          streak: habit.streak + 1,
        })
        .eq('id', habitId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (error) {
      console.error('Ошибка отметки выполнения:', error);
      throw error;
    }
  }

  /**
   * Отметить привычку как пропущенную
   */
  async markHabitSkipped(habitId, reason = '') {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Создаём лог
      const { error: logError } = await supabase
        .from('habit_logs')
        .insert([
          {
            habit_id: habitId,
            date: today,
            completed: false,
            skip_reason: reason,
          },
        ]);

      if (logError) throw logError;

      // Получаем текущую привычку
      const habit = await this.getHabit(habitId);

      // Обновляем привычку (сбрасываем streak)
      const { data, error: updateError } = await supabase
        .from('habits')
        .update({
          current_day: habit.current_day + 1,
          streak: 0,
        })
        .eq('id', habitId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (error) {
      console.error('Ошибка отметки пропуска:', error);
      throw error;
    }
  }

  /**
   * Получить логи привычки
   */
  async getHabitLogs(habitId, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка получения логов:', error);
      throw error;
    }
  }

  /**
   * Получить статистику привычки
   */
  async getHabitStats(habitId) {
    try {
      const logs = await this.getHabitLogs(habitId, 66);

      const totalCompleted = logs.filter((log) => log.completed).length;
      const totalDays = logs.length;
      const successRate = totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0;

      // Подсчёт текущего streak
      let currentStreak = 0;
      for (const log of logs) {
        if (log.completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Подсчёт максимального streak
      let longestStreak = 0;
      let tempStreak = 0;
      for (const log of logs.reverse()) {
        if (log.completed) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      }

      return {
        totalCompleted,
        totalDays,
        successRate: Math.round(successRate),
        currentStreak,
        longestStreak,
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  /**
   * AI MESSAGES
   */

  /**
   * Сохранить сообщение в истории
   */
  async saveMessage(userId, sender, message, mode = 'text') {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert([
          {
            user_id: userId,
            sender, // 'user' или 'ai'
            message,
            mode, // 'voice' или 'text'
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Ошибка сохранения сообщения:', error);
      throw error;
    }
  }

  /**
   * Получить историю сообщений
   */
  async getMessages(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.reverse(); // Возвращаем в хронологическом порядке
    } catch (error) {
      console.error('Ошибка получения сообщений:', error);
      throw error;
    }
  }

  /**
   * Очистить историю сообщений
   */
  async clearMessages(userId) {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Ошибка очистки сообщений:', error);
      throw error;
    }
  }
}

// Singleton instance
const supabaseService = new SupabaseService();

export default supabaseService;
export { supabase };

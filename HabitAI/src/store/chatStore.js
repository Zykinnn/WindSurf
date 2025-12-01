/**
 * Chat Store - Управление историей чата с AI
 */

import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // История сообщений
  messages: [],

  // Состояния
  isTyping: false, // AI печатает ответ
  isLoading: false,
  error: null,

  /**
   * Добавить сообщение в чат
   */
  addMessage: (message) => {
    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...message,
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    return newMessage;
  },

  /**
   * Добавить сообщение пользователя
   */
  addUserMessage: (text, mode = 'text') => {
    const message = {
      sender: 'user',
      text,
      mode, // 'voice' или 'text'
    };

    return get().addMessage(message);
  },

  /**
   * Добавить сообщение AI
   */
  addAIMessage: (text) => {
    const message = {
      sender: 'ai',
      text,
    };

    return get().addMessage(message);
  },

  /**
   * Установить статус "AI печатает"
   */
  setTyping: (isTyping) => {
    set({ isTyping });
  },

  /**
   * Очистить историю чата
   */
  clearMessages: () => {
    set({ messages: [] });
  },

  /**
   * Получить последние N сообщений для контекста
   */
  getRecentMessages: (limit = 10) => {
    const { messages } = get();
    return messages.slice(-limit);
  },

  /**
   * Удалить сообщение
   */
  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    }));
  },

  /**
   * Установить ошибку
   */
  setError: (error) => {
    set({ error: error?.message || error });
  },

  /**
   * Сбросить ошибку
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useChatStore;

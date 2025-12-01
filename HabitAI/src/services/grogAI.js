/**
 * Grog AI Service - Интеграция с Grog API (xAI)
 * Персональный AI-коуч для привычек
 */

import { GROG_API_KEY, GROG_API_URL } from '@env';
import { MAX_RETRIES, RETRY_DELAYS, API_TIMEOUT } from '../utils/constants';

/**
 * System prompt для Grog AI
 * Определяет поведение и стиль ответов AI
 */
const SYSTEM_PROMPT = `Ты — персональный коуч по внедрению привычек. Твоя задача — помогать пользователю внедрить привычку за 66 дней.

ТВОИ ЗНАНИЯ:
- Методика "Atomic Habits" (Джеймс Клир)
- Методика "Tiny Habits" (BJ Fogg)
- Habit Loop (Cue → Routine → Reward)
- Психология мотивации и силы воли

ТВОЙ СТИЛЬ:
- Дружелюбный и поддерживающий
- Краткие ответы (2-3 предложения максимум)
- Используй эмодзи для эмоционального контакта
- Задавай наводящие вопросы
- Фокусируйся на маленьких шагах

ТВОИ ПРИНЦИПЫ:
1. Начинай с крошечной версии привычки (Tiny Habits)
2. Привязывай к существующим триггерам
3. Празднуй каждую победу
4. При неудаче — анализируй и адаптируй, не критикуй
5. Напоминай о прогрессе и streak

ВАЖНО:
- Для голосового режима: короткие предложения (5-10 слов), без markdown
- Для текстового режима: можно использовать форматирование
`;

/**
 * Grog AI Service
 */
class GrogService {
  constructor() {
    this.apiKey = GROG_API_KEY;
    this.apiUrl = GROG_API_URL;
    this.conversationHistory = [];
  }

  /**
   * Отправка запроса в Grog API с retry логикой
   */
  async _makeRequest(messages, options = {}) {
    const { retryCount = 0 } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grog-2-latest',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150, // Короткие ответы
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Grog API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      // Retry логика
      if (retryCount < MAX_RETRIES) {
        console.log(`Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await this._delay(RETRY_DELAYS[retryCount]);
        return this._makeRequest(messages, { retryCount: retryCount + 1 });
      }

      // Fallback сообщение если API недоступен
      console.error('Grog API недоступен:', error);
      return this._getFallbackMessage(error);
    }
  }

  /**
   * Задержка для retry
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fallback сообщение при ошибке
   */
  _getFallbackMessage(error) {
    if (error.name === 'AbortError') {
      return '⏱️ Запрос занял слишком много времени. Попробуй ещё раз!';
    }
    return '🤖 Упс, я временно недоступен. Но ты всё равно молодец! Продолжай в том же духе!';
  }

  /**
   * Подготовка текста для голосового режима
   */
  _prepareForVoice(text) {
    return text
      .replace(/\*\*/g, '') // Убираем markdown
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/\n/g, ' ') // Убираем переносы строк
      .trim();
  }

  /**
   * Чат с пользователем
   * @param {string} userMessage - сообщение пользователя
   * @param {object} context - контекст (привычка, streak, etc.)
   * @param {boolean} voiceMode - голосовой режим
   */
  async chat(userMessage, context = {}, voiceMode = false) {
    // Формируем контекст для AI
    const contextPrompt = this._buildContextPrompt(context);

    // Добавляем сообщение пользователя в историю
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Ограничиваем историю последними 10 сообщениями
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    // Формируем сообщения для API
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + (voiceMode ? '\n\nРЕЖИМ: Голосовой (короткие предложения, без markdown)' : ''),
      },
      {
        role: 'system',
        content: `КОНТЕКСТ:\n${contextPrompt}`,
      },
      ...this.conversationHistory,
    ];

    // Получаем ответ от AI
    const response = await this._makeRequest(messages);

    // Добавляем ответ в историю
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    // Если голосовой режим, подготавливаем текст
    return voiceMode ? this._prepareForVoice(response) : response;
  }

  /**
   * Создание плана привычки на основе описания
   * @param {string} habitDescription - описание привычки от пользователя
   */
  async createHabitPlan(habitDescription) {
    const prompt = `Пользователь хочет внедрить привычку: "${habitDescription}"

Создай для него план по методике Tiny Habits:

1. TINY VERSION - крошечная версия привычки (то, что можно сделать за 2 минуты)
2. TRIGGER - когда делать (привяжи к существующей привычке)
3. TIME - рекомендуемое время дня

Ответь в формате JSON:
{
  "tinyVersion": "...",
  "trigger": "...",
  "time": "07:00",
  "motivation": "короткое мотивационное сообщение"
}`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    try {
      const response = await this._makeRequest(messages);

      // Пытаемся распарсить JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Если не удалось распарсить, возвращаем дефолтный план
      return this._getDefaultPlan(habitDescription);
    } catch (error) {
      console.error('Ошибка создания плана:', error);
      return this._getDefaultPlan(habitDescription);
    }
  }

  /**
   * Дефолтный план если API не отвечает
   */
  _getDefaultPlan(habitDescription) {
    return {
      tinyVersion: `Делай "${habitDescription}" всего 2 минуты`,
      trigger: 'Сразу после утреннего пробуждения',
      time: '07:00',
      motivation: '🎯 Начни с малого — это ключ к успеху!',
    };
  }

  /**
   * Анализ пропущенного дня
   * @param {string} reason - причина пропуска
   * @param {object} context - контекст
   */
  async analyzeMissedDay(reason, context = {}) {
    const contextPrompt = this._buildContextPrompt(context);

    const prompt = `Пользователь пропустил привычку. Причина: "${reason}"

${contextPrompt}

Помоги ему:
1. Проанализируй причину (без осуждения)
2. Предложи решение на будущее
3. Мотивируй продолжать

Ответь коротко (2-3 предложения), дружелюбно, с эмодзи.`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    return await this._makeRequest(messages);
  }

  /**
   * Формирование контекста для AI
   */
  _buildContextPrompt(context) {
    const {
      habitName = '',
      currentDay = 1,
      streak = 0,
      totalCompleted = 0,
      missedDays = 0,
    } = context;

    return `Привычка: ${habitName}
День: ${currentDay}/66
Текущий streak: ${streak} ${streak === 1 ? 'день' : 'дней'}
Всего выполнено: ${totalCompleted}
Пропущено: ${missedDays}`;
  }

  /**
   * Очистить историю разговора
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Получить последние N сообщений из истории
   */
  getRecentMessages(limit = 5) {
    return this.conversationHistory.slice(-limit);
  }
}

// Singleton instance
const grogService = new GrogService();

export default grogService;

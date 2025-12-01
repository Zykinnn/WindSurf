/**
 * HabitAI Backend API
 * Прокси для Grog AI и работа с Supabase
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const GROG_API_KEY = process.env.GROG_API_KEY;
const GROG_API_URL = process.env.GROG_API_URL || 'https://api.x.ai/v1/chat/completions';

/**
 * Health check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HabitAI Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      chat: 'POST /api/grog/chat',
      habitPlan: 'POST /api/grog/habit-plan',
      analyzeMissedDay: 'POST /api/grog/analyze-missed',
    }
  });
});

/**
 * Grog AI Chat
 * POST /api/grog/chat
 * Body: { message, context, voiceMode }
 */
app.post('/api/grog/chat', async (req, res) => {
  try {
    const { message, context = {}, voiceMode = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GROG_API_KEY) {
      return res.status(500).json({ error: 'GROG_API_KEY not configured' });
    }

    // System prompt
    const systemPrompt = `Ты — персональный коуч по внедрению привычек. Твоя задача — помогать пользователю внедрить привычку за 66 дней.

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

${voiceMode ? '\n\nРЕЖИМ: Голосовой (короткие предложения, без markdown)' : ''}`;

    // Контекст пользователя
    const contextPrompt = `КОНТЕКСТ:
Привычка: ${context.habitName || 'не указана'}
День: ${context.currentDay || 1}/66
Streak: ${context.streak || 0}
Всего выполнено: ${context.totalCompleted || 0}`;

    // Запрос к Grog AI
    const response = await fetch(GROG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROG_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grog-2-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: contextPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grog API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
});

/**
 * Create Habit Plan
 * POST /api/grog/habit-plan
 * Body: { habitDescription }
 */
app.post('/api/grog/habit-plan', async (req, res) => {
  try {
    const { habitDescription } = req.body;

    if (!habitDescription) {
      return res.status(400).json({ error: 'Habit description is required' });
    }

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

    const response = await fetch(GROG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROG_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grog-2-latest',
        messages: [
          { role: 'system', content: 'Ты коуч по привычкам' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grog API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Пытаемся распарсить JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    let plan;

    if (jsonMatch) {
      plan = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback
      plan = {
        tinyVersion: `Делай "${habitDescription}" всего 2 минуты`,
        trigger: 'Сразу после утреннего пробуждения',
        time: '07:00',
        motivation: '🎯 Начни с малого — это ключ к успеху!',
      };
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('Habit plan error:', error);
    res.status(500).json({
      error: 'Failed to create habit plan',
      message: error.message,
    });
  }
});

/**
 * Analyze Missed Day
 * POST /api/grog/analyze-missed
 * Body: { reason, context }
 */
app.post('/api/grog/analyze-missed', async (req, res) => {
  try {
    const { reason, context = {} } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const contextPrompt = `Привычка: ${context.habitName || 'не указана'}
День: ${context.currentDay || 1}/66
Streak: ${context.streak || 0}`;

    const prompt = `Пользователь пропустил привычку. Причина: "${reason}"

${contextPrompt}

Помоги ему:
1. Проанализируй причину (без осуждения)
2. Предложи решение на будущее
3. Мотивируй продолжать

Ответь коротко (2-3 предложения), дружелюбно, с эмодзи.`;

    const response = await fetch(GROG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROG_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grog-2-latest',
        messages: [
          { role: 'system', content: 'Ты коуч по привычкам' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grog API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      error: 'Failed to analyze missed day',
      message: error.message,
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ HabitAI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});

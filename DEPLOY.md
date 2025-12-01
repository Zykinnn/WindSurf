# 🚀 Деплой на Railway

## Шаг 1: Подготовка

1. Убедитесь, что у вас есть аккаунт на [Railway.app](https://railway.app)
2. Установите Railway CLI (опционально):
```bash
npm install -g @railway/cli
```

## Шаг 2: Создание проекта на Railway

### Вариант A: Через веб-интерфейс (рекомендуется)

1. Откройте [Railway.app](https://railway.app)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Подключите ваш GitHub репозиторий
5. Railway автоматически определит Node.js проект

### Вариант B: Через CLI

```bash
# Логин
railway login

# Инициализация проекта
railway init

# Деплой
railway up
```

## Шаг 3: Настройка переменных окружения

В Railway Dashboard добавьте переменные:

```
GROG_API_KEY=your_actual_grog_api_key
GROG_API_URL=https://api.x.ai/v1/chat/completions
```

**Важно:** Railway автоматически установит `PORT`, не добавляйте его вручную!

## Шаг 4: Проверка деплоя

После деплоя Railway покажет URL вашего приложения, например:
```
https://habitai-backend-production.up.railway.app
```

Проверьте работу:
```bash
curl https://your-app.railway.app/
```

Вы должны увидеть:
```json
{
  "status": "ok",
  "message": "HabitAI Backend API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## Шаг 5: Тестирование API

### Chat endpoint
```bash
curl -X POST https://your-app.railway.app/api/grog/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Как мне начать бегать?",
    "context": {
      "habitName": "Утренняя пробежка",
      "currentDay": 1,
      "streak": 0
    }
  }'
```

### Habit Plan endpoint
```bash
curl -X POST https://your-app.railway.app/api/grog/habit-plan \
  -H "Content-Type: application/json" \
  -d '{
    "habitDescription": "Бегать по утрам"
  }'
```

## Шаг 6: Интеграция с мобильным приложением

В вашем React Native приложении (`HabitAI/src/services/grogAI.js`) замените:

```javascript
// Было (прямой вызов)
const GROG_API_URL = 'https://api.x.ai/v1/chat/completions';

// Стало (через ваш backend)
const BACKEND_URL = 'https://your-app.railway.app';
```

И обновите методы:

```javascript
async chat(userMessage, context, voiceMode) {
  const response = await fetch(`${BACKEND_URL}/api/grog/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      context,
      voiceMode
    }),
  });

  const data = await response.json();
  return data.response;
}
```

## Troubleshooting

### Railway не может определить как запустить приложение

Убедитесь, что в `package.json` есть:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "main": "server.js"
}
```

### Ошибка "GROG_API_KEY not configured"

Проверьте переменные окружения в Railway Dashboard:
1. Откройте ваш проект
2. Перейдите на вкладку **Variables**
3. Убедитесь, что `GROG_API_KEY` установлен

### 500 Internal Server Error

Проверьте логи:
```bash
railway logs
```

Или в веб-интерфейсе: **Deployments** → последний деплой → **View Logs**

## Мониторинг

Railway автоматически предоставляет:
- 📊 Метрики (CPU, Memory, Network)
- 📝 Логи в реальном времени
- 🔔 Уведомления о деплоях

## Стоимость

Railway предоставляет:
- ✅ **$5 в месяц бесплатно** (достаточно для тестирования)
- 💳 После этого - pay-as-you-go

Для HabitAI backend обычно используется:
- ~512MB RAM
- ~0.1 vCPU
- ~$3-5/месяц при активном использовании

## Альтернативы Railway

Если Railway не подходит, можно использовать:
- **Render.com** (бесплатный tier)
- **Fly.io** (бесплатный tier)
- **Heroku** (платно)
- **Vercel** (для serverless)
- **DigitalOcean App Platform**

---

## Готово! 🎉

Ваш backend задеплоен и готов к использованию с мобильным приложением HabitAI.

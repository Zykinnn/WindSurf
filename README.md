# HabitAI Backend API

Backend сервис для мобильного приложения HabitAI.

## Особенности

- 🤖 Proxy для Grog AI API
- 🔐 Безопасное хранение API ключей
- 🚀 Готов к деплою на Railway
- ⚡ Express.js + CORS

## API Endpoints

### Health Check
```
GET /
```

### Chat с AI
```
POST /api/grog/chat
Body: {
  "message": "Как мне начать бегать?",
  "context": {
    "habitName": "Утренняя пробежка",
    "currentDay": 5,
    "streak": 3
  },
  "voiceMode": false
}
```

### Создание плана привычки
```
POST /api/grog/habit-plan
Body: {
  "habitDescription": "Бегать по утрам"
}
```

### Анализ пропущенного дня
```
POST /api/grog/analyze-missed
Body: {
  "reason": "Проспал будильник",
  "context": {
    "habitName": "Утренняя пробежка",
    "currentDay": 5,
    "streak": 0
  }
}
```

## Локальный запуск

1. Установите зависимости:
```bash
npm install
```

2. Создайте `.env`:
```bash
cp .env.example .env
# Заполните GROG_API_KEY
```

3. Запустите:
```bash
npm start
```

4. Откройте: http://localhost:3000

## Деплой на Railway

1. Создайте проект на Railway.app
2. Подключите этот репозиторий
3. Добавьте переменные окружения:
   - `GROG_API_KEY` - ваш ключ Grog AI
   - `GROG_API_URL` - https://api.x.ai/v1/chat/completions
4. Railway автоматически задеплоит приложение

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Порт сервера (Railway установит автоматически) |
| GROG_API_KEY | API ключ Grog (xAI) |
| GROG_API_URL | URL Grog API |

## Использование в React Native

В вашем мобильном приложении замените прямые вызовы Grog AI на вызовы этого API:

```javascript
// Вместо прямого вызова Grog
const response = await fetch('https://api.x.ai/v1/chat/completions', {
  headers: { Authorization: `Bearer ${GROG_API_KEY}` },
  // ...
});

// Используйте ваш backend
const response = await fetch('https://your-railway-app.railway.app/api/grog/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Привет!',
    context: { ... }
  }),
});
```

## Структура проекта

```
.
├── server.js          # Главный файл сервера
├── package.json       # Зависимости
├── .env.example       # Пример переменных окружения
├── README.md          # Документация
└── HabitAI/          # React Native приложение (не деплоится)
```

## Мобильное приложение

React Native код находится в папке `HabitAI/`. Для работы с мобильным приложением см. [HabitAI/README.md](HabitAI/README.md).

## License

MIT

# HabitAI

AI-коуч для внедрения привычек за 66 дней.

## Описание

HabitAI — это мобильное приложение с персональным AI-коучем, который помогает внедрить любую привычку за 66 дней. Приложение использует голосовой и текстовый ввод, имеет минималистичный интерфейс и gesture-based UX.

## Особенности

- 🎯 **66-дневная программа** - научно обоснованный срок формирования привычки
- 🤖 **AI-коуч** - персональная поддержка на базе Grog API
- 🎤 **Голосовой ввод** - говорите с AI естественным языком
- ⌨️ **Текстовый ввод** - или пишите, если удобнее
- 🔊 **TTS** - AI может озвучивать ответы
- 🎨 **Минималистичный дизайн** - тёмная тема, без лишних элементов
- 👆 **Свайпы** - управление жестами вместо кнопок
- 📊 **Прогресс** - визуализация streak и календарь

## Tech Stack

### Frontend
- React Native 0.73+
- React Navigation 6.x
- Zustand (state management)
- react-native-gesture-handler
- react-native-reanimated
- @react-native-voice/voice
- react-native-tts

### Backend
- Supabase (база данных + аутентификация)
- Grog AI API (xAI)
- Firebase Cloud Messaging (push-уведомления)

## Структура проекта

```
HabitAI/
├── App.jsx                 # Главный компонент
├── package.json
├── .env.example
├── src/
│   ├── screens/           # Экраны приложения
│   │   ├── OnboardingScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── ChatScreen.jsx
│   │   ├── ProgressScreen.jsx
│   │   └── SettingsScreen.jsx
│   │
│   ├── components/        # Компоненты
│   │   ├── VoiceOrTextInput.jsx
│   │   ├── AIMessage.jsx
│   │   ├── HabitCard.jsx
│   │   ├── StreakCounter.jsx
│   │   └── ProgressCalendar.jsx
│   │
│   ├── navigation/        # Навигация
│   │   └── AppNavigator.jsx
│   │
│   ├── services/          # Сервисы
│   │   ├── grogAI.js
│   │   ├── supabase.js
│   │   ├── notifications.js
│   │   └── tts.js
│   │
│   ├── store/            # State management (Zustand)
│   │   ├── habitStore.js
│   │   ├── settingsStore.js
│   │   └── chatStore.js
│   │
│   ├── utils/            # Утилиты
│   │   ├── gestures.js
│   │   └── constants.js
│   │
│   └── theme/            # Тема
│       └── colors.js
│
└── backend/              # Backend (опционально)
    ├── server.js
    └── ...
```

## Установка

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd HabitAI
```

### 2. Установить зависимости

```bash
npm install
```

или

```bash
yarn install
```

### 3. Настроить переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROG_API_KEY=your_grog_api_key
GROG_API_URL=https://api.x.ai/v1/chat/completions
```

### 4. Настроить iOS (только для macOS)

```bash
cd ios
pod install
cd ..
```

### 5. Запустить приложение

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Настройка Supabase

### Схема базы данных

Создайте следующие таблицы в Supabase:

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Привычки
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tiny_version TEXT,
  trigger_event TEXT,
  time TEXT,
  current_day INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Логи привычек
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Сообщения AI
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' или 'ai'
  message TEXT NOT NULL,
  mode TEXT, -- 'voice' или 'text'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Включите RLS и создайте политики для каждой таблицы.

## Настройка Firebase

### Android

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Добавьте Android-приложение
3. Скачайте `google-services.json`
4. Поместите в `android/app/`

### iOS

1. В том же проекте Firebase добавьте iOS-приложение
2. Скачайте `GoogleService-Info.plist`
3. Поместите в `ios/HabitAI/`

## Получение Grog API ключа

1. Зарегистрируйтесь на [x.ai](https://x.ai)
2. Получите API ключ
3. Добавьте в `.env`

## Использование

### Онбординг

При первом запуске пользователь видит 3 слайда:
1. Приветствие
2. Объяснение как работает AI-коуч
3. Ввод первой привычки (голосом или текстом)

### Главный экран

- Карточка с привычкой
- Свайп вверх → "Сделал"
- Свайп вниз → "Пропустил" (с рефлексией)
- Свайп влево → Чат с AI
- Свайп вправо → Календарь прогресса

### Чат с AI

- История сообщений
- Голосовой/текстовый ввод
- Озвучка ответов AI (опционально)

## Разработка

### Добавление новых компонентов

```bash
# Создайте файл в src/components/
touch src/components/NewComponent.jsx
```

### Добавление новых экранов

```bash
# Создайте файл в src/screens/
touch src/screens/NewScreen.jsx

# Добавьте экран в навигацию (src/navigation/AppNavigator.jsx)
```

### Отладка

```bash
# Открыть DevTools
# iOS: Cmd+D
# Android: Cmd+M (Mac) или Ctrl+M (Windows/Linux)
```

## Roadmap

- [x] Базовая структура проекта
- [x] Навигация
- [x] Онбординг
- [x] State management (Zustand)
- [ ] Голосовой ввод (VoiceOrTextInput)
- [ ] Интеграция Grog AI
- [ ] Supabase интеграция
- [ ] TTS (озвучка)
- [ ] Push-уведомления
- [ ] Анимации и жесты
- [ ] Календарь прогресса
- [ ] Статистика

## Лицензия

MIT

## Контакты

Для вопросов и предложений: [ваш email]

---

Сделано с ❤️ и помощью AI

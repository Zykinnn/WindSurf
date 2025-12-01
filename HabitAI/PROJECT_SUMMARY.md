# HabitAI - Project Summary

## 📱 Обзор проекта

**HabitAI** - мобильное приложение на React Native с AI-коучем для внедрения привычек за 66 дней.

### Ключевые особенности:
- 🤖 **AI-коуч** на базе Grog AI (xAI)
- 🎤 **Голосовой + текстовый ввод**
- 🔊 **Text-to-Speech** озвучка ответов AI
- 👆 **Gesture-based UX** (свайпы вместо кнопок)
- 🌑 **Минималистичная тёмная тема**
- 📊 **Tracking прогресса** (streak, календарь)

---

## 🏗️ Архитектура

### Tech Stack

**Frontend:**
- React Native 0.73+
- React Navigation 6.x (Stack Navigator)
- Zustand (state management)
- react-native-gesture-handler + reanimated
- @react-native-voice/voice
- react-native-tts

**Backend:**
- Supabase (PostgreSQL + Auth)
- Grog AI API (xAI)
- Firebase (опционально, для push)

**Инструменты:**
- babel (react-native-dotenv)
- AsyncStorage (offline cache)
- react-native-haptic-feedback

---

## 📂 Структура проекта

```
HabitAI/
├── App.jsx                      # Корневой компонент
├── package.json
├── babel.config.js
├── .env.example
├── src/
│   ├── screens/                # Экраны
│   │   ├── OnboardingScreen.jsx   # 3 слайда онбординга
│   │   ├── HomeScreen.jsx         # Главный экран с HabitCard
│   │   ├── ChatScreen.jsx         # Чат с AI
│   │   ├── ProgressScreen.jsx     # Календарь (TODO)
│   │   └── SettingsScreen.jsx     # Настройки (TODO)
│   │
│   ├── components/             # Компоненты
│   │   ├── VoiceOrTextInput.jsx   # Голосовой/текстовый ввод
│   │   ├── HabitCard.jsx          # Карточка привычки (swipes)
│   │   └── AIMessage.jsx          # Сообщение AI с TTS
│   │
│   ├── navigation/             # Навигация
│   │   └── AppNavigator.jsx       # Stack Navigator
│   │
│   ├── services/               # Сервисы
│   │   ├── grogAI.js              # Grog AI интеграция
│   │   ├── supabase.js            # Supabase CRUD
│   │   └── tts.js                 # Text-to-Speech
│   │
│   ├── store/                  # Zustand stores
│   │   ├── habitStore.js          # Состояние привычки
│   │   ├── settingsStore.js       # Настройки
│   │   └── chatStore.js           # История чата
│   │
│   ├── theme/                  # Тема
│   │   └── colors.js              # Цвета, шрифты, отступы
│   │
│   └── utils/                  # Утилиты
│       └── constants.js           # Константы
```

---

## 🎨 Дизайн система

### Цвета (тёмная тема)
```javascript
background: '#0A0A0A'     // Основной фон
card: '#1A1A1A'           // Карточки
accent: '#00FF88'         // Акцент (зелёный)
text: '#FFFFFF'           // Основной текст
textSecondary: '#888888'  // Вторичный текст
error: '#FF4444'          // Ошибки
```

### Spacing
- xs: 5px, sm: 10px, md: 20px, lg: 40px, xl: 60px

### Радиусы
- sm: 10px, md: 20px, lg: 30px

---

## 🔧 Ключевые компоненты

### 1. VoiceOrTextInput
**Назначение:** Универсальный ввод (голос/текст)

**Особенности:**
- Переключатель режимов
- Hold-to-record для голоса
- Автоотправка после распознавания
- Haptic feedback
- Multiline для текста

**Props:**
- `onSubmit(text, mode)` - callback с текстом и режимом

---

### 2. HabitCard
**Назначение:** Карточка привычки с жестами

**Особенности:**
- Swipe UP → mark complete
- Swipe DOWN → mark skip
- Анимации (spring, rotate, scale)
- Haptic feedback
- Визуальные индикаторы

**Props:**
- `habit` - объект привычки
- `onComplete()` - callback выполнения
- `onSkip()` - callback пропуска

---

### 3. AIMessage
**Назначение:** Сообщение от AI с озвучкой

**Особенности:**
- Bubble дизайн
- Кнопка "Послушать" (TTS)
- Автоозвучка (настраиваемая)
- Timestamp

**Props:**
- `message` - объект сообщения
- `autoSpeak` - автоозвучка

---

## 🤖 Сервисы

### grogAI.js
**Интеграция с Grog AI**

**Методы:**
```javascript
// Чат с контекстом
chat(userMessage, context, voiceMode)

// Создание плана привычки
createHabitPlan(habitDescription)

// Анализ пропуска
analyzeMissedDay(reason, context)
```

**Особенности:**
- System prompt с методиками (Atomic Habits, Tiny Habits)
- Retry логика (3 попытки, exponential backoff)
- Fallback сообщения
- Адаптация для голосового режима
- История (10 последних сообщений)

---

### supabase.js
**Работа с базой данных**

**Методы:**
```javascript
// Auth
signUp(email, password)
signIn(email, password)
signOut()

// Habits
createHabit(userId, habitData)
updateHabit(habitId, updates)
deleteHabit(habitId)

// Logs
markHabitComplete(habitId)
markHabitSkipped(habitId, reason)
getHabitLogs(habitId, limit)
getHabitStats(habitId)

// Messages
saveMessage(userId, sender, message, mode)
getMessages(userId, limit)
```

---

### tts.js
**Text-to-Speech**

**Методы:**
```javascript
speak(text, options)
stop()
setSpeed(speed)      // 0.5 - 2.0
setLanguage(lang)    // ru-RU, en-US
```

**Особенности:**
- Подготовка текста (удаление markdown, эмодзи → текст)
- Очередь сообщений
- Events (start, finish, error)
- Контроль воспроизведения

---

## 📊 State Management (Zustand)

### habitStore.js
```javascript
{
  currentHabit: {
    id, name, tinyVersion, trigger, time,
    currentDay, streak, totalCompleted
  },
  createHabit(habitData),
  markComplete(),
  markSkipped(reason),
  loadHabit(),
  deleteHabit()
}
```

### settingsStore.js
```javascript
{
  settings: {
    inputMode: 'voice'|'text',
    responseMode: 'voice'|'text'|'auto',
    voiceSpeed: 0.7,
    voicePitch: 1.0,
    ...
  },
  setInputMode(mode),
  setResponseMode(mode),
  ...
}
```

### chatStore.js
```javascript
{
  messages: [],
  isTyping: false,
  addUserMessage(text, mode),
  addAIMessage(text),
  setTyping(bool),
  clearMessages()
}
```

---

## 🎯 User Flow

### 1. Первый запуск (Onboarding)
1. Показываем 3 слайда (swipe)
2. Слайд 3: выбор режима ввода (голос/текст)
3. Пользователь вводит привычку
4. Отправляем в Grog AI → получаем план
5. Создаём привычку → переходим на Home

### 2. Главный экран (Home)
1. Показываем HabitCard с текущим днём
2. Пользователь свайпает:
   - UP → отмечаем выполнение, обновляем streak
   - DOWN → открываем модалку пропуска
3. В модалке: вводим причину → отправляем AI → получаем анализ
4. Кнопка чата → переход на ChatScreen

### 3. Чат (Chat)
1. AI приветствует (учитывает streak)
2. Пользователь отправляет сообщение (голос/текст)
3. Показываем "AI печатает..."
4. Получаем ответ от Grog AI
5. Озвучиваем (если настроено)
6. Repeat

---

## 🔐 Environment Variables

Создайте `.env` на основе `.env.example`:

```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GROG_API_KEY=your_key
GROG_API_URL=https://api.x.ai/v1/chat/completions
```

---

## 📝 Supabase Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  tiny_version TEXT,
  trigger_event TEXT,
  time TEXT,
  current_day INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Logs
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  mode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Запуск проекта

### 1. Инициализация
```bash
# Expo (рекомендуется)
npx create-expo-app HabitAI
cd HabitAI

# Или React Native CLI
npx react-native init HabitAI
cd HabitAI
```

### 2. Копирование файлов
Скопируйте все файлы из текущей структуры в созданный проект.

### 3. Установка зависимостей
```bash
npm install
```

### 4. Настройка .env
```bash
cp .env.example .env
# Заполните переменные
```

### 5. iOS (только macOS)
```bash
cd ios && pod install && cd ..
```

### 6. Запуск
```bash
# iOS
npm run ios

# Android
npm run android
```

---

## ✅ Что готово

- ✅ Базовая структура проекта
- ✅ Навигация (Stack Navigator)
- ✅ Тёмная тема
- ✅ OnboardingScreen (3 слайда)
- ✅ HomeScreen (полный функционал)
- ✅ ChatScreen (полный функционал)
- ✅ VoiceOrTextInput компонент
- ✅ HabitCard с жестами
- ✅ AIMessage с TTS
- ✅ Grog AI интеграция
- ✅ Supabase интеграция
- ✅ TTS сервис
- ✅ Zustand stores

## 📋 TODO

- [ ] ProgressScreen - календарь и статистика
- [ ] SettingsScreen - полноценные настройки
- [ ] Push-уведомления
- [ ] Confetti анимация при успехе
- [ ] Offline mode
- [ ] Unit тесты
- [ ] Деплой

---

## 📚 Документация

- [README.md](README.md) - Полная документация
- [NEXT_STEPS.md](NEXT_STEPS.md) - План разработки
- [CHANGELOG.md](CHANGELOG.md) - История изменений
- [src/services/README.md](src/services/README.md) - Документация по сервисам

---

## 🤝 Contributing

Проект создан с помощью AI. Для внесения изменений:
1. Создайте issue
2. Fork проекта
3. Создайте feature branch
4. Commit изменения
5. Push и создайте Pull Request

---

## 📄 License

MIT

---

**Создано с ❤️ и помощью Claude Code**

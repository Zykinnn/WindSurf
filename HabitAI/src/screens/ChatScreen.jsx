/**
 * ChatScreen - Чат с AI-коучем
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS, FONTS, SPACING, RADIUS } from '../theme/colors';
import VoiceOrTextInput from '../components/VoiceOrTextInput';
import AIMessage from '../components/AIMessage';
import useChatStore from '../store/chatStore';
import useHabitStore from '../store/habitStore';
import useSettingsStore from '../store/settingsStore';
import grogService from '../services/grogAI';

const ChatScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const { messages, addUserMessage, addAIMessage, setTyping, isTyping } = useChatStore();
  const { currentHabit } = useHabitStore();
  const { settings } = useSettingsStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initChat();
  }, []);

  /**
   * Инициализация чата
   */
  const initChat = async () => {
    // Если это первое сообщение, AI приветствует
    if (messages.length === 0) {
      const greeting = getGreeting();
      addAIMessage(greeting);
    }

    setIsInitialized(true);
  };

  /**
   * Приветствие от AI
   */
  const getGreeting = () => {
    if (!currentHabit) {
      return 'Привет! Я твой AI-коуч. Давай начнём с создания первой привычки!';
    }

    const { name, streak, currentDay } = currentHabit;

    if (streak > 0) {
      return `Привет! 🔥 У тебя ${streak} ${streak === 1 ? 'день' : 'дней'} подряд с "${name}". Как дела?`;
    }

    return `Привет! Сегодня день ${currentDay} твоей привычки "${name}". Чем могу помочь?`;
  };

  /**
   * Обработка отправки сообщения
   */
  const handleSubmit = async (text, mode) => {
    try {
      // Добавляем сообщение пользователя
      const userMessage = addUserMessage(text, mode);

      // Скроллим вниз
      scrollToBottom();

      // AI печатает
      setTyping(true);

      // Получаем ответ от AI
      const context = currentHabit
        ? {
            habitName: currentHabit.name,
            currentDay: currentHabit.currentDay,
            streak: currentHabit.streak,
            totalCompleted: currentHabit.totalCompleted,
          }
        : {};

      const voiceMode = mode === 'voice' || settings.responseMode === 'voice';

      const response = await grogService.chat(text, context, voiceMode);

      // Добавляем ответ AI
      addAIMessage(response);

      // AI закончил печатать
      setTyping(false);

      // Скроллим вниз
      scrollToBottom();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setTyping(false);

      // Показываем сообщение об ошибке
      addAIMessage('Упс, что-то пошло не так. Попробуй ещё раз!');
    }
  };

  /**
   * Скролл вниз
   */
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /**
   * Рендер сообщения
   */
  const renderMessage = ({ item }) => {
    if (item.sender === 'ai') {
      return <AIMessage message={item} autoSpeak={shouldAutoSpeak()} />;
    }

    // Сообщение пользователя
    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userMessageText}>{item.text}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  /**
   * Проверка автоозвучки
   */
  const shouldAutoSpeak = () => {
    const { responseMode } = settings;
    return responseMode === 'voice' || responseMode === 'auto';
  };

  /**
   * Форматирование времени
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * Рендер индикатора "печатает"
   */
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>AI печатает...</Text>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Коуч</Text>
            {currentHabit && (
              <Text style={styles.headerSubtitle}>{currentHabit.name}</Text>
            )}
          </View>

          <View style={styles.headerRight} />
        </View>

        {/* Список сообщений */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Поле ввода */}
        <View style={styles.inputContainer}>
          <VoiceOrTextInput
            onSubmit={handleSubmit}
            placeholder="Спроси меня о чём угодно..."
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 28,
    color: COLORS.text,
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.h2,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    paddingVertical: SPACING.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  userBubble: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    borderTopRightRadius: 4,
    padding: SPACING.md,
    maxWidth: '85%',
  },
  userMessageText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.background,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginRight: SPACING.sm,
  },
  typingContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  typingBubble: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderTopLeftRadius: 4,
    padding: SPACING.md,
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  // Анимация точек (можно улучшить с Animated)
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default ChatScreen;

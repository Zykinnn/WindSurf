/**
 * AIMessage - Сообщение от AI с кнопкой озвучки
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { COLORS, FONTS, SPACING, RADIUS } from '../theme/colors';
import ttsService from '../services/tts';
import useSettingsStore from '../store/settingsStore';
import { RESPONSE_MODES } from '../utils/constants';

const AIMessage = ({ message, autoSpeak = false }) => {
  const { settings } = useSettingsStore();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Автоматическая озвучка если включено
    if (autoSpeak && shouldAutoSpeak()) {
      handleSpeak();
    }
  }, [message.id]);

  /**
   * Проверка, нужно ли автоматически озвучивать
   */
  const shouldAutoSpeak = () => {
    const { responseMode } = settings;

    if (responseMode === RESPONSE_MODES.VOICE) {
      return true;
    }

    if (responseMode === RESPONSE_MODES.AUTO && message.userMode === 'voice') {
      // Если пользователь использовал голос, отвечаем голосом
      return true;
    }

    return false;
  };

  /**
   * Озвучить сообщение
   */
  const handleSpeak = async () => {
    if (isSpeaking) {
      // Если уже говорит - останавливаем
      await ttsService.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      ReactNativeHapticFeedback.trigger('impactLight');

      setIsSpeaking(true);

      await ttsService.speak(message.text, {
        speed: settings.voiceSpeed || 0.7,
        pitch: settings.voicePitch || 1.0,
        language: settings.language || 'ru-RU',
      });

      // Ждём окончания озвучки
      const checkSpeaking = setInterval(() => {
        if (!ttsService.isTTSSpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeaking);
        }
      }, 500);
    } catch (error) {
      console.error('Ошибка озвучки сообщения:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Bubble с текстом */}
      <View style={styles.bubble}>
        <View style={styles.header}>
          <Text style={styles.aiLabel}>AI Коуч</Text>
        </View>

        <Text style={styles.messageText}>{message.text}</Text>

        {/* Кнопка озвучки */}
        {settings.enableSound && (
          <TouchableOpacity
            style={styles.speakButton}
            onPress={handleSpeak}
            activeOpacity={0.7}
          >
            <Text style={styles.speakIcon}>
              {isSpeaking ? '⏸' : '🔊'}
            </Text>
            <Text style={styles.speakText}>
              {isSpeaking ? 'Остановить' : 'Послушать'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
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

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
  },
  bubble: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    maxWidth: '85%',
    borderTopLeftRadius: 4, // Острый угол слева
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.accent,
    fontWeight: FONTS.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    lineHeight: 22,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  speakIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  speakText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
  },
  timestamp: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default AIMessage;

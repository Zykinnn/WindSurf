/**
 * VoiceOrTextInput - Компонент с переключением между голосовым и текстовым вводом
 * Используется на онбординге и в чате с AI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { COLORS, FONTS, SPACING, RADIUS } from '../theme/colors';
import { INPUT_MODES } from '../utils/constants';
import useSettingsStore from '../store/settingsStore';

const VoiceOrTextInput = ({ onSubmit, placeholder = 'Расскажи мне...' }) => {
  const { settings } = useSettingsStore();

  // Состояния
  const [mode, setMode] = useState(settings.inputMode || INPUT_MODES.TEXT);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Анимация кнопки микрофона
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Настройка Voice Recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    // Анимация пульсации при записи
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  /**
   * Обработчики Voice Recognition
   */
  const onSpeechStart = () => {
    console.log('Начало записи голоса');
  };

  const onSpeechEnd = () => {
    console.log('Окончание записи голоса');
    setIsRecording(false);
  };

  const onSpeechResults = (event) => {
    const recognizedText = event.value[0];
    setText(recognizedText);

    // Автоматическая отправка через 1 секунду после распознавания
    setTimeout(() => {
      if (recognizedText && recognizedText.trim()) {
        handleSubmit(recognizedText);
      }
    }, 1000);
  };

  const onSpeechError = (error) => {
    console.error('Ошибка распознавания речи:', error);
    setIsRecording(false);

    // Fallback на текстовый режим
    setMode(INPUT_MODES.TEXT);
  };

  /**
   * Начать запись голоса
   */
  const startRecording = async () => {
    try {
      // Haptic feedback
      ReactNativeHapticFeedback.trigger('impactMedium');

      setIsRecording(true);
      setText('');

      await Voice.start('ru-RU');
    } catch (error) {
      console.error('Ошибка запуска записи:', error);
      setIsRecording(false);
    }
  };

  /**
   * Остановить запись голоса
   */
  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Ошибка остановки записи:', error);
    }
  };

  /**
   * Отправка сообщения
   */
  const handleSubmit = (submittedText = text) => {
    const trimmedText = submittedText.trim();

    if (!trimmedText) return;

    // Haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight');

    setIsProcessing(true);

    // Вызываем callback с текстом и режимом
    onSubmit(trimmedText, mode);

    // Очищаем поле ввода
    setText('');
    setIsProcessing(false);
  };

  /**
   * Переключение режима
   */
  const toggleMode = () => {
    const newMode = mode === INPUT_MODES.VOICE ? INPUT_MODES.TEXT : INPUT_MODES.VOICE;
    setMode(newMode);
    setText('');

    // Haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  /**
   * Рендер голосового режима
   */
  const renderVoiceMode = () => {
    return (
      <View style={styles.voiceContainer}>
        {/* Распознанный текст */}
        {text ? (
          <View style={styles.recognizedTextContainer}>
            <Text style={styles.recognizedText}>{text}</Text>
          </View>
        ) : null}

        {/* Кнопка микрофона */}
        <TouchableOpacity
          style={styles.micButtonContainer}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.micButton,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: isRecording ? COLORS.error : COLORS.accent,
              },
            ]}
          >
            <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎤'}</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Подсказка */}
        <Text style={styles.hint}>
          {isRecording ? 'Говорите...' : 'Зажмите и говорите'}
        </Text>
      </View>
    );
  };

  /**
   * Рендер текстового режима
   */
  const renderTextMode = () => {
    return (
      <View style={styles.textContainer}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => handleSubmit()}
        />

        {/* Кнопка отправки */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: text.trim() ? 1 : 0.3 },
          ]}
          onPress={() => handleSubmit()}
          disabled={!text.trim() || isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Переключатель режима */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === INPUT_MODES.VOICE && styles.modeButtonActive,
          ]}
          onPress={() => setMode(INPUT_MODES.VOICE)}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🎤</Text>
          <Text
            style={[
              styles.modeText,
              mode === INPUT_MODES.VOICE && styles.modeTextActive,
            ]}
          >
            Говорить
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === INPUT_MODES.TEXT && styles.modeButtonActive,
          ]}
          onPress={() => setMode(INPUT_MODES.TEXT)}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>⌨️</Text>
          <Text
            style={[
              styles.modeText,
              mode === INPUT_MODES.TEXT && styles.modeTextActive,
            ]}
          >
            Писать
          </Text>
        </TouchableOpacity>
      </View>

      {/* Поле ввода */}
      <View style={styles.inputArea}>
        {mode === INPUT_MODES.VOICE ? renderVoiceMode() : renderTextMode()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  modeButtonActive: {
    backgroundColor: COLORS.accent,
  },
  modeIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  modeText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  modeTextActive: {
    color: COLORS.background,
  },
  inputArea: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  recognizedTextContainer: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    maxWidth: '90%',
  },
  recognizedText: {
    fontSize: FONTS.sizes.h3,
    color: COLORS.text,
    textAlign: 'center',
  },
  micButtonContainer: {
    marginVertical: SPACING.lg,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  micIcon: {
    fontSize: 48,
  },
  hint: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.background,
  },
});

export default VoiceOrTextInput;

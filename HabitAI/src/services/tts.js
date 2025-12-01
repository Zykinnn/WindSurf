/**
 * TTS Service - Text-to-Speech (озвучка текста)
 * Обёртка над react-native-tts
 */

import Tts from 'react-native-tts';
import { TTS_CONFIG } from '../utils/constants';

/**
 * TTS Service
 */
class TTSService {
  constructor() {
    this.isInitialized = false;
    this.isSpeaking = false;
    this.queue = [];
    this.currentSpeed = TTS_CONFIG.defaultSpeed;
    this.currentPitch = TTS_CONFIG.defaultPitch;
    this.language = TTS_CONFIG.language;

    this.init();
  }

  /**
   * Инициализация TTS
   */
  async init() {
    try {
      // Устанавливаем язык по умолчанию
      await Tts.setDefaultLanguage(this.language);

      // Устанавливаем скорость и pitch
      await Tts.setDefaultRate(this.currentSpeed);
      await Tts.setDefaultPitch(this.currentPitch);

      // Слушаем события
      Tts.addEventListener('tts-start', this.onStart);
      Tts.addEventListener('tts-finish', this.onFinish);
      Tts.addEventListener('tts-cancel', this.onCancel);
      Tts.addEventListener('tts-error', this.onError);

      this.isInitialized = true;
      console.log('TTS инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации TTS:', error);
    }
  }

  /**
   * Обработчики событий
   */
  onStart = (event) => {
    console.log('TTS начал говорить:', event);
    this.isSpeaking = true;
  };

  onFinish = (event) => {
    console.log('TTS закончил говорить:', event);
    this.isSpeaking = false;

    // Проверяем очередь
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.speak(next.text, next.options);
    }
  };

  onCancel = (event) => {
    console.log('TTS отменён:', event);
    this.isSpeaking = false;
  };

  onError = (event) => {
    console.error('Ошибка TTS:', event);
    this.isSpeaking = false;
  };

  /**
   * Подготовка текста для озвучки
   * Убираем markdown, заменяем эмодзи
   */
  prepareText(text) {
    return text
      // Убираем markdown
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      // Заменяем эмодзи на текст
      .replace(/🔥/g, 'огонь')
      .replace(/🎯/g, '')
      .replace(/🤖/g, '')
      .replace(/😊/g, '')
      .replace(/👍/g, 'супер')
      .replace(/💪/g, 'сила')
      .replace(/⭐/g, 'звезда')
      .replace(/✨/g, '')
      .replace(/🚀/g, '')
      // Добавляем паузы после точек
      .replace(/\./g, '. ')
      .replace(/!/g, '! ')
      .replace(/\?/g, '? ')
      .trim();
  }

  /**
   * Озвучить текст
   * @param {string} text - текст для озвучки
   * @param {object} options - опции
   */
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      console.warn('TTS не инициализирован');
      return;
    }

    const {
      speed = this.currentSpeed,
      pitch = this.currentPitch,
      language = this.language,
      queueMode = false, // Добавить в очередь или прервать текущее
    } = options;

    try {
      // Подготавливаем текст
      const preparedText = this.prepareText(text);

      if (!preparedText) {
        console.warn('Текст для озвучки пустой');
        return;
      }

      // Если уже говорит и режим очереди
      if (this.isSpeaking && queueMode) {
        this.queue.push({ text, options });
        console.log('Добавлено в очередь TTS');
        return;
      }

      // Если уже говорит и НЕ режим очереди - останавливаем
      if (this.isSpeaking && !queueMode) {
        await this.stop();
      }

      // Устанавливаем параметры
      if (speed !== this.currentSpeed) {
        await Tts.setDefaultRate(speed);
        this.currentSpeed = speed;
      }

      if (pitch !== this.currentPitch) {
        await Tts.setDefaultPitch(pitch);
        this.currentPitch = pitch;
      }

      // Озвучиваем
      await Tts.speak(preparedText, {
        iosVoiceId: 'com.apple.ttsbundle.Milena-compact', // Русский голос для iOS
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 1,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });

      console.log('TTS начал озвучивание');
    } catch (error) {
      console.error('Ошибка озвучивания:', error);
    }
  }

  /**
   * Остановить озвучку
   */
  async stop() {
    try {
      await Tts.stop();
      this.isSpeaking = false;
      this.queue = []; // Очищаем очередь
      console.log('TTS остановлен');
    } catch (error) {
      console.error('Ошибка остановки TTS:', error);
    }
  }

  /**
   * Пауза
   */
  async pause() {
    try {
      // react-native-tts не поддерживает паузу напрямую
      // Останавливаем озвучку
      await this.stop();
    } catch (error) {
      console.error('Ошибка паузы TTS:', error);
    }
  }

  /**
   * Установить скорость
   * @param {number} speed - скорость (0.5 - 2.0)
   */
  async setSpeed(speed) {
    if (speed < 0.5 || speed > 2.0) {
      console.warn('Скорость должна быть от 0.5 до 2.0');
      return;
    }

    try {
      await Tts.setDefaultRate(speed);
      this.currentSpeed = speed;
      console.log('Скорость TTS изменена:', speed);
    } catch (error) {
      console.error('Ошибка изменения скорости:', error);
    }
  }

  /**
   * Установить pitch (высоту голоса)
   * @param {number} pitch - pitch (0.5 - 2.0)
   */
  async setPitch(pitch) {
    if (pitch < 0.5 || pitch > 2.0) {
      console.warn('Pitch должен быть от 0.5 до 2.0');
      return;
    }

    try {
      await Tts.setDefaultPitch(pitch);
      this.currentPitch = pitch;
      console.log('Pitch TTS изменён:', pitch);
    } catch (error) {
      console.error('Ошибка изменения pitch:', error);
    }
  }

  /**
   * Установить язык
   * @param {string} language - код языка (ru-RU, en-US)
   */
  async setLanguage(language) {
    try {
      await Tts.setDefaultLanguage(language);
      this.language = language;
      console.log('Язык TTS изменён:', language);
    } catch (error) {
      console.error('Ошибка изменения языка:', error);
    }
  }

  /**
   * Получить доступные голоса
   */
  async getVoices() {
    try {
      const voices = await Tts.voices();
      return voices;
    } catch (error) {
      console.error('Ошибка получения голосов:', error);
      return [];
    }
  }

  /**
   * Проверка, говорит ли сейчас
   */
  isTTSSpeaking() {
    return this.isSpeaking;
  }

  /**
   * Очистить очередь
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Cleanup при размонтировании
   */
  destroy() {
    this.stop();
    Tts.removeEventListener('tts-start', this.onStart);
    Tts.removeEventListener('tts-finish', this.onFinish);
    Tts.removeEventListener('tts-cancel', this.onCancel);
    Tts.removeEventListener('tts-error', this.onError);
  }
}

// Singleton instance
const ttsService = new TTSService();

export default ttsService;

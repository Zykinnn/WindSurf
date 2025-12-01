/**
 * OnboardingScreen - Экран приветствия и первичной настройки
 * 3 слайда + ввод привычки
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, FONTS, SPACING } from '../theme/colors';
import { STORAGE_KEYS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

// Данные слайдов
const SLIDES = [
  {
    id: '1',
    emoji: '🎯',
    title: 'Внедри любую привычку\nза 66 дней',
    subtitle: 'AI-коуч поможет тебе не сдаться',
  },
  {
    id: '2',
    emoji: '🤖',
    title: 'Персональный\nAI-коуч 24/7',
    subtitle: 'Поддержка, мотивация,\nадаптация стратегии',
  },
  {
    id: '3',
    emoji: '🚀',
    title: 'С какой привычки\nначнём?',
    subtitle: 'Выбери удобный способ ввода',
    isInput: true,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  /**
   * Переход к следующему слайду
   */
  const goToNextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  /**
   * Обработка прокрутки
   */
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  /**
   * Пропустить онбординг (для тестирования)
   */
  const skipOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    // В реальности нужен перезапуск навигации
    // Пока просто логируем
    console.log('Онбординг пропущен');
  };

  /**
   * Обработка выбора режима ввода
   */
  const handleInputMode = (mode) => {
    console.log('Выбран режим:', mode);
    // TODO: Открыть голосовой/текстовый ввод
    // После ввода → отправить в Grog AI
    // Затем → завершить онбординг и перейти на Home
  };

  /**
   * Рендер одного слайда
   */
  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.content}>
          {/* Эмодзи */}
          <Text style={styles.emoji}>{item.emoji}</Text>

          {/* Заголовок */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Подзаголовок */}
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Кнопки ввода на последнем слайде */}
          {item.isInput && (
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.inputButton, styles.voiceButton]}
                onPress={() => handleInputMode('voice')}
                activeOpacity={0.8}
              >
                <Text style={styles.inputButtonEmoji}>🎤</Text>
                <Text style={styles.inputButtonText}>Сказать</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inputButton, styles.textButton]}
                onPress={() => handleInputMode('text')}
                activeOpacity={0.8}
              >
                <Text style={styles.inputButtonEmoji}>⌨️</Text>
                <Text style={styles.inputButtonText}>Написать</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Кнопка "Далее" (кроме последнего слайда) */}
        {!item.isInput && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={goToNextSlide}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Далее</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Индикатор точек
   */
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Кнопка "Пропустить" */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipOnboarding}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>Пропустить</Text>
      </TouchableOpacity>

      {/* Слайды */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Индикатор точек */}
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    zIndex: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.base,
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 100,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: FONTS.sizes.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  inputButtons: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    minWidth: 200,
  },
  voiceButton: {
    backgroundColor: COLORS.accent,
  },
  textButton: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  inputButtonEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  inputButtonText: {
    fontSize: FONTS.sizes.h2,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  nextButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: FONTS.sizes.h2,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.background,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: width,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;

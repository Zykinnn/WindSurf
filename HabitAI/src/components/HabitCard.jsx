/**
 * HabitCard - Карточка привычки с gesture handlers
 * Свайп вверх → выполнено, свайп вниз → пропущено
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme/colors';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100; // Порог для триггера действия

const HabitCard = ({ habit, onComplete, onSkip }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  /**
   * Haptic feedback
   */
  const triggerHaptic = (type = 'impactMedium') => {
    ReactNativeHapticFeedback.trigger(type);
  };

  /**
   * Gesture handler для свайпов
   */
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;

      // Haptic feedback при достижении порога
      if (Math.abs(event.translationY) > SWIPE_THRESHOLD) {
        runOnJS(triggerHaptic)('impactLight');
      }
    },
    onEnd: (event) => {
      const shouldComplete = event.translationY < -SWIPE_THRESHOLD;
      const shouldSkip = event.translationY > SWIPE_THRESHOLD;

      if (shouldComplete) {
        // Свайп вверх → выполнено
        runOnJS(triggerHaptic)('notificationSuccess');
        opacity.value = withSpring(0);
        translateY.value = withSpring(-height, {}, () => {
          runOnJS(onComplete)();
        });
      } else if (shouldSkip) {
        // Свайп вниз → пропущено
        runOnJS(triggerHaptic)('notificationWarning');
        opacity.value = withSpring(0);
        translateY.value = withSpring(height, {}, () => {
          runOnJS(onSkip)();
        });
      } else {
        // Возврат в исходное положение
        translateY.value = withSpring(0);
      }
    },
  });

  /**
   * Анимированные стили
   */
  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = `${translateY.value / 20}deg`;
    const scale = 1 - Math.abs(translateY.value) / 1000;

    return {
      transform: [
        { translateY: translateY.value },
        { rotateZ },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  /**
   * Цвет индикатора в зависимости от направления свайпа
   */
  const indicatorStyle = useAnimatedStyle(() => {
    if (translateY.value < -SWIPE_THRESHOLD) {
      return { backgroundColor: COLORS.success, opacity: 0.3 };
    } else if (translateY.value > SWIPE_THRESHOLD) {
      return { backgroundColor: COLORS.error, opacity: 0.3 };
    }
    return { backgroundColor: 'transparent', opacity: 0 };
  });

  if (!habit) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Создайте свою первую привычку</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Индикатор направления свайпа */}
      <Animated.View style={[styles.swipeIndicator, indicatorStyle]} />

      {/* Карточка привычки */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {/* День */}
          <View style={styles.dayContainer}>
            <Text style={styles.dayLabel}>День</Text>
            <Text style={styles.dayNumber}>
              {habit.currentDay}
              <Text style={styles.dayTotal}>/66</Text>
            </Text>
          </View>

          {/* Название привычки */}
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            {habit.tinyVersion && (
              <Text style={styles.tinyVersion}>{habit.tinyVersion}</Text>
            )}
          </View>

          {/* Время */}
          {habit.time && (
            <View style={styles.timeContainer}>
              <Text style={styles.timeIcon}>🕐</Text>
              <Text style={styles.timeText}>Сегодня {habit.time}</Text>
            </View>
          )}

          {/* Streak */}
          {habit.streak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>
                {habit.streak} {habit.streak === 1 ? 'день' : 'дней'} подряд
              </Text>
            </View>
          )}

          {/* Подсказки жестов */}
          <View style={styles.hintsContainer}>
            <View style={styles.hint}>
              <Text style={styles.hintArrow}>↑</Text>
              <Text style={styles.hintText}>Сделал</Text>
            </View>
            <View style={styles.hint}>
              <Text style={styles.hintArrow}>↓</Text>
              <Text style={styles.hintText}>Пропустил</Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    minHeight: 400,
    justifyContent: 'space-between',
    ...SHADOWS.large,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  emptyText: {
    fontSize: FONTS.sizes.h2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dayContainer: {
    alignSelf: 'flex-start',
  },
  dayLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: FONTS.weights.bold,
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },
  dayTotal: {
    fontSize: FONTS.sizes.h2,
    color: COLORS.textSecondary,
  },
  habitInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  habitName: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    lineHeight: 42,
    marginBottom: SPACING.md,
  },
  tinyVersion: {
    fontSize: FONTS.sizes.h3,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  timeText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  streakIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  streakText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.accent,
    fontWeight: FONTS.weights.semibold,
  },
  hintsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hint: {
    alignItems: 'center',
  },
  hintArrow: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  hintText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textTertiary,
  },
});

export default HabitCard;

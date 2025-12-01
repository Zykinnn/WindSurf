/**
 * HomeScreen - Главный экран с привычкой
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { COLORS, FONTS, SPACING, RADIUS } from '../theme/colors';
import HabitCard from '../components/HabitCard';
import useHabitStore from '../store/habitStore';
import grogService from '../services/grogAI';

const HomeScreen = ({ navigation }) => {
  const { currentHabit, loadHabit, markComplete, markSkipped } = useHabitStore();
  const [isLoading, setIsLoading] = useState(true);
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    initHabit();
  }, []);

  /**
   * Загрузка привычки
   */
  const initHabit = async () => {
    try {
      await loadHabit();
    } catch (error) {
      console.error('Ошибка загрузки привычки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработка выполнения привычки
   */
  const handleComplete = async () => {
    try {
      ReactNativeHapticFeedback.trigger('notificationSuccess');

      await markComplete();

      // Показываем поздравление
      showCelebration();
    } catch (error) {
      console.error('Ошибка отметки выполнения:', error);
    }
  };

  /**
   * Обработка пропуска привычки
   */
  const handleSkip = () => {
    setSkipModalVisible(true);
  };

  /**
   * Подтверждение пропуска с причиной
   */
  const confirmSkip = async () => {
    try {
      ReactNativeHapticFeedback.trigger('notificationWarning');

      await markSkipped(skipReason);

      // Получаем анализ от AI
      if (skipReason.trim()) {
        const analysis = await grogService.analyzeMissedDay(skipReason, {
          habitName: currentHabit?.name,
          currentDay: currentHabit?.currentDay,
          streak: currentHabit?.streak,
        });

        // Показываем анализ (можно добавить модалку или навигацию в чат)
        console.log('AI анализ:', analysis);
      }

      setSkipModalVisible(false);
      setSkipReason('');
    } catch (error) {
      console.error('Ошибка отметки пропуска:', error);
    }
  };

  /**
   * Показать празднование (TODO: добавить конфетти)
   */
  const showCelebration = () => {
    // TODO: Добавить анимацию конфетти
    console.log('🎉 Отлично! Продолжай в том же духе!');
  };

  /**
   * Рендер пустого состояния
   */
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎯</Text>
        <Text style={styles.emptyTitle}>Создайте первую привычку</Text>
        <Text style={styles.emptySubtitle}>
          Пройдите онбординг, чтобы начать
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Начать</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>HabitAI</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Progress')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Карточка привычки */}
      {currentHabit ? (
        <View style={styles.cardContainer}>
          <HabitCard
            habit={currentHabit}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </View>
      ) : (
        renderEmptyState()
      )}

      {/* Кнопка чата */}
      {currentHabit && (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat')}
          activeOpacity={0.8}
        >
          <Text style={styles.chatIcon}>💬</Text>
          <Text style={styles.chatText}>Поговорить с AI</Text>
        </TouchableOpacity>
      )}

      {/* Модалка пропуска */}
      <Modal
        visible={skipModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Почему пропустил?</Text>
            <Text style={styles.modalSubtitle}>
              AI поможет найти решение
            </Text>

            <TextInput
              style={styles.modalInput}
              value={skipReason}
              onChangeText={setSkipReason}
              placeholder="Расскажи, что помешало..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={200}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setSkipModalVisible(false);
                  setSkipReason('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={confirmSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextConfirm}>Готово</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONTS.sizes.h2,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h2,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONTS.sizes.h2,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.background,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  chatIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  chatText: {
    fontSize: FONTS.sizes.h3,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.h1,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.semibold,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  modalButtonTextConfirm: {
    fontSize: FONTS.sizes.base,
    color: COLORS.background,
    fontWeight: FONTS.weights.semibold,
  },
});

export default HomeScreen;

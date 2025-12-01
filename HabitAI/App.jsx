/**
 * HabitAI - AI-коуч для внедрения привычек за 66 дней
 * Главный компонент приложения
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import { STORAGE_KEYS } from './src/utils/constants';

// Игнорируем некритичные предупреждения
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Проверяем, прошёл ли пользователь онбординг
   */
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      );

      if (onboardingStatus === 'true') {
        setIsOnboardingCompleted(true);
      }
    } catch (error) {
      console.error('Ошибка проверки онбординга:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем пустой экран пока загружаем
  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A0A0A"
        translucent={false}
      />
      <AppNavigator isOnboardingCompleted={isOnboardingCompleted} />
    </GestureHandlerRootView>
  );
};

export default App;

/**
 * Главная навигация приложения HabitAI
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens (будут созданы позже)
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

/**
 * Main Navigator
 * Управляет переходами между экранами
 */
const AppNavigator = ({ isOnboardingCompleted }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Без header bar
          cardStyle: { backgroundColor: '#0A0A0A' }, // Фон экранов
          animationEnabled: true,
          gestureEnabled: true,
        }}
      >
        {!isOnboardingCompleted ? (
          // Если пользователь новый - показываем онбординг
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              gestureEnabled: false, // Нельзя свайпнуть назад
            }}
          />
        ) : (
          // Основной стек после онбординга
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                gestureEnabled: false, // Home - корневой экран
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                presentation: 'modal', // Модальное представление
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen
              name="Progress"
              component={ProgressScreen}
              options={{
                presentation: 'modal',
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                presentation: 'modal',
                gestureDirection: 'vertical', // Свайп вниз для закрытия
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

function Root() {
  const { language } = useLanguage();
  // Re-key the navigator on language change so every screen re-renders with the
  // new locale (i18n-js resolves strings at render time, not reactively).
  return (
    <NavigationContainer>
      <RootNavigator key={language} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Root />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

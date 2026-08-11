import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme';
import { useAppFonts } from '../theme/useAppFonts';

export default function RootLayout() {
  const { isLoading, restoreSession } = useAuthStore();
  const fontsReady = useAppFonts();

  useEffect(() => {
    restoreSession();
  }, []);

  // Hold the app back until the brand faces are ready, otherwise the first
  // frame renders in the system font and visibly reflows once Poppins lands.
  if (isLoading || !fontsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <Slot />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});